import mediaMap from "@/data/exerciseMedia.json";
import type { ExerciseDefinition, ExerciseMedia } from "@/types/workout";

type MediaMap = Record<string, Partial<ExerciseMedia>>;

/**
 * Merges an exercise's own `media` with locally downloaded images (from
 * `exerciseMedia.json`, populated by scripts/fetch-exercise-images.mjs).
 *
 * Downloaded images win: many exercise definitions carry a placeholder
 * `thumbnail: ".../thumbnail.webp"` path that was never actually fetched
 * (we download start/finish PNGs instead), so letting the definition win
 * would point <img> at a missing file. Real fields the definition provides
 * that the map doesn't (e.g. a hand-authored gif/video) are still kept.
 */
export function getExerciseMedia(
  exerciseId: string,
  own: ExerciseMedia | undefined
): ExerciseMedia | undefined {
  const downloaded = (mediaMap as MediaMap)[exerciseId];

  if (!downloaded && !own) return own;

  return { ...own, ...downloaded };
}

/** A single still image for an exercise, or null. */
export function getExerciseThumbnail(
  exercise: ExerciseDefinition
): string | null {
  const media = getExerciseMedia(exercise.id, exercise.media);

  // start/finish are the real downloaded stills; thumbnail may be a stale
  // placeholder path, so it's the last resort.
  return (
    media?.start ??
    media?.finish ??
    media?.gif ??
    media?.thumbnail ??
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
