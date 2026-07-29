import { describe, expect, it } from "vitest";

import { mergeFoods } from "./mergeFoods";
import type { FoodItem } from "@/types/food";

function food(id: string, name: string, calories = 100): FoodItem {
  return {
    id,
    name,
    category: "other",
    calories,
    protein: 0,
    carbs: 0,
    fat: 0,
    serving: 100,
    unit: "g",
    verified: false,
  };
}

describe("mergeFoods", () => {
  it("combines both sources sorted by name", () => {
    const merged = mergeFoods(
      [food("a", "Zucchini"), food("b", "Apple")],
      [food("c", "Milk")]
    );

    expect(merged.map((f) => f.name)).toEqual(["Apple", "Milk", "Zucchini"]);
  });

  it("lets a user food override a shared one with the same id", () => {
    const merged = mergeFoods(
      [food("off-123", "Skyr", 60)],
      [food("off-123", "Skyr", 99)]
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].calories).toBe(99);
  });

  it("handles empty inputs", () => {
    expect(mergeFoods([], [])).toEqual([]);
    expect(mergeFoods([food("a", "Egg")], [])).toHaveLength(1);
    expect(mergeFoods([], [food("b", "Rice")])).toHaveLength(1);
  });
});
