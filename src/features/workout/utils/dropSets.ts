/**
 * A drop set is performed immediately after a working set, at reduced weight
 * and with no full rest — pushing a set past normal failure. Kept as pure
 * calculations so the UI just calls these and renders the result.
 */

/** Typical weight reduction for a drop set, as a fraction of the prior weight. */
export const DEFAULT_DROP_PERCENT = 0.2;

/** Rest between a set and the drop that follows it — deliberately short. */
export const DROP_SET_REST_SECONDS = 15;

/**
 * Suggested weight for a drop set following a set of `previousWeight`.
 * Rounds to the nearest 2.5 (typical smallest plate jump) so it's something
 * you can actually load, and never suggests below zero.
 */
export function suggestDropWeight(
  previousWeight: number,
  dropPercent: number = DEFAULT_DROP_PERCENT
): number {
  if (previousWeight <= 0) return 0;

  const raw = previousWeight * (1 - dropPercent);
  const rounded = Math.round(raw / 2.5) * 2.5;

  return Math.max(0, rounded);
}

/**
 * Whether a set at `index` within an exercise's set list should skip the
 * normal full rest timer (because it's about to be followed by a drop set).
 * The full rest still applies once the drop chain ends.
 */
export function skipsFullRest(
  sets: readonly { isDropSet?: boolean }[],
  index: number
): boolean {
  const next = sets[index + 1];
  return next?.isDropSet === true;
}
