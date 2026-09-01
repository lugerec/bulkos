/**
 * Fold a string for searching: lowercase and strip diacritics, so a query
 * typed without accents still matches accented names. Without this, "sosovica"
 * misses "šošovica" and "muka" misses "múka" — which makes local foods
 * effectively unfindable for anyone not typing full Slovak diacritics.
 */
export function foldForSearch(value: string): string {
  return value
    .normalize("NFD")
    // Strip combining marks (á → a, š → s, ô → o, ...).
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** True when `haystack` contains `needle`, ignoring case and diacritics. */
export function matchesSearch(haystack: string, needle: string): boolean {
  const q = foldForSearch(needle);
  if (!q) return true;

  return foldForSearch(haystack).includes(q);
}
