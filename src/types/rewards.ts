/** A single XP-earning event source. */
export type XpSource =
  | "workoutCompleted"
  | "setCompleted"
  | "proteinGoalHit"
  | "calorieGoalHit"
  | "checkIn"
  | "streakDay";

/** Persisted per-user progression state. */
export type UserStats = {
  xp: number;
  /** Current daily-activity streak, in days. */
  streak: number;
  longestStreak: number;
  /** Local date key (YYYY-MM-DD) of the last day that counted toward activity. */
  lastActiveDate?: string;
  /** Ids of unlocked achievements. */
  achievements: string[];
  /** Lifetime counters used for achievement checks. */
  totals: {
    workouts: number;
    volumeKg: number;
    checkIns: number;
  };
};

export const EMPTY_STATS: UserStats = {
  xp: 0,
  streak: 0,
  longestStreak: 0,
  achievements: [],
  totals: { workouts: 0, volumeKg: 0, checkIns: 0 },
};

/** Definition of an unlockable achievement. */
export type Achievement = {
  id: string;
  title: string;
  description: string;
  /** lucide-react icon name, resolved in the UI. */
  icon: string;
  /** True when the stats satisfy this achievement. */
  isUnlocked: (stats: UserStats) => boolean;
};

export type LevelInfo = {
  level: number;
  /** XP accumulated within the current level. */
  xpIntoLevel: number;
  /** XP span of the current level. */
  xpForLevel: number;
  /** 0–1 progress toward the next level. */
  progress: number;
  /** Total XP needed to reach the next level from zero. */
  nextLevelAtXp: number;
};
