/**
 * Work out which plates to load on each side of a barbell for a target weight.
 *
 * Plates are always loaded in pairs, so the maths runs on the per-side weight:
 * (target − bar) / 2. Greedy largest-first is optimal for standard gym plate
 * sets, and any leftover is reported so the user knows the target isn't
 * exactly loadable rather than being shown a silently wrong answer.
 */

/** Standard metric plates in kg, largest first. */
export const METRIC_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25] as const;

/** Standard imperial plates in lb, largest first. */
export const IMPERIAL_PLATES = [45, 35, 25, 10, 5, 2.5] as const;

export const DEFAULT_BAR_KG = 20;
export const DEFAULT_BAR_LB = 45;

export type PlateCount = {
  /** Plate denomination. */
  plate: number;
  /** How many go on EACH side. */
  perSide: number;
};

export type PlatePlan = {
  plates: PlateCount[];
  /** Weight per side that couldn't be made up from available plates. */
  remainderPerSide: number;
  /** True when the target is loadable exactly. */
  exact: boolean;
  /** The closest total actually achievable with these plates. */
  achievableTotal: number;
};

/**
 * Greedy plate breakdown. Returns an empty plan when the target is at or below
 * the bar (nothing to load).
 */
export function calculatePlates(
  targetWeight: number,
  barWeight: number = DEFAULT_BAR_KG,
  available: readonly number[] = METRIC_PLATES
): PlatePlan {
  const perSideTarget = (targetWeight - barWeight) / 2;

  if (!Number.isFinite(perSideTarget) || perSideTarget <= 0) {
    return {
      plates: [],
      remainderPerSide: 0,
      exact: targetWeight === barWeight,
      achievableTotal: barWeight,
    };
  }

  // Largest first, defensively sorted so a caller's custom list still works.
  const sorted = [...available].sort((a, b) => b - a);

  const plates: PlateCount[] = [];
  let remaining = perSideTarget;

  for (const plate of sorted) {
    if (plate <= 0) continue;

    const count = Math.floor(remaining / plate);
    if (count > 0) {
      plates.push({ plate, perSide: count });
      // Keep float drift from 1.25/2.5 plates out of the remainder.
      remaining = Math.round((remaining - count * plate) * 100) / 100;
    }
  }

  const loadedPerSide = plates.reduce(
    (sum, { plate, perSide }) => sum + plate * perSide,
    0
  );

  return {
    plates,
    remainderPerSide: remaining,
    exact: remaining === 0,
    achievableTotal: Math.round((barWeight + loadedPerSide * 2) * 100) / 100,
  };
}

/** Compact summary, e.g. "25 + 10 + 2.5". Empty string when nothing is loaded. */
export function formatPlatePlan(plan: PlatePlan): string {
  return plan.plates
    .flatMap(({ plate, perSide }) => Array<number>(perSide).fill(plate))
    .join(" + ");
}
