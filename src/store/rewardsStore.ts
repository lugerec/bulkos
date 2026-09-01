import { create } from "zustand";

import { EMPTY_STATS, type UserStats } from "@/types/rewards";
import { getUserStats, saveUserStats } from "@/services/rewardsService";
import { upsertPublicProfile, publishActivity } from "@/services/socialService";
import {
  advanceStreak,
  newlyUnlocked,
  levelFromXp,
  canAwardDailyGoal,
  XP_REWARDS,
  CARDIO_MIN_METERS,
} from "@/features/rewards/gamification";
import { getTodayKey } from "@/lib/date";
import { useAuthStore } from "./authStore";

/** Deltas applied by an activity event. */
type ActivityInput = {
  /** Raw XP earned from the action(s), before the streak-day bonus. */
  xp?: number;
  workouts?: number;
  volumeKg?: number;
  checkIns?: number;
  /** Counts this action toward the daily streak (default true). */
  countsForStreak?: boolean;
  /** XP granted for extending the streak to a new day. */
  streakDayXp?: number;
};

type RewardsState = {
  stats: UserStats;
  loaded: boolean;
  /** Achievement ids unlocked by the most recent activity, for celebration UI. */
  justUnlocked: string[];
  /** The new level reached by the most recent activity, or null. */
  justLeveledUp: number | null;
  /** In-memory guard: the day we already checked/awarded the daily goal. */
  goalCheckedDate: string | null;
  /** In-memory guard: the day we already checked/awarded cardio. */
  cardioCheckedDate: string | null;
  /** In-memory guard: the week-start we already checked the weekly bonus. */
  weekBonusChecked: string | null;

  loadStats: () => Promise<void>;
  recordActivity: (input: ActivityInput) => Promise<void>;
  /** Award daily-goal XP once per day when the protein goal is met. */
  recordDailyGoal: (input: {
    proteinHit: boolean;
    calorieHit: boolean;
  }) => Promise<void>;
  /** Award cardio XP once per day when today's Health distance clears the bar. */
  recordCardio: (distanceMeters: number) => Promise<void>;
  /** Award a one-off weekly bonus the first time the weekly goal is hit. */
  recordWeeklyGoal: (weekStartKey: string) => Promise<void>;
  /** Achievement ids + new level to celebrate; cleared once shown. */
  clearCelebration: () => void;
};

function currentUid(): string | null {
  return useAuthStore.getState().user?.uid ?? null;
}

/** Last mirrored public-profile signature, to avoid redundant writes. */
let lastMirrorSignature: string | null = null;

/** Mirror progression to the publicly-readable profile for friends/leaderboards. */
function mirrorPublicProfile(uid: string, stats: UserStats) {
  const authProfile = useAuthStore.getState().profile as
    | { profile?: { name?: string } }
    | null;
  const displayName = authProfile?.profile?.name?.trim() || "Athlete";

  const level = levelFromXp(stats.xp).level;

  // Skip the write when nothing friends can see has changed — loadStats runs
  // on every dashboard open, and re-writing identical values each time is
  // needless Firestore traffic.
  const signature = `${uid}:${level}:${stats.xp}:${stats.streak}:${displayName}`;
  if (signature === lastMirrorSignature) return;
  lastMirrorSignature = signature;

  upsertPublicProfile(uid, {
    displayName,
    level,
    xp: stats.xp,
    streak: stats.streak,
  }).catch(() => {
    // Non-fatal — the mirror will refresh on the next activity/load.
    lastMirrorSignature = null;
  });
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  stats: { ...EMPTY_STATS },
  loaded: false,
  justUnlocked: [],
  justLeveledUp: null,
  goalCheckedDate: null,
  cardioCheckedDate: null,
  weekBonusChecked: null,

  loadStats: async () => {
    const uid = currentUid();
    if (!uid) return;

    try {
      const stats = await getUserStats(uid);
      set({ stats, loaded: true });
      mirrorPublicProfile(uid, stats);
    } catch {
      // Non-critical — progression simply won't show until a later load.
    }
  },

  recordActivity: async (input) => {
    const uid = currentUid();
    if (!uid) return;

    // Read the authoritative stats first so we never overwrite prior XP when
    // local state hasn't loaded yet (e.g. finishing a workout on a fresh open).
    let prev = get().stats;
    try {
      prev = await getUserStats(uid);
    } catch {
      // Fall back to whatever is in memory.
    }

    const todayKey = getTodayKey();

    const {
      streak,
      countsAsNewDay,
    } = input.countsForStreak === false
      ? { streak: prev.streak, countsAsNewDay: false }
      : advanceStreak(prev.lastActiveDate, todayKey, prev.streak);

    const streakBonus = countsAsNewDay ? input.streakDayXp ?? 0 : 0;

    const next: UserStats = {
      ...prev,
      xp: prev.xp + (input.xp ?? 0) + streakBonus,
      streak,
      longestStreak: Math.max(prev.longestStreak, streak),
      lastActiveDate:
        input.countsForStreak === false ? prev.lastActiveDate : todayKey,
      totals: {
        workouts: prev.totals.workouts + (input.workouts ?? 0),
        volumeKg: prev.totals.volumeKg + (input.volumeKg ?? 0),
        checkIns: prev.totals.checkIns + (input.checkIns ?? 0),
      },
      achievements: prev.achievements,
    };

    const fresh = newlyUnlocked(next);
    next.achievements = [...prev.achievements, ...fresh];

    const leveledUp =
      levelFromXp(next.xp).level > levelFromXp(prev.xp).level
        ? levelFromXp(next.xp).level
        : null;

    if (leveledUp !== null) {
      publishActivity(uid, "levelUp", `Reached level ${leveledUp}`).catch(
        () => {}
      );
    }

    // Streak milestones are worth sharing; only on the day they're reached.
    if (
      next.streak !== prev.streak &&
      [7, 14, 30, 50, 100].includes(next.streak)
    ) {
      publishActivity(uid, "streak", `${next.streak}-day streak`).catch(
        () => {}
      );
    }

    // Optimistic: reflect immediately, persist in the background.
    set({
      stats: next,
      loaded: true,
      justUnlocked: fresh,
      justLeveledUp: leveledUp,
    });

    try {
      await saveUserStats(uid, next);
    } catch {
      // Local state already reflects the change; a later load will resync.
    }

    mirrorPublicProfile(uid, next);
  },

  clearCelebration: () => set({ justUnlocked: [], justLeveledUp: null }),

  recordDailyGoal: async ({ proteinHit, calorieHit }) => {
    const uid = currentUid();
    if (!uid || !proteinHit) return;

    const todayKey = getTodayKey();

    // In-memory guard: don't hit Firestore repeatedly once handled today.
    if (get().goalCheckedDate === todayKey) return;

    let prev = get().stats;
    try {
      prev = await getUserStats(uid);
    } catch {
      // fall back to in-memory
    }

    // Persistent guard: already awarded today.
    if (!canAwardDailyGoal(prev.lastGoalAwardDate, todayKey)) {
      set({ goalCheckedDate: todayKey });
      return;
    }

    const { streak, countsAsNewDay } = advanceStreak(
      prev.lastActiveDate,
      todayKey,
      prev.streak
    );

    const xpGained =
      XP_REWARDS.proteinGoalHit +
      (calorieHit ? XP_REWARDS.calorieGoalHit : 0) +
      (countsAsNewDay ? XP_REWARDS.streakDay : 0);

    const next: UserStats = {
      ...prev,
      xp: prev.xp + xpGained,
      streak,
      longestStreak: Math.max(prev.longestStreak, streak),
      lastActiveDate: todayKey,
      lastGoalAwardDate: todayKey,
      achievements: prev.achievements,
    };

    const fresh = newlyUnlocked(next);
    next.achievements = [...prev.achievements, ...fresh];

    const leveledUp =
      levelFromXp(next.xp).level > levelFromXp(prev.xp).level
        ? levelFromXp(next.xp).level
        : null;

    set({
      stats: next,
      loaded: true,
      justUnlocked: fresh,
      justLeveledUp: leveledUp,
      goalCheckedDate: todayKey,
    });

    try {
      await saveUserStats(uid, next);
    } catch {
      // local reflects it; resync later
    }

    mirrorPublicProfile(uid, next);
  },

  recordCardio: async (distanceMeters) => {
    const uid = currentUid();
    if (!uid || distanceMeters < CARDIO_MIN_METERS) return;

    const todayKey = getTodayKey();
    if (get().cardioCheckedDate === todayKey) return;

    let prev = get().stats;
    try {
      prev = await getUserStats(uid);
    } catch {
      // fall back to in-memory
    }

    if (!canAwardDailyGoal(prev.lastCardioAwardDate, todayKey)) {
      set({ cardioCheckedDate: todayKey });
      return;
    }

    const { streak, countsAsNewDay } = advanceStreak(
      prev.lastActiveDate,
      todayKey,
      prev.streak
    );

    const xpGained =
      XP_REWARDS.cardioLogged + (countsAsNewDay ? XP_REWARDS.streakDay : 0);

    const next: UserStats = {
      ...prev,
      xp: prev.xp + xpGained,
      streak,
      longestStreak: Math.max(prev.longestStreak, streak),
      lastActiveDate: todayKey,
      lastCardioAwardDate: todayKey,
      achievements: prev.achievements,
    };

    const fresh = newlyUnlocked(next);
    next.achievements = [...prev.achievements, ...fresh];

    const leveledUp =
      levelFromXp(next.xp).level > levelFromXp(prev.xp).level
        ? levelFromXp(next.xp).level
        : null;

    set({
      stats: next,
      loaded: true,
      justUnlocked: fresh,
      justLeveledUp: leveledUp,
      cardioCheckedDate: todayKey,
    });

    try {
      await saveUserStats(uid, next);
    } catch {
      // local reflects it; resync later
    }

    mirrorPublicProfile(uid, next);
  },

  recordWeeklyGoal: async (weekStartKey) => {
    const uid = currentUid();
    if (!uid) return;

    if (get().weekBonusChecked === weekStartKey) return;

    let prev = get().stats;
    try {
      prev = await getUserStats(uid);
    } catch {
      // fall back to in-memory
    }

    // One bonus per week.
    if (prev.lastWeekBonusDate === weekStartKey) {
      set({ weekBonusChecked: weekStartKey });
      return;
    }

    const next: UserStats = {
      ...prev,
      xp: prev.xp + XP_REWARDS.weeklyGoal,
      lastWeekBonusDate: weekStartKey,
      achievements: prev.achievements,
    };

    const fresh = newlyUnlocked(next);
    next.achievements = [...prev.achievements, ...fresh];

    const leveledUp =
      levelFromXp(next.xp).level > levelFromXp(prev.xp).level
        ? levelFromXp(next.xp).level
        : null;

    set({
      stats: next,
      loaded: true,
      justUnlocked: fresh,
      justLeveledUp: leveledUp,
      weekBonusChecked: weekStartKey,
    });

    try {
      await saveUserStats(uid, next);
    } catch {
      // local reflects it; resync later
    }

    mirrorPublicProfile(uid, next);
  },
}));
