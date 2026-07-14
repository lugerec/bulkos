import type { ExerciseDefinition } from "@/types/workout";

export function getExerciseThumbnail(exercise: ExerciseDefinition) {
  return (
    exercise.media?.thumbnail ??
    exercise.media?.gif ??
    exercise.media?.video ??
    null
  );
}

export function getExerciseAnimation(exercise: ExerciseDefinition) {
  return exercise.media?.gif ?? exercise.media?.video ?? null;
}

export function hasExerciseMedia(exercise: ExerciseDefinition) {
  return Boolean(
    exercise.media?.thumbnail ||
      exercise.media?.gif ||
      exercise.media?.video
  );
}