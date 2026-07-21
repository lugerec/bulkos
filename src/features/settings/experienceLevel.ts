import type { ExperienceLevel } from "@/types/profile";

/**
 * Which optional UI sections an experience level reveals. Beginners see a
 * focused "what to train today" view; each step up unlocks more analysis.
 * These are the *defaults* — a `custom` user overrides them individually.
 */
export type FeatureFlags = {
  /** Progress charts (volume/bodyweight/exercise trends). */
  charts: boolean;
  /** Deep analytics: effort strain, muscle balance, 1RM estimates, standards. */
  analytics: boolean;
  /** Per-set effort (RPE) rating during a workout. */
  effortRating: boolean;
  /** Streak, weekly-volume comparisons, PR call-outs on the dashboard. */
  advancedDashboard: boolean;
};

export type LevelConfig = {
  label: string;
  blurb: string;
  features: FeatureFlags;
  /**
   * Training bias applied to generated/recommended workouts.
   * `setBias` scales suggested set counts; `rirFloor` is how many reps in
   * reserve to leave (higher = more conservative for beginners).
   */
  training: {
    setBias: number;
    rirFloor: number;
  };
};

const ALL_ON: FeatureFlags = {
  charts: true,
  analytics: true,
  effortRating: true,
  advancedDashboard: true,
};

const ALL_OFF: FeatureFlags = {
  charts: false,
  analytics: false,
  effortRating: false,
  advancedDashboard: false,
};

export const LEVEL_CONFIG: Record<ExperienceLevel, LevelConfig> = {
  beginner: {
    label: "Beginner",
    blurb:
      "Just tell me what to train and how hard. No charts or deep stats yet.",
    features: {
      ...ALL_OFF,
    },
    // Fewer sets, leave more in the tank — build the habit and form first.
    training: { setBias: 0.8, rirFloor: 3 },
  },
  intermediate: {
    label: "Intermediate",
    blurb: "Show my progress and volume, keep the deep analytics tucked away.",
    features: {
      charts: true,
      analytics: false,
      effortRating: true,
      advancedDashboard: true,
    },
    training: { setBias: 1, rirFloor: 2 },
  },
  advanced: {
    label: "Advanced",
    blurb: "Give me everything — effort strain, muscle balance, 1RM, the lot.",
    features: { ...ALL_ON },
    training: { setBias: 1.1, rirFloor: 1 },
  },
  custom: {
    label: "Custom",
    blurb: "I'll choose which sections to show myself.",
    // Custom starts from a sensible middle; the user tweaks flags in settings.
    features: {
      charts: true,
      analytics: false,
      effortRating: true,
      advancedDashboard: true,
    },
    training: { setBias: 1, rirFloor: 2 },
  },
};

/** The level to assume when a profile predates the feature. */
export const DEFAULT_LEVEL: ExperienceLevel = "intermediate";

export function getLevelConfig(
  level: ExperienceLevel | undefined
): LevelConfig {
  return LEVEL_CONFIG[level ?? DEFAULT_LEVEL];
}

/** Convenience: resolve the feature flags for a level. */
export function getFeatureFlags(
  level: ExperienceLevel | undefined
): FeatureFlags {
  return getLevelConfig(level).features;
}
