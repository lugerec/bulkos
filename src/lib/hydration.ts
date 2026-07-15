/** Fallback when body weight is unknown — the app's original fixed goal. */
export const DEFAULT_WATER_GOAL_LITERS = 3.5;

const ML_PER_KG = 35;
const TRAINING_DAY_BONUS_ML = 500;
const MIN_GOAL_LITERS = 2;
const MAX_GOAL_LITERS = 6;

/**
 * Daily water goal from body weight (~35 ml/kg, +500 ml on training days),
 * clamped to a sensible 2–6 L range and rounded to 0.1 L. Falls back to
 * the fixed default when the weight is unknown or invalid.
 */
export function getWaterGoalLiters(
  weightKg: number | undefined,
  trainedToday: boolean
): number {
  if (typeof weightKg !== "number" || weightKg <= 0) {
    return DEFAULT_WATER_GOAL_LITERS;
  }

  const baseMl = weightKg * ML_PER_KG;
  const totalMl = baseMl + (trainedToday ? TRAINING_DAY_BONUS_ML : 0);
  const liters = Math.min(
    MAX_GOAL_LITERS,
    Math.max(MIN_GOAL_LITERS, totalMl / 1000)
  );

  return Math.round(liters * 10) / 10;
}
