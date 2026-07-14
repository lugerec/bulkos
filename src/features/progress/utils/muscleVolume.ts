import { exerciseDefinitions } from "@/data/exercises";
import { getEffectiveSetWeight } from "@/features/workout/utils/setVolume";
import type {
  MuscleGroup,
  WorkoutExercise,
} from "@/types/workout";

export type MuscleVolumeItem = {
  muscle: MuscleGroup;
  volume: number;
};

type MuscleVolumeWorkout = {
  exercises?: WorkoutExercise[];
};

export function getMuscleVolume(
  workouts: readonly MuscleVolumeWorkout[],
  bodyweightKg?: number
): MuscleVolumeItem[] {
  const totals = new Map<MuscleGroup, number>();

  for (const workout of workouts) {
    for (const exercise of workout.exercises ?? []) {
      const definitionId = exercise.exerciseId ?? exercise.id;

      const definition = exerciseDefinitions.find(
        (item) => item.id === definitionId
      );

      if (!definition) continue;

      const exerciseVolume = exercise.sets.reduce((sum, set) => {
        if (!set.completed) return sum;

        return (
          sum +
          getEffectiveSetWeight(definition.equipment, set.weight, bodyweightKg) *
            set.reps
        );
      }, 0);

      if (exerciseVolume <= 0) continue;

      const activation = definition.activation ?? {
        [definition.primaryMuscle]: 100,
      };

      for (const [muscle, percentage] of Object.entries(activation)) {
        if (typeof percentage !== "number" || percentage <= 0) {
          continue;
        }

        const weightedVolume =
          exerciseVolume * (Math.min(percentage, 100) / 100);

        const muscleGroup = muscle as MuscleGroup;

        totals.set(
          muscleGroup,
          (totals.get(muscleGroup) ?? 0) + weightedVolume
        );
      }
    }
  }

  return Array.from(totals.entries())
    .map(([muscle, volume]) => ({
      muscle,
      volume: Math.round(volume),
    }))
    .sort((a, b) => b.volume - a.volume);
}