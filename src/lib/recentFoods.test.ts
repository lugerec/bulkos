import { describe, expect, it } from "vitest";

import { dedupeRecentFoods } from "./recentFoods";
import type { LoggedFood } from "@/types/food";

function logged(
  foodId: string,
  name: string,
  grams = 100
): LoggedFood {
  return {
    id: `${foodId}-${grams}`,
    foodId,
    name,
    grams,
    calories: grams,
    protein: 1,
    carbs: 1,
    fat: 1,
    mealType: "lunch",
    createdAt: new Date(),
  };
}

describe("dedupeRecentFoods", () => {
  it("keeps the first (most recent) portion per food", () => {
    const recents = dedupeRecentFoods([
      logged("off-1", "Skyr", 150),
      logged("off-1", "Skyr", 200),
      logged("off-2", "Rice", 80),
    ]);

    expect(recents).toHaveLength(2);
    expect(recents[0]).toMatchObject({ foodId: "off-1", grams: 150 });
    expect(recents[1]).toMatchObject({ foodId: "off-2", grams: 80 });
  });

  it("falls back to name when foodId is missing", () => {
    const a = { ...logged("", "Home Chili", 300) };
    const b = { ...logged("", "home chili", 250) };

    expect(dedupeRecentFoods([a, b])).toHaveLength(1);
  });

  it("respects the limit", () => {
    const items = Array.from({ length: 20 }, (_, i) =>
      logged(`off-${i}`, `Food ${i}`)
    );

    expect(dedupeRecentFoods(items, 5)).toHaveLength(5);
  });
});
