import type { MuscleGroup } from "@/types/workout";
import type { MuscleSetTargetInfo } from "@/features/workout/utils/workoutRecommendation";

export type BalanceStatus = "balanced" | "mild" | "imbalanced";

export type MuscleBalance = {
  label: string;
  /** muscles counted on each side of the ratio */
  leftMuscles: readonly MuscleGroup[];
  rightMuscles: readonly MuscleGroup[];
  leftLabel: string;
  rightLabel: string;
  leftSets: number;
  rightSets: number;
  /** left ÷ right (0 when right side has no volume) */
  ratio: number;
  /** ideal ratio for this pairing */
  idealRatio: number;
  status: BalanceStatus;
  /** the under-trained side's label, or null when balanced */
  weakerSide: string | null;
};

type BalanceDef = {
  label: string;
  leftLabel: string;
  rightLabel: string;
  left: readonly MuscleGroup[];
  right: readonly MuscleGroup[];
  idealRatio: number;
};

/**
 * Antagonist / movement-pattern pairings with their target ratios.
 * Push:pull is ideally ~1:1; posterior chain (back+hams+glutes) should
 * roughly match or exceed anterior (chest+quads); biceps:triceps ~1:1.
 */
const BALANCE_DEFS: readonly BalanceDef[] = [
  {
    label: "Push / Pull",
    leftLabel: "Push",
    rightLabel: "Pull",
    left: ["chest", "shoulders", "triceps"],
    right: ["back", "biceps"],
    idealRatio: 1,
  },
  {
    label: "Quads / Hamstrings",
    leftLabel: "Quads",
    rightLabel: "Hamstrings",
    left: ["legs"],
    right: ["glutes"],
    idealRatio: 1,
  },
  {
    label: "Biceps / Triceps",
    leftLabel: "Biceps",
    rightLabel: "Triceps",
    left: ["biceps"],
    right: ["triceps"],
    idealRatio: 1,
  },
];

/** Tolerance around the ideal before a pairing is flagged. */
const MILD_THRESHOLD = 0.25;
const IMBALANCED_THRESHOLD = 0.5;

function sumSets(
  targets: ReadonlyMap<MuscleGroup, number>,
  muscles: readonly MuscleGroup[]
): number {
  return muscles.reduce((sum, muscle) => sum + (targets.get(muscle) ?? 0), 0);
}

/**
 * Weekly-set balance across antagonist / movement-pattern pairings. Only
 * pairings with volume on at least one side are returned. Deviation is
 * measured relative to the ideal ratio; the weaker side is the one to add
 * volume to.
 */
export function getMuscleBalance(
  setTargets: readonly MuscleSetTargetInfo[]
): MuscleBalance[] {
  const byMuscle = new Map<MuscleGroup, number>();

  for (const target of setTargets) {
    byMuscle.set(target.muscle, target.weeklySets);
  }

  const result: MuscleBalance[] = [];

  for (const def of BALANCE_DEFS) {
    const leftSets = sumSets(byMuscle, def.left);
    const rightSets = sumSets(byMuscle, def.right);

    if (leftSets === 0 && rightSets === 0) continue;

    const ratio = rightSets > 0 ? leftSets / rightSets : Infinity;

    // Normalized deviation from the ideal ratio, symmetric for both sides.
    let deviation: number;
    let weakerSide: string | null;

    if (rightSets === 0) {
      deviation = Infinity;
      weakerSide = def.rightLabel;
    } else if (leftSets === 0) {
      deviation = Infinity;
      weakerSide = def.leftLabel;
    } else {
      const normalized = ratio / def.idealRatio;
      deviation = Math.abs(Math.log(normalized));
      weakerSide =
        normalized > 1
          ? def.rightLabel
          : normalized < 1
          ? def.leftLabel
          : null;
    }

    const status: BalanceStatus =
      deviation >= IMBALANCED_THRESHOLD
        ? "imbalanced"
        : deviation >= MILD_THRESHOLD
        ? "mild"
        : "balanced";

    result.push({
      label: def.label,
      leftMuscles: def.left,
      rightMuscles: def.right,
      leftLabel: def.leftLabel,
      rightLabel: def.rightLabel,
      leftSets: Math.round(leftSets * 10) / 10,
      rightSets: Math.round(rightSets * 10) / 10,
      ratio: rightSets > 0 ? Math.round(ratio * 100) / 100 : 0,
      idealRatio: def.idealRatio,
      status,
      weakerSide: status === "balanced" ? null : weakerSide,
    });
  }

  return result;
}
