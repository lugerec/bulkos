import type { Goal } from "@/types/profile";

export type BulkPaceStatus =
  | "on_track"
  | "too_fast"
  | "too_slow"
  | "insufficient_data";

export type BulkPace = {
  status: BulkPaceStatus;
  /** measured weight change per week (kg); positive = gaining */
  weeklyChangeKg: number;
  /** measured change as % of body weight per week */
  weeklyChangePercent: number;
  /** recommended band for the goal (% of body weight per week) */
  targetMinPercent: number;
  targetMaxPercent: number;
  /**
   * suggested daily calorie adjustment to land mid-band;
   * positive = eat more, negative = eat less, 0 when on track
   */
  suggestedDailyKcalDelta: number;
};

type WeightEntry = {
  date: string;
  weightKg: number;
};

/** Recommended weekly rate bands (% of body weight per week). */
const PACE_BANDS: Record<Goal, { min: number; max: number }> = {
  bulk: { min: 0.25, max: 0.5 },
  cut: { min: -1.0, max: -0.5 },
  maintain: { min: -0.25, max: 0.25 },
};

const KCAL_PER_KG = 7700;
const WINDOW_DAYS = 14;
const MIN_SPAN_DAYS = 5;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Compares the measured weekly weight trend against the recommended pace
 * for the lifter's goal and suggests a daily calorie adjustment (rounded
 * to 50 kcal) to land in the middle of the band. Uses the oldest and
 * newest check-ins inside the last 14 days; needs at least 5 days between
 * them to avoid reading day-to-day noise as a trend.
 */
export function getBulkPace(
  entries: readonly WeightEntry[],
  goal: Goal,
  now: Date = new Date()
): BulkPace {
  const band = PACE_BANDS[goal];
  const windowStart = now.getTime() - WINDOW_DAYS * MS_PER_DAY;

  const recent = entries
    .map((entry) => ({ ...entry, timestamp: Date.parse(entry.date) }))
    .filter(
      (entry) =>
        !Number.isNaN(entry.timestamp) &&
        entry.timestamp >= windowStart &&
        entry.timestamp <= now.getTime() &&
        entry.weightKg > 0
    )
    .sort((a, b) => a.timestamp - b.timestamp);

  const insufficient: BulkPace = {
    status: "insufficient_data",
    weeklyChangeKg: 0,
    weeklyChangePercent: 0,
    targetMinPercent: band.min,
    targetMaxPercent: band.max,
    suggestedDailyKcalDelta: 0,
  };

  if (recent.length < 2) return insufficient;

  const first = recent[0];
  const last = recent[recent.length - 1];
  const spanDays = (last.timestamp - first.timestamp) / MS_PER_DAY;

  if (spanDays < MIN_SPAN_DAYS) return insufficient;

  const weeklyChangeKg = ((last.weightKg - first.weightKg) / spanDays) * 7;
  const weeklyChangePercent = (weeklyChangeKg / last.weightKg) * 100;

  // Progress measured in the direction of the goal: on a cut, losing
  // weight is positive progress. "too_fast" always means moving faster
  // than the recommended pace toward the goal, "too_slow" the opposite.
  const direction = goal === "cut" ? -1 : 1;
  const progressPercent = weeklyChangePercent * direction;
  const progressMin = Math.min(band.min * direction, band.max * direction);
  const progressMax = Math.max(band.min * direction, band.max * direction);

  const status: BulkPaceStatus =
    progressPercent > progressMax
      ? "too_fast"
      : progressPercent < progressMin
      ? "too_slow"
      : "on_track";

  let suggestedDailyKcalDelta = 0;

  if (status !== "on_track") {
    const targetPercent = (band.min + band.max) / 2;
    const targetWeeklyKg = (targetPercent / 100) * last.weightKg;
    const dailyDelta = ((targetWeeklyKg - weeklyChangeKg) * KCAL_PER_KG) / 7;

    suggestedDailyKcalDelta = Math.round(dailyDelta / 50) * 50;
  }

  return {
    status,
    weeklyChangeKg: Math.round(weeklyChangeKg * 100) / 100,
    weeklyChangePercent: Math.round(weeklyChangePercent * 100) / 100,
    targetMinPercent: band.min,
    targetMaxPercent: band.max,
    suggestedDailyKcalDelta,
  };
}
