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

  // Best set reached the top of the rep range: add weight, reset reps.
  if (best.reps >= progression.maxReps) {
    // If that top-range set was flagged "easy", jump two steps to progress
    // faster; if "hard", the single step is already right.
    const steps = best.effort === "easy" ? 2 : 1;

    return {
      weight: best.weight + progression.weightStep * steps,
      reps: progression.minReps,
      reason: "increase_weight",
    };
  }

  // Best set fell well short of the minimum (2+ reps under): a sign of too
  // much fatigue — back the weight off one step and rebuild.
  if (best.reps < progression.minReps - 1 && best.weight > progression.weightStep) {
    return {
      weight: best.weight - progression.weightStep,
      reps: progression.minReps,
      reason: "deload",
    };
  }

  // Best set was just under the minimum: repeat the same load and aim to
  // hit the bottom of the range before adding reps.
  if (best.reps < progression.minReps) {
    return {
      weight: best.weight,
      reps: progression.minReps,
      reason: "maintain",
    };
  }

  // Inside the rep range. If the set felt hard, repeat it to consolidate
  // before adding volume; otherwise add a rep.
  if (best.effort === "hard") {
    return {
      weight: best.weight,
      reps: best.reps,
      reason: "maintain",
    };
  }

  return {
    weight: best.weight,
    reps: best.reps + 1,
    reason: "increase_reps",
  };
}