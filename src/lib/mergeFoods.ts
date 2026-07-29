import type { FoodItem } from "@/types/food";

/**
 * Merge the shared food database with a user's own foods. User entries win on
 * id collision (e.g. a re-saved barcode), and the result is sorted by name so
 * the list stays stable regardless of source order.
 */
export function mergeFoods(
  shared: FoodItem[],
  user: FoodItem[]
): FoodItem[] {
  const byId = new Map<string, FoodItem>();

  for (const food of shared) byId.set(food.id, food);
  for (const food of user) byId.set(food.id, food);

  return [...byId.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}
