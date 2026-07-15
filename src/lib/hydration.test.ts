import { describe, expect, it } from "vitest";

import {
  DEFAULT_WATER_GOAL_LITERS,
  getWaterGoalLiters,
} from "./hydration";

describe("getWaterGoalLiters", () => {
  it("scales with body weight at ~35 ml/kg", () => {
    expect(getWaterGoalLiters(80, false)).toBe(2.8);
    expect(getWaterGoalLiters(100, false)).toBe(3.5);
  });

  it("adds 0.5 L on training days", () => {
    expect(getWaterGoalLiters(80, true)).toBe(3.3);
  });

  it("falls back to the default when weight is unknown or invalid", () => {
    expect(getWaterGoalLiters(undefined, false)).toBe(
      DEFAULT_WATER_GOAL_LITERS
    );
    expect(getWaterGoalLiters(0, true)).toBe(DEFAULT_WATER_GOAL_LITERS);
    expect(getWaterGoalLiters(-10, false)).toBe(DEFAULT_WATER_GOAL_LITERS);
  });

  it("clamps to the 2-6 L range", () => {
    expect(getWaterGoalLiters(40, false)).toBe(2);
    expect(getWaterGoalLiters(200, true)).toBe(6);
  });
});
