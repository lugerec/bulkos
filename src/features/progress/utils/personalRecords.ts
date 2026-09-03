import { estimateOneRepMax } from "@/features/analytics/proAnalytics";
import type { WorkoutLog } from "@/store/workoutHistoryStore";

export type StrengthPR = {
  exerciseId: string;
  lift: string;
  pr: string;
  date: string;
  weight: number;
  reps: number;
  score: number;
};

/**
 * Best-ever set per exercise across the full workout history, ranked by
 * estimated 1RM (best first). Used both for the Progress screen's top-4
 * preview and the full "All Personal Records" list, so the two can never
 * disagree on what counts as a PR.
 */
export function getAllStrengthPRs(
  workouts: readonly WorkoutLog[]
): StrengthPR[] {
  const bestByExercise = new Map<string, StrengthPR>();

  for (const workout of workouts) {
    for (const exercise of workout.exercises ?? []) {
      for (const set of exercise.sets) {
        if (!set.completed || set.weight <= 0) continue;

        const score = estimateOneRepMax(set.weight, set.reps);
        const current = bestByExercise.get(exercise.id);

        if (!current || score > current.score) {
          bestByExercise.set(exercise.id, {
            exerciseId: exercise.id,
            lift: exercise.name,
            pr: `${set.weight} kg × ${set.reps}`,
            date: workout.date,
            weight: set.weight,
            reps: set.reps,
            score,
          });
        }
      }
    }
  }

  return Array.from(bestByExercise.values()).sort((a, b) => b.score - a.score);
}
