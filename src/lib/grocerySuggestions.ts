export type GrocerySuggestionInput = {
  name: string;
  count: number;
};

const MAX_SUGGESTIONS = 8;

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Grocery suggestions from recently logged foods: excludes anything
 * already on the list (case-insensitive), keeps the most-often-logged
 * first, capped at 8.
 */
export function buildGrocerySuggestions(
  recentFoods: readonly GrocerySuggestionInput[],
  existingItemNames: readonly string[]
): string[] {
  const existing = new Set(existingItemNames.map(normalize));
  const seen = new Set<string>();
  const suggestions: string[] = [];

  const ordered = [...recentFoods].sort((a, b) => b.count - a.count);

  for (const food of ordered) {
    const key = normalize(food.name);

    if (!key || existing.has(key) || seen.has(key)) continue;

    seen.add(key);
    suggestions.push(food.name);

    if (suggestions.length >= MAX_SUGGESTIONS) break;
  }

  return suggestions;
}
