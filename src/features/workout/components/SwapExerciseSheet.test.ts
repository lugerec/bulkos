import { describe, expect, it } from "vitest";

import { getAlternatives } from "./SwapExerciseSheet";
import type { ExerciseDefinition } from "@/types/workout";

function make(
  id: string,
  primaryMuscle: string,
  name = id
): ExerciseDefinition {
  return {
    id,
    name,
    primaryMuscle,
    equipment: "barbell",
    category: "compound",
    difficulty: "intermediate",
    defaultSets: 3,
    defaultReps: 8,
    defaultRestSeconds: 120,
  } as ExerciseDefinition;
}

const catalog = [
  make("bench-press", "chest", "Bench Press"),
  make("incline-press", "chest", "Incline Press"),
  make("cable-fly", "chest", "Cable Fly"),
  make("squat", "quads", "Squat"),
];

describe("getAlternatives", () => {
  it("returns same-muscle exercises excluding the current one", () => {
    const alts = getAlternatives(catalog[0], catalog);

    expect(alts.map((a) => a.id)).toEqual(["cable-fly", "incline-press"]);
  });

  it("excludes other muscle groups", () => {
    const alts = getAlternatives(catalog[3], catalog);

    expect(alts).toEqual([]);
  });

  it("sorts alternatives by name", () => {
    const alts = getAlternatives(catalog[1], catalog);

    expect(alts.map((a) => a.name)).toEqual(["Bench Press", "Cable Fly"]);
  });
});
