import { describe, expect, it } from "vitest";

import {
  calculatePlates,
  formatPlatePlan,
  IMPERIAL_PLATES,
  DEFAULT_BAR_LB,
} from "./plateCalculator";

describe("calculatePlates", () => {
  it("breaks a common load down largest-first", () => {
    // 100 kg on a 20 kg bar = 40 kg per side = 25 + 15.
    const plan = calculatePlates(100);

    expect(plan.plates).toEqual([
      { plate: 25, perSide: 1 },
      { plate: 15, perSide: 1 },
    ]);
    expect(plan.exact).toBe(true);
    expect(plan.achievableTotal).toBe(100);
  });

  it("uses multiples of the same plate", () => {
    // 140 kg = 60 per side = 25 + 25 + 10.
    const plan = calculatePlates(140);

    expect(plan.plates).toEqual([
      { plate: 25, perSide: 2 },
      { plate: 10, perSide: 1 },
    ]);
    expect(plan.exact).toBe(true);
  });

  it("handles fractional plates without float drift", () => {
    // 63.75 kg = 21.875 per side -> 20 + 1.25, remainder 0.625.
    const plan = calculatePlates(63.75);

    expect(plan.exact).toBe(false);
    expect(plan.remainderPerSide).toBeCloseTo(0.63, 1);
  });

  it("loads an exact 2.5 kg jump cleanly", () => {
    // 65 kg = 22.5 per side = 20 + 2.5.
    const plan = calculatePlates(65);

    expect(plan.plates).toEqual([
      { plate: 20, perSide: 1 },
      { plate: 2.5, perSide: 1 },
    ]);
    expect(plan.exact).toBe(true);
  });

  it("reports nothing to load at or below the bar", () => {
    expect(calculatePlates(20).plates).toEqual([]);
    expect(calculatePlates(20).exact).toBe(true);
    expect(calculatePlates(15).plates).toEqual([]);
    expect(calculatePlates(15).achievableTotal).toBe(20);
  });

  it("flags a target that isn't loadable and gives the closest total", () => {
    // 101 kg = 40.5 per side -> 25+15, 0.5 left over (no 0.5 plate).
    const plan = calculatePlates(101);

    expect(plan.exact).toBe(false);
    expect(plan.remainderPerSide).toBeCloseTo(0.5, 2);
    expect(plan.achievableTotal).toBe(100);
  });

  it("respects a custom bar weight", () => {
    // 100 kg on a 15 kg bar = 42.5 per side = 25 + 15 + 2.5.
    const plan = calculatePlates(100, 15);

    expect(plan.plates).toEqual([
      { plate: 25, perSide: 1 },
      { plate: 15, perSide: 1 },
      { plate: 2.5, perSide: 1 },
    ]);
    expect(plan.exact).toBe(true);
  });

  it("works with imperial plates", () => {
    // 225 lb on a 45 lb bar = 90 per side = 45 + 45.
    const plan = calculatePlates(225, DEFAULT_BAR_LB, IMPERIAL_PLATES);

    expect(plan.plates).toEqual([{ plate: 45, perSide: 2 }]);
    expect(plan.exact).toBe(true);
  });

  it("sorts an unsorted custom plate list", () => {
    const plan = calculatePlates(100, 20, [10, 25, 5]);

    expect(plan.plates[0].plate).toBe(25);
    expect(plan.exact).toBe(true);
  });
});

describe("formatPlatePlan", () => {
  it("expands counts into a readable list", () => {
    expect(formatPlatePlan(calculatePlates(140))).toBe("25 + 25 + 10");
  });

  it("is empty when nothing is loaded", () => {
    expect(formatPlatePlan(calculatePlates(20))).toBe("");
  });
});
