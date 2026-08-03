import { describe, expect, it } from "vitest";

import { STARTER_FOODS } from "./starterFoods";

describe("STARTER_FOODS", () => {
  it("has a healthy number of entries", () => {
    expect(STARTER_FOODS.length).toBeGreaterThanOrEqual(30);
  });

  it("has unique, namespaced ids", () => {
    const ids = STARTER_FOODS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => id.startsWith("starter-"))).toBe(true);
  });

  it("has sane, non-negative macros per 100 units", () => {
    for (const f of STARTER_FOODS) {
      expect(f.serving).toBe(100);
      expect(f.calories).toBeGreaterThanOrEqual(0);
      expect(f.protein).toBeGreaterThanOrEqual(0);
      expect(f.carbs).toBeGreaterThanOrEqual(0);
      expect(f.fat).toBeGreaterThanOrEqual(0);
      // Calories should be in the ballpark of the macro math (±25%).
      const fromMacros = f.protein * 4 + f.carbs * 4 + f.fat * 9;
      if (f.calories > 0) {
        expect(Math.abs(fromMacros - f.calories)).toBeLessThan(
          f.calories * 0.25 + 20
        );
      }
    }
  });
});
