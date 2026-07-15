import type { BulkPace } from "@/lib/bulkPace";
import type { FrequencyAdherence } from "@/features/workout/utils/frequencyAdherence";
import type {
  MuscleRecoveryInfo,
  MuscleSetTargetInfo,
} from "@/features/workout/utils/workoutRecommendation";
import type { Goal } from "@/types/profile";

export type AnalyticsScore = {
  label: string;
  /** 0–100; null when there isn't enough data to score */
  value: number | null;
  description: string;
};

const PACE_LABELS: Record<Goal, string> = {
  bulk: "Lean Bulk Score",
  cut: "Cut Score",
  maintain: "Maintenance Score",
};

function describe(value: number | null): string {
  if (value === null) return "Not enough data";
  if (value >= 85) return "Excellent";
  if (value >= 70) return "Good";
  if (value >= 50) return "Fair";

  return "Needs work";
}

function clampScore(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)));
}

/**
 * Pace score: full marks inside the recommended band, dropping with how
 * far (in % BW/week) the measured rate sits outside it.
 */
export function getPaceScore(pace: BulkPace): number | null {
  if (pace.status === "insufficient_data") return null;
  if (pace.status === "on_track") return 95;

  const overshoot =
    pace.weeklyChangePercent > pace.targetMaxPercent
      ? pace.weeklyChangePercent - pace.targetMaxPercent
      : pace.targetMinPercent - pace.weeklyChangePercent;

  return clampScore(95 - overshoot * 100);
}

/**
 * Consistency: 70% from the 4-week hit rate, 30% from progress toward
 * this week's target.
 */
export function getConsistencyScore(adherence: FrequencyAdherence): number {
  const hitRate =
    adherence.recentWeeks.length > 0
      ? adherence.recentWeeks.filter((week) => week.hit).length /
        adherence.recentWeeks.length
      : 0;
  const currentProgress =
    adherence.targetPerWeek > 0
      ? Math.min(1, adherence.completedThisWeek / adherence.targetPerWeek)
      : 0;

  return clampScore(hitRate * 70 + currentProgress * 30);
}

/** Recovery: average recovery percent across all muscles. */
export function getRecoveryScore(
  muscleRecovery: readonly MuscleRecoveryInfo[]
): number {
  if (muscleRecovery.length === 0) return 100;

  return clampScore(
    muscleRecovery.reduce((sum, item) => sum + item.recoveryPercent, 0) /
      muscleRecovery.length
  );
}

/**
 * Volume: per tracked muscle — optimal counts fully, under scales with
 * progress toward MEV, above MAV gets partial credit for training but
 * flags junk volume.
 */
export function getVolumeScore(
  setTargets: readonly MuscleSetTargetInfo[]
): number | null {
  if (setTargets.length === 0) return null;

  const total = setTargets.reduce((sum, target) => {
    if (target.status === "optimal") return sum + 1;
    if (target.status === "high") return sum + 0.7;

    return sum + (target.mev > 0 ? target.weeklySets / target.mev : 0);
  }, 0);

  return clampScore((total / setTargets.length) * 100);
}

export function getAnalyticsScores(input: {
  pace: BulkPace;
  goal: Goal;
  adherence: FrequencyAdherence;
  muscleRecovery: readonly MuscleRecoveryInfo[];
  setTargets: readonly MuscleSetTargetInfo[];
}): AnalyticsScore[] {
  const pace = getPaceScore(input.pace);
  const consistency = getConsistencyScore(input.adherence);
  const recovery = getRecoveryScore(input.muscleRecovery);
  const volume = getVolumeScore(input.setTargets);

  return [
    {
      label: PACE_LABELS[input.goal],
      value: pace,
      description: describe(pace),
    },
    {
      label: "Training Consistency",
      value: consistency,
      description: describe(consistency),
    },
    {
      label: "Recovery Score",
      value: recovery,
      description: describe(recovery),
    },
    {
      label: "Volume Score",
      value: volume,
      description: describe(volume),
    },
  ];
}
