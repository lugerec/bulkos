import {
  estimateOneRepMax,
  getStrengthStandard,
  STANDARD_EXERCISE_IDS,
  type StrengthStandard,
} from "@/lib/strengthStandards";
import type { Sex } from "@/types/profile";
import type {
  RecommendationWorkout,
} from "@/features/workout/utils/workoutRecommendation";

/**
 * Best estimated 1RM achieved per standard lift across all history, from
 * completed loaded sets. Only the four lifts with strength standards are
 * considered.
 */
export function getBestOneRepMaxes(
  workouts: readonly RecommendationWorkout[]
): Map<string, number> {
  const best = new Map<string, number>();

  for (const workout of workouts) {
    for (const exercise of workout.exercises ?? []) {
      const exerciseId = exercise.exerciseId ?? exercise.id;

      if (!STANDARD_EXERCISE_IDS.includes(exerciseId)) continue;

      for (const set of exercise.sets) {
        if (!set.completed || set.weight <= 0) continue;

        const est = estimateOneRepMax(set.weight, set.reps);

        best.set(exerciseId, Math.max(best.get(exerciseId) ?? 0, est));
      }
    }
  }

  return best;
}

/**
 * Strength standards for every standard lift the user has trained, given
 * their latest body weight and sex.
 */
export function getStrengthStandards(
  workouts: readonly RecommendationWorkout[],
  bodyweightKg: number,
  sex: Sex
): StrengthStandard[] {
  const best = getBestOneRepMaxes(workouts);

  return STANDARD_EXERCISE_IDS.flatMap((exerciseId) => {
    const est1RM = best.get(exerciseId);

    if (est1RM === undefined) return [];

    const standard = getStrengthStandard(
      exerciseId,
      est1RM,
      bodyweightKg,
      sex
    );

    return standard ? [standard] : [];
  });
}
