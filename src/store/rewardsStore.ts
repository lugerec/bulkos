import { create } from "zustand";

import { EMPTY_STATS, type UserStats } from "@/types/rewards";
import { getUserStats, saveUserStats } from "@/services/rewardsService";
import { upsertPublicProfile } from "@/services/socialService";
import { advanceStreak, newlyUnlocked, levelFromXp } from "@/features/rewards/gamification";
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

  loadStats: () => Promise<void>;
  recordActivity: (input: ActivityInput) => Promise<void>;
  /** Achievement ids + new level to celebrate; cleared once shown. */
  clearCelebration: () => void;
};

function currentUid(): string | null {
  return useAuthStore.getState().user?.uid ?? null;
}

/** Mirror progression to the publicly-readable profile for friends/leaderboards. */
function mirrorPublicProfile(uid: string, stats: UserStats) {
  const authProfile = useAuthStore.getState().profile as
    | { profile?: { name?: string } }
    | null;
  const displayName = authProfile?.profile?.name?.trim() || "Athlete";

  upsertPublicProfile(uid, {
    displayName,
    level: levelFromXp(stats.xp).level,
    xp: stats.xp,
    streak: stats.streak,
  }).catch(() => {
    // Non-fatal — the mirror will refresh on the next activity/load.
  });
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  stats: { ...EMPTY_STATS },
  loaded: false,
  justUnlocked: [],
  justLeveledUp: null,

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
}));
