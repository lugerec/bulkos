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
import mediaMap from "@/data/exerciseMedia.json";
import type { ExerciseMedia } from "@/types/workout";

type MediaMap = Record<string, Partial<ExerciseMedia>>;

/**
 * Merges an exercise's own `media` with locally downloaded images (from
 * `exerciseMedia.json`, populated by scripts/fetch-exercise-images.mjs).
 * The exercise's own fields win; downloaded images fill the gaps.
 */
export function getExerciseMedia(
  exerciseId: string,
  own: ExerciseMedia | undefined
): ExerciseMedia | undefined {
  const downloaded = (mediaMap as MediaMap)[exerciseId];

  if (!downloaded && !own) return own;

  return { ...downloaded, ...own };
}
