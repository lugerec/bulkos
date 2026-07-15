import { describe, expect, it } from "vitest";

import { getPlatesPerSide, getWarmupSets } from "./warmup";

describe("getWarmupSets", () => {
  it("returns nothing for a working weight at or below the empty bar", () => {
    expect(getWarmupSets(20, "barbell")).toEqual([]);
    expect(getWarmupSets(0, "barbell")).toEqual([]);
  });

  it("ramps toward a barbell working weight with decreasing reps", () => {
    const sets = getWarmupSets(100, "barbell");

    // 40% -> 40, 60% -> 60, 80% -> 80 (all plate-loadable on a 20kg bar)
    expect(sets).toEqual([
      { weight: 40, reps: 5, ratio: 0.4 },
      { weight: 60, reps: 3, ratio: 0.6 },
      { weight: 80, reps: 2, ratio: 0.8 },
    ]);
  });

  it("keeps warm-up weights plate-loadable (multiples of 2.5 on a bar)", () => {
    const sets = getWarmupSets(102.5, "barbell");

    for (const set of sets) {
      expect((set.weight - 20) % 2.5).toBe(0);
      expect(set.weight).toBeGreaterThanOrEqual(20);
      expect(set.weight).toBeLessThan(102.5);
    }
  });

  it("never repeats or exceeds the working weight", () => {
    const sets = getWarmupSets(30, "barbell");
    const weights = sets.map((set) => set.weight);

    expect(new Set(weights).size).toBe(weights.length);
    expect(weights.every((weight) => weight < 30)).toBe(true);
  });

  it("rounds to 2.5 for non-bar equipment and skips very light loads", () => {
    expect(getWarmupSets(15, "dumbbell")).toEqual([]);

    const sets = getWarmupSets(40, "dumbbell");

    for (const set of sets) {
      expect(set.weight % 2.5).toBe(0);
    }
  });
});

describe("getPlatesPerSide", () => {
  it("returns no plates for a bar-only target", () => {
    expect(getPlatesPerSide(20)).toEqual({
      platesPerSide: [],
      remainderKg: 0,
    });
  });

  it("computes plates per side greedily, heaviest first", () => {
    // (100 - 20) / 2 = 40 per side -> 25 + 15
    expect(getPlatesPerSide(100)).toEqual({
      platesPerSide: [25, 15],
      remainderKg: 0,
    });
  });

  it("uses the smallest plates for fine increments", () => {
    // (105 - 20) / 2 = 42.5 per side -> 25 + 15 + 2.5
    expect(getPlatesPerSide(105)).toEqual({
      platesPerSide: [25, 15, 2.5],
      remainderKg: 0,
    });
  });

  it("reports a remainder when the target isn't perfectly loadable", () => {
    // (61 - 20) / 2 = 20.5 per side -> 20 loaded, 0.5 remainder
    const result = getPlatesPerSide(61);

    expect(result.platesPerSide).toEqual([20]);
    expect(result.remainderKg).toBe(0.5);
  });

  it("respects a custom plate set", () => {
    // only 20s available: (100-20)/2 = 40 -> 20 + 20
    const result = getPlatesPerSide(100, { availablePlatesKg: [20] });

    expect(result.platesPerSide).toEqual([20, 20]);
    expect(result.remainderKg).toBe(0);
  });
});
