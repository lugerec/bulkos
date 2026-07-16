import mediaMap from "@/data/exerciseMedia.json";
import type { ExerciseDefinition, ExerciseMedia } from "@/types/workout";

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

/** A single still image for an exercise, or null. */
export function getExerciseThumbnail(
  exercise: ExerciseDefinition
): string | null {
  const media = getExerciseMedia(exercise.id, exercise.media);

  return (
    media?.thumbnail ??
    media?.gif ??
    media?.start ??
    media?.finish ??
    media?.video ??
    null
  );
}

/** An animated source (gif/video) for an exercise, or null. */
export function getExerciseAnimation(
  exercise: ExerciseDefinition
): string | null {
  const media = getExerciseMedia(exercise.id, exercise.media);

  return media?.gif ?? media?.video ?? null;
}

export function hasExerciseMedia(exercise: ExerciseDefinition): boolean {
  return getExerciseThumbnail(exercise) !== null;
}
