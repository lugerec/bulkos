import { ArrowUpRight, Target } from "lucide-react";

import { C } from "@/shared/ui";

type Props = {
  currentWeight: number;
  goalWeight: number;
  weeklyWeightChange: number;
  remainingWeight: number;
};

export default function WeightSection({
  currentWeight,
  goalWeight,
  weeklyWeightChange,
  remainingWeight,
}: Props) {
  return (
    <div className="flex gap-3 mb-5">
      <div
        className="flex-1 rounded-[20px] p-4"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <p className="text-[11px] mb-1.5" style={{ color: C.fg2 }}>
          Current
        </p>

        <p className="text-[22px] font-bold leading-none" style={{ color: C.fg }}>
          {currentWeight}
          <span className="text-sm font-medium ml-1" style={{ color: C.fg3 }}>
            kg
          </span>
        </p>

        <div className="flex items-center gap-1 mt-2">
          <ArrowUpRight size={12} color={C.accent} />
          <span className="text-[11px] font-semibold" style={{ color: C.accent }}>
            {weeklyWeightChange >= 0 ? "+" : ""}
            {weeklyWeightChange.toFixed(1)} kg this week
          </span>
        </div>
      </div>

      <div
        className="flex-1 rounded-[20px] p-4"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <p className="text-[11px] mb-1.5" style={{ color: C.fg2 }}>
          Goal
        </p>

        <p className="text-[22px] font-bold leading-none" style={{ color: C.fg }}>
          {goalWeight}
          <span className="text-sm font-medium ml-1" style={{ color: C.fg3 }}>
            kg
          </span>
        </p>

        <div className="flex items-center gap-1 mt-2">
          <Target size={12} color={C.fg3} />
          <span className="text-[11px]" style={{ color: C.fg3 }}>
            {remainingWeight.toFixed(1)} kg to go
          </span>
        </div>
      </div>
    </div>
  );
}