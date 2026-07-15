import { describe, expect, it } from "vitest";

import { estimateOneRepMaxDetailed, getRepTargets } from "./oneRepMax";

describe("estimateOneRepMaxDetailed", () => {
  it("returns null for invalid input", () => {
    expect(estimateOneRepMaxDetailed(0, 5)).toBeNull();
    expect(estimateOneRepMaxDetailed(100, 0)).toBeNull();
  });

  it("returns the weight itself for a single rep", () => {
    const estimate = estimateOneRepMaxDetailed(120, 1);

    expect(estimate).toEqual({
      average: 120,
      epley: 120,
      brzycki: 120,
      lombardi: 120,
    });
  });

  it("averages three formulas for a multi-rep set", () => {
    const estimate = estimateOneRepMaxDetailed(100, 5);

    // Epley 116.7, Brzycki 112.5, Lombardi ~117.5
    expect(estimate?.epley).toBeCloseTo(116.7, 0);
    expect(estimate?.brzycki).toBeCloseTo(112.5, 0);
    expect(estimate?.average).toBeGreaterThan(112);
    expect(estimate?.average).toBeLessThan(118);
  });

  it("stays finite for very high reps (Brzycki clamp)", () => {
    const estimate = estimateOneRepMaxDetailed(60, 40);

    expect(estimate).not.toBeNull();
    expect(Number.isFinite(estimate?.average ?? Infinity)).toBe(true);
    expect(estimate?.brzycki).toBe(estimate?.epley);
  });
});

describe("getRepTargets", () => {
  it("returns nothing for a non-positive 1RM", () => {
    expect(getRepTargets(0)).toEqual([]);
  });

  it("puts 100% at 1 rep and scales down", () => {
    const targets = getRepTargets(100);
    const single = targets.find((t) => t.reps === 1);
    const ten = targets.find((t) => t.reps === 10);

    expect(single?.percent).toBe(100);
    expect(single?.weight).toBe(100);
    expect(ten?.percent).toBe(75);
    expect(ten?.weight).toBe(75);
  });

  it("rounds loads to the nearest 2.5 kg", () => {
    for (const target of getRepTargets(137.5)) {
      expect(target.weight % 2.5).toBe(0);
    }
  });
});
