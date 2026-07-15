import type { Equipment } from "@/types/workout";

export type WarmupSet = {
  /** rounded working-set-appropriate weight for the warm-up */
  weight: number;
  reps: number;
  /** share of the working weight this set targets (0–1) */
  ratio: number;
};

/**
 * Standard ramp toward a working weight: progressively heavier sets with
 * fewer reps. The empty bar (or a light start) is always the first set.
 */
const WARMUP_STEPS: ReadonlyArray<{ ratio: number; reps: number }> = [
  { ratio: 0.4, reps: 5 },
  { ratio: 0.6, reps: 3 },
  { ratio: 0.8, reps: 2 },
];

/** Barbells load in increments of 2× the smallest plate (both sides). */
function roundToIncrement(weight: number, increment: number): number {
  return Math.round(weight / increment) * increment;
}

/**
 * Warm-up sets ramping to `workingWeight`. Bar-based lifts round to whole
 * plate-loadable weights and start from the empty bar; other equipment
 * rounds to 2.5. Returns [] for very light working weights where warm-up
 * ramping adds nothing.
 */
export function getWarmupSets(
  workingWeight: number,
  equipment: Equipment | undefined,
  options: { barWeightKg?: number; smallestPlateKg?: number } = {}
): WarmupSet[] {
  const barWeight = options.barWeightKg ?? 20;
  const smallestPlate = options.smallestPlateKg ?? 1.25;
  const isBar =
    equipment === "barbell" ||
    equipment === "ezBar" ||
    equipment === "smithMachine";

  if (workingWeight <= 0) return [];
  if (isBar && workingWeight <= barWeight) return [];
  if (!isBar && workingWeight < 20) return [];

  const increment = isBar ? smallestPlate * 2 : 2.5;
  const floor = isBar ? barWeight : increment;

  const sets: WarmupSet[] = [];
  let lastWeight = -1;

  for (const step of WARMUP_STEPS) {
    const raw = workingWeight * step.ratio;
    const weight = Math.max(floor, roundToIncrement(raw, increment));

    // Skip a step that rounds to the same (or heavier) load as the prior one.
    if (weight <= lastWeight || weight >= workingWeight) continue;

    sets.push({ weight, reps: step.reps, ratio: step.ratio });
    lastWeight = weight;
  }

  return sets;
}

export type PlateBreakdown = {
  /** plates (kg) to load on ONE side, heaviest first */
  platesPerSide: number[];
  /** weight that couldn't be matched exactly with available plates */
  remainderKg: number;
};

const DEFAULT_PLATES_KG: readonly number[] = [
  25, 20, 15, 10, 5, 2.5, 1.25,
];

/**
 * Which plates to put on each side of the bar for a target weight.
 * Greedy from the heaviest plate; any un-matchable remainder is reported
 * rather than silently rounded.
 */
export function getPlatesPerSide(
  targetWeight: number,
  options: { barWeightKg?: number; availablePlatesKg?: readonly number[] } = {}
): PlateBreakdown {
  const barWeight = options.barWeightKg ?? 20;
  const plates = [...(options.availablePlatesKg ?? DEFAULT_PLATES_KG)].sort(
    (a, b) => b - a
  );

  const perSide: number[] = [];

  if (targetWeight <= barWeight) {
    return { platesPerSide: perSide, remainderKg: 0 };
  }

  let remainingPerSide = (targetWeight - barWeight) / 2;

  for (const plate of plates) {
    while (remainingPerSide >= plate - 1e-9) {
      perSide.push(plate);
      remainingPerSide -= plate;
    }
  }

  return {
    platesPerSide: perSide,
    remainderKg: Math.round(remainingPerSide * 100) / 100,
  };
}
