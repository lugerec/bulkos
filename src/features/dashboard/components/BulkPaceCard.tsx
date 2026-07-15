import { Gauge } from "lucide-react";

import { C } from "@/shared/ui";
import type { BulkPace } from "@/lib/bulkPace";
import type { Goal } from "@/types/profile";

type Props = {
  pace: BulkPace;
  goal: Goal;
};

const GOAL_LABELS: Record<Goal, string> = {
  bulk: "Bulk pace",
  cut: "Cut pace",
  maintain: "Weight stability",
};

/**
 * Dashboard card comparing the measured weekly weight trend against the
 * recommended band for the goal, with a concrete calorie adjustment.
 */
export default function BulkPaceCard({ pace, goal }: Props) {
  if (pace.status === "insufficient_data") return null;

  const color =
    pace.status === "on_track"
      ? C.accent
      : pace.status === "too_fast"
      ? C.red
      : C.amber;

  const statusLabel =
    pace.status === "on_track"
      ? "On track"
      : goal === "maintain"
      ? pace.status === "too_fast"
        ? "Gaining weight"
        : "Losing weight"
      : pace.status === "too_fast"
      ? goal === "cut"
        ? "Losing too fast"
        : "Gaining too fast"
      : goal === "cut"
      ? "Losing too slowly"
      : "Gaining too slowly";

  const signed = (value: number, unit: string) =>
    `${value > 0 ? "+" : ""}${value}${unit}`;

  const advice =
    pace.status === "on_track"
      ? "Keep doing what you're doing."
      : pace.suggestedDailyKcalDelta > 0
      ? `Try eating about ${pace.suggestedDailyKcalDelta} kcal more per day.`
      : `Try eating about ${Math.abs(
          pace.suggestedDailyKcalDelta
        )} kcal less per day.`;

  return (
    <div
      className="rounded-[22px] p-4 mb-5"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Gauge size={16} color={color} />
          <span className="text-sm font-semibold" style={{ color: C.fg }}>
            {GOAL_LABELS[goal]}
          </span>
        </div>

        <span className="text-[11px] font-bold" style={{ color }}>
          {statusLabel}
        </span>
      </div>

      <p className="text-xs mb-1" style={{ color: C.fg2 }}>
        You're trending {signed(pace.weeklyChangeKg, " kg")} per week (
        {signed(pace.weeklyChangePercent, "%")}). Recommended:{" "}
        {signed(pace.targetMinPercent, "%")} to{" "}
        {signed(pace.targetMaxPercent, "%")} per week.
      </p>

      <p className="text-xs font-semibold" style={{ color }}>
        {advice}
      </p>
    </div>
  );
}
