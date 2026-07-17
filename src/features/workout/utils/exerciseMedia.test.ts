import { describe, expect, it } from "vitest";

import { getExerciseThumbnail } from "./exerciseMedia";
import type { ExerciseDefinition } from "@/types/workout";

function make(
  id: string,
  media?: ExerciseDefinition["media"]
): ExerciseDefinition {
  return {
    id,
    name: id,
    primaryMuscle: "chest",
    equipment: "barbell",
    category: "compound",
    difficulty: "intermediate",
    defaultSets: 3,
    defaultReps: 8,
    defaultRestSeconds: 120,
    media,
  } as ExerciseDefinition;
}

describe("getExerciseThumbnail", () => {
  it("returns null when the exercise has no id in the map and no media", () => {
    expect(getExerciseThumbnail(make("not-in-map-xyz"))).toBeNull();
  });

  it("prefers a real downloaded still over a stale definition thumbnail", () => {
    // bench-press is in exerciseMedia.json with a start image; the definition
    // carries a placeholder thumbnail.webp that was never downloaded. The
    // downloaded start image must win so <img> doesn't point at a missing file.
    const withStalePlaceholder = make("bench-press", {
      thumbnail: "/exercises/bench-press/thumbnail.webp",
    });

    const thumb = getExerciseThumbnail(withStalePlaceholder);

    expect(thumb).toContain("/exercises/bench-press/");
    expect(thumb).not.toContain("thumbnail.webp");
  });
});
