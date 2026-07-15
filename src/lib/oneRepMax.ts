export type OneRepMaxEstimate = {
  /** averaged estimate across formulas (kg) */
  average: number;
  epley: number;
  brzycki: number;
  lombardi: number;
};

/**
 * Estimate a one-rep max from a weight × reps set using three common
 * formulas and their average. Reps are most accurate at ≤10; above that
 * the estimate drifts, so the UI should note it. Returns null for invalid
 * input.
 */
export function estimateOneRepMaxDetailed(
  weight: number,
  reps: number
): OneRepMaxEstimate | null {
  if (weight <= 0 || reps <= 0) return null;

  // A single rep is already the 1RM.
  if (reps === 1) {
    return { average: weight, epley: weight, brzycki: weight, lombardi: weight };
  }

  const epley = weight * (1 + reps / 30);
  // Brzycki denominator breaks down as reps approach 37; clamp for safety.
  const brzycki =
    reps < 37 ? weight * (36 / (37 - reps)) : epley;
  const lombardi = weight * Math.pow(reps, 0.1);

  const average = (epley + brzycki + lombardi) / 3;

  const round = (value: number) => Math.round(value * 10) / 10;

  return {
    average: round(average),
    epley: round(epley),
    brzycki: round(brzycki),
    lombardi: round(lombardi),
  };
}

export type RepTarget = {
  reps: number;
  /** percent of 1RM for this rep target */
  percent: number;
  /** load for this rep target (kg), rounded to 2.5 */
  weight: number;
};

/**
 * Standard percent-of-1RM table. Percentages follow common training
 * charts (Prilepin-style); loads are rounded to the nearest 2.5 kg.
 */
const REP_PERCENTS: ReadonlyArray<{ reps: number; percent: number }> = [
  { reps: 1, percent: 100 },
  { reps: 2, percent: 95 },
  { reps: 3, percent: 93 },
  { reps: 5, percent: 87 },
  { reps: 8, percent: 80 },
  { reps: 10, percent: 75 },
  { reps: 12, percent: 70 },
  { reps: 15, percent: 65 },
];

export function getRepTargets(oneRepMax: number): RepTarget[] {
  if (oneRepMax <= 0) return [];

  return REP_PERCENTS.map(({ reps, percent }) => ({
    reps,
    percent,
    weight: Math.round((oneRepMax * percent) / 100 / 2.5) * 2.5,
  }));
}
