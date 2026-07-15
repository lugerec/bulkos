import type { Sex } from "@/types/profile";

/** Epley estimated one-rep max — the same formula used across the app. */
export function estimateOneRepMax(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;

  return weight * (1 + reps / 30);
}

export type StrengthLevel =
  | "beginner"
  | "novice"
  | "intermediate"
  | "advanced"
  | "elite";

export const STRENGTH_LEVELS: readonly StrengthLevel[] = [
  "beginner",
  "novice",
  "intermediate",
  "advanced",
  "elite",
];

/**
 * Bodyweight-ratio thresholds (est. 1RM ÷ body weight) for the big lifts,
 * approximated from common strength-standard tables. Each array is the
 * lower bound to *reach* novice/intermediate/advanced/elite respectively;
 * below the first value is "beginner".
 */
const RATIO_THRESHOLDS: Record<
  string,
  Record<Sex, [number, number, number, number]>
> = {
  "bench-press": {
    male: [0.75, 1.0, 1.5, 2.0],
    female: [0.5, 0.7, 1.0, 1.4],
  },
  squat: {
    male: [1.0, 1.25, 1.75, 2.5],
    female: [0.7, 1.0, 1.4, 2.0],
  },
  deadlift: {
    male: [1.25, 1.5, 2.0, 2.75],
    female: [1.0, 1.25, 1.75, 2.4],
  },
  "overhead-press": {
    male: [0.5, 0.65, 0.9, 1.25],
    female: [0.35, 0.45, 0.65, 0.9],
  },
};

/** Exercise ids that have a strength standard (aliases mapped to these). */
export const STANDARD_EXERCISE_IDS = Object.keys(RATIO_THRESHOLDS);

export type StrengthStandard = {
  exerciseId: string;
  est1RM: number;
  ratio: number;
  level: StrengthLevel;
  /** est. 1RM (kg) needed to reach the next level; null at elite */
  nextLevel: StrengthLevel | null;
  nextLevelWeightKg: number | null;
};

function levelFromRatio(
  ratio: number,
  thresholds: [number, number, number, number]
): StrengthLevel {
  if (ratio >= thresholds[3]) return "elite";
  if (ratio >= thresholds[2]) return "advanced";
  if (ratio >= thresholds[1]) return "intermediate";
  if (ratio >= thresholds[0]) return "novice";

  return "beginner";
}

/**
 * Strength standard for one lift: current level from est. 1RM ÷ body
 * weight, and the est. 1RM needed for the next level. Returns null when
 * the exercise has no standard or inputs are invalid.
 */
export function getStrengthStandard(
  exerciseId: string,
  est1RM: number,
  bodyweightKg: number,
  sex: Sex
): StrengthStandard | null {
  const thresholds = RATIO_THRESHOLDS[exerciseId]?.[sex];

  if (!thresholds || est1RM <= 0 || bodyweightKg <= 0) return null;

  const ratio = est1RM / bodyweightKg;
  const level = levelFromRatio(ratio, thresholds);
  const levelIndex = STRENGTH_LEVELS.indexOf(level);

  const nextLevel =
    levelIndex < STRENGTH_LEVELS.length - 1
      ? STRENGTH_LEVELS[levelIndex + 1]
      : null;

  // thresholds[i] is the ratio needed to reach STRENGTH_LEVELS[i+1].
  const nextRatio = nextLevel ? thresholds[levelIndex] : null;

  return {
    exerciseId,
    est1RM: Math.round(est1RM),
    ratio: Math.round(ratio * 100) / 100,
    level,
    nextLevel,
    nextLevelWeightKg:
      nextRatio !== null ? Math.round(nextRatio * bodyweightKg) : null,
  };
}
