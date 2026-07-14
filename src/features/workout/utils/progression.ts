import type {
  ExerciseDefinition,
  WorkoutSet,
} from "@/types/workout";

export type ProgressionSuggestion = {
  weight: number;
  reps: number;
  reason:
    | "increase_weight"
    | "increase_reps"
    | "maintain"
    | "deload";
};

function estimateOneRepMax(weight: number, reps: number) {
  return weight * (1 + reps / 30);
}

export function getProgressionSuggestion(
  exercise: ExerciseDefinition,
  previousSets: WorkoutSet[]
): ProgressionSuggestion | null {
  const completed = previousSets.filter((set) => set.completed);

  if (!completed.length) return null;

  const best = [...completed].sort(
    (a, b) =>
      estimateOneRepMax(b.weight, b.reps) -
      estimateOneRepMax(a.weight, a.reps)
  )[0];

  const progression = exercise.progression ?? {
    minReps: exercise.defaultReps,
    maxReps: exercise.defaultReps + 2,
    weightStep: 2.5,
  };

  if (best.reps >= progression.maxReps) {
    return {
      weight: best.weight + progression.weightStep,
      reps: progression.minReps,
      reason: "increase_weight",
    };
  }

  return {
    weight: best.weight,
    reps: best.reps + 1,
    reason: "increase_reps",
  };
}