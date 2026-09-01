import { addDaysToKey } from "@/lib/date";
import type {
  Achievement,
  LevelInfo,
  UserStats,
  XpSource,
} from "@/types/rewards";

/**
 * XP granted per event. Deliberately small and legible so progression feels
 * earned but steady — a solid session lands roughly one level early on.
 */
export const XP_REWARDS: Record<XpSource, number> = {
  workoutCompleted: 60,
  setCompleted: 3,
  proteinGoalHit: 25,
  calorieGoalHit: 15,
  checkIn: 20,
  streakDay: 10,
};

/**
 * Cumulative XP required to *reach* a level (level 1 starts at 0). The per-level
 * cost grows by 50 each level: 100, 150, 200, … so early levels come quickly
 * and later ones ask for more. Closed form of that arithmetic series:
 *   C(L) = 100·(L-1) + 25·(L-1)·(L-2)
 */
export function xpToReachLevel(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  return 100 * n + 25 * n * (n - 1);
}

/** Full level breakdown for a given XP total. */
export function levelFromXp(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp));

  let level = 1;
  while (xpToReachLevel(level + 1) <= safeXp) {
    level += 1;
  }

  const base = xpToReachLevel(level);
  const nextLevelAtXp = xpToReachLevel(level + 1);
  const xpForLevel = nextLevelAtXp - base;
  const xpIntoLevel = safeXp - base;
  const progress = xpForLevel > 0 ? xpIntoLevel / xpForLevel : 0;

  return { level, xpIntoLevel, xpForLevel, progress, nextLevelAtXp };
}

/**
 * Advance a daily-activity streak given the last active day and today.
 * - same day → unchanged (activity already counted today)
 * - yesterday → +1
 * - any older gap (or first ever) → reset to 1
 * `countsAsNewDay` is true only when today newly counts, so callers know
 * whether to award the daily streak bonus.
 */
export function advanceStreak(
  lastActiveDate: string | undefined,
  todayKey: string,
  currentStreak: number
): { streak: number; countsAsNewDay: boolean } {
  if (lastActiveDate === todayKey) {
    return { streak: Math.max(1, currentStreak), countsAsNewDay: false };
  }

  if (lastActiveDate && addDaysToKey(lastActiveDate, 1) === todayKey) {
    return { streak: currentStreak + 1, countsAsNewDay: true };
  }

  return { streak: 1, countsAsNewDay: true };
}

/** The full achievement catalogue. Order is display order. */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-workout",
    title: "First Rep",
    description: "Complete your first workout",
    icon: "Dumbbell",
    isUnlocked: (s) => s.totals.workouts >= 1,
  },
  {
    id: "ten-workouts",
    title: "Consistent",
    description: "Complete 10 workouts",
    icon: "CalendarCheck",
    isUnlocked: (s) => s.totals.workouts >= 10,
  },
  {
    id: "fifty-workouts",
    title: "Iron Habit",
    description: "Complete 50 workouts",
    icon: "Medal",
    isUnlocked: (s) => s.totals.workouts >= 50,
  },
  {
    id: "streak-7",
    title: "Week Streak",
    description: "Stay active 7 days in a row",
    icon: "Flame",
    isUnlocked: (s) => s.longestStreak >= 7,
  },
  {
    id: "streak-30",
    title: "Unstoppable",
    description: "Stay active 30 days in a row",
    icon: "Zap",
    isUnlocked: (s) => s.longestStreak >= 30,
  },
  {
    id: "volume-10k",
    title: "Ten Tonne",
    description: "Lift 10,000 kg of total volume",
    icon: "Anvil",
    isUnlocked: (s) => s.totals.volumeKg >= 10_000,
  },
  {
    id: "volume-100k",
    title: "Century Tonne",
    description: "Lift 100,000 kg of total volume",
    icon: "Mountain",
    isUnlocked: (s) => s.totals.volumeKg >= 100_000,
  },
  {
    id: "level-10",
    title: "Double Digits",
    description: "Reach level 10",
    icon: "Star",
    isUnlocked: (s) => levelFromXp(s.xp).level >= 10,
  },
  {
    id: "check-in-10",
    title: "Tracked",
    description: "Log 10 body check-ins",
    icon: "LineChart",
    isUnlocked: (s) => s.totals.checkIns >= 10,
  },
];

/** Whether a daily-goal award may still be granted today (once per day). */
export function canAwardDailyGoal(
  lastGoalAwardDate: string | undefined,
  todayKey: string
): boolean {
  return lastGoalAwardDate !== todayKey;
}

/** All achievement ids currently satisfied by these stats. */
export function unlockedAchievementIds(stats: UserStats): string[] {
  return ACHIEVEMENTS.filter((a) => a.isUnlocked(stats)).map((a) => a.id);
}

/** Achievement ids newly satisfied compared with what's already recorded. */
export function newlyUnlocked(stats: UserStats): string[] {
  const already = new Set(stats.achievements);
  return unlockedAchievementIds(stats).filter((id) => !already.has(id));
}
