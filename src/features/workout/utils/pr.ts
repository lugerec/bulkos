import type { WorkoutLog } from "@/store/workoutHistoryStore";

export type PersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  type: "maxWeight" | "repPR";
  weight: number;
  reps: number;
};

export function findSetPRs(params: {
  workouts: WorkoutLog[];
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
}): PersonalRecord[] {
  const { workouts, exerciseId, exerciseName, weight, reps } = params;

  const previousSets = workouts
    .flatMap((workout) => workout.exercises ?? [])
    .filter((exercise) => exercise.id === exerciseId)
    .flatMap((exercise) => exercise.sets)
    .filter((set) => set.completed);

  const previousMaxWeight = previousSets.reduce(
    (max, set) => Math.max(max, set.weight),
    0
  );

  const previousBestRepsAtWeight = previousSets
    .filter((set) => set.weight === weight)
    .reduce((max, set) => Math.max(max, set.reps), 0);

  const records: PersonalRecord[] = [];

  if (weight > previousMaxWeight) {
    records.push({
      exerciseId,
      exerciseName,
      type: "maxWeight",
      weight,
      reps,
    });
  }

  if (reps > previousBestRepsAtWeight) {
    records.push({
      exerciseId,
      exerciseName,
      type: "repPR",
      weight,
      reps,
    });
  }

  return records;
}