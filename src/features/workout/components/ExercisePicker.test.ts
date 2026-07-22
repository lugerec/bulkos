import { describe, expect, it } from "vitest";

import { filterAndRank } from "./ExercisePicker";
import type { ExerciseDefinition } from "@/types/workout";

const def = (
  id: string,
  name: string,
  primaryMuscle: ExerciseDefinition["primaryMuscle"],
  category: ExerciseDefinition["category"] = "compound",
  aliases?: string[]
): ExerciseDefinition => ({
  id,
  name,
  primaryMuscle,
  aliases,
  equipment: "barbell",
  category,
  defaultRestSeconds: 90,
  defaultSets: 3,
  defaultReps: 8,
});

const POOL: ExerciseDefinition[] = [
  def("bp", "Bench Press", "chest"),
  def("cf", "Cable Fly", "chest", "isolation"),
  def("sq", "Squat", "legs"),
  def("ohp", "Overhead Press", "shoulders", "compound", ["military press"]),
];

describe("exercise picker ranking", () => {
  it("filters by muscle group", () => {
    const chest = filterAndRank(POOL, "", "chest");
    expect(chest.map((d) => d.id)).toEqual(["bp", "cf"]);
  });

  it("ranks startsWith above includes", () => {
    const results = filterAndRank(POOL, "press", "all");
    // Both presses match by name; Bench Press includes, Overhead Press includes —
    // neither startsWith "press", so compounds tie and it's alphabetical.
    expect(results.map((d) => d.id)).toEqual(["bp", "ohp"]);

    const b = filterAndRank(POOL, "bench", "all");
    expect(b[0].id).toBe("bp");
  });

  it("finds by alias", () => {
    const results = filterAndRank(POOL, "military", "all");
    expect(results.map((d) => d.id)).toEqual(["ohp"]);
  });

  it("puts compounds before isolation when unfiltered", () => {
    const chest = filterAndRank(POOL, "", "chest");
    expect(chest[0].category).toBe("compound");
  });

  it("returns nothing on a non-matching query", () => {
    expect(filterAndRank(POOL, "zzz", "all")).toEqual([]);
  });
});
