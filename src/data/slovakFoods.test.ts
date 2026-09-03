import { describe, expect, it } from "vitest";

import { SLOVAK_FOODS } from "./slovakFoods";
import { STARTER_FOODS } from "./starterFoods";

describe("SLOVAK_FOODS", () => {
  it("has a useful number of local staples", () => {
    expect(SLOVAK_FOODS.length).toBeGreaterThanOrEqual(25);
  });

  it("has unique, namespaced ids that don't collide with starter foods", () => {
    const ids = SLOVAK_FOODS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => id.startsWith("sk-"))).toBe(true);

    const starterIds = new Set(STARTER_FOODS.map((f) => f.id));
    expect(ids.some((id) => starterIds.has(id))).toBe(false);
  });

  it("uses ASCII-safe ids even though names are accented", () => {
    for (const f of SLOVAK_FOODS) {
      expect(f.id).toMatch(/^sk-[a-z0-9-]+$/);
    }
  });

  it("has sane macros that roughly match their calories", () => {
    for (const f of SLOVAK_FOODS) {
      expect(f.serving).toBe(f.unit === "piece" ? 1 : 100);
      if (f.unit === "piece") {
        expect(f.unitLabel).toBeTruthy();
      }
      expect(f.calories).toBeGreaterThanOrEqual(0);
      expect(f.protein).toBeGreaterThanOrEqual(0);
      expect(f.carbs).toBeGreaterThanOrEqual(0);
      expect(f.fat).toBeGreaterThanOrEqual(0);

      const fromMacros = f.protein * 4 + f.carbs * 4 + f.fat * 9;
      if (f.calories > 0) {
        expect(Math.abs(fromMacros - f.calories)).toBeLessThan(
          f.calories * 0.25 + 20
        );
      }
    }
  });

  it("keeps a searchable English hint alongside the Slovak name", () => {
    // Local terms are useless to search if you only know the English word.
    const withHint = SLOVAK_FOODS.filter((f) => f.name.includes("("));
    expect(withHint.length).toBeGreaterThan(SLOVAK_FOODS.length * 0.7);
  });
});
