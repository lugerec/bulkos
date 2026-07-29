import type { LoggedFood, RecentFood } from "@/types/food";

/**
 * Collapse a recency-ordered list of logged foods into distinct recent
 * portions for quick re-logging. The first occurrence of each food wins (so
 * the most recent portion is kept), keyed by foodId when present and falling
 * back to a normalised name. Capped at `limit`.
 */
export function dedupeRecentFoods(
  logged: LoggedFood[],
  limit = 8
): RecentFood[] {
  const seen = new Set<string>();
  const recents: RecentFood[] = [];

  for (const food of logged) {
    const key = food.foodId?.trim() || `name:${food.name.trim().toLowerCase()}`;

    if (!key || key === "name:") continue;
    if (seen.has(key)) continue;

    seen.add(key);
    recents.push({
      foodId: food.foodId,
      name: food.name,
      grams: food.grams,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    });

    if (recents.length >= limit) break;
  }

  return recents;
}
