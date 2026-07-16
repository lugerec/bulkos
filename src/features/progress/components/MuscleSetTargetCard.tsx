import { Target } from "lucide-react";

import { C } from "@/shared/ui";
import { SectionHeader } from "@/shared/components";
import type { MuscleGroup } from "@/types/workout";
import type {
  MuscleSetTargetInfo,
  MuscleSetTargetStatus,
} from "@/features/workout/utils/workoutRecommendation";

type Props = {
  data: MuscleSetTargetInfo[];
};

const MUSCLE_LABELS: Partial<Record<MuscleGroup, string>> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  legs: "Legs",
  glutes: "Glutes",
  calves: "Calves",
  abs: "Abs",
};

const STATUS_LABELS: Record<MuscleSetTargetStatus, string> = {
  under: "Under MEV",
  optimal: "On track",
  high: "Above MAV",
};

function statusColor(status: MuscleSetTargetStatus): string {
  if (status === "under") return C.amber;
  if (status === "high") return C.red;
  return C.accent;
}

const STATUS_ORDER: Record<MuscleSetTargetStatus, number> = {
  under: 0,
  high: 1,
  optimal: 2,
};

export default function MuscleSetTargetCard({ data }: Props) {
  const rows = [...data].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];

    if (statusDiff !== 0) return statusDiff;

    return a.weeklySets / a.mav - b.weeklySets / b.mav;
  });

  const undertrainedCount = rows.filter(
    (item) => item.status === "under"
  ).length;

  return (
    <>
      <SectionHeader title="Weekly Set Targets" />

      <div
        className="rounded-[20px] p-4 mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={16} color={undertrainedCount > 0 ? C.amber : C.accent} />
            <span className="text-sm font-semibold" style={{ color: C.fg }}>
              Volume vs MEV/MAV
            </span>
          </div>

          <span
            className="text-[11px] font-bold"
            style={{ color: undertrainedCount > 0 ? C.amber : C.accent }}
          >
            {undertrainedCount > 0
              ? `${undertrainedCount} behind target`
              : "All on track"}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((item) => {
            const color = statusColor(item.status);
            const fillPercent = Math.min(
              100,
              (item.weeklySets / item.mav) * 100
            );
            const mevMarkerPercent = Math.min(100, (item.mev / item.mav) * 100);

            return (
              <div key={item.muscle}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium" style={{ color: C.fg }}>
                    {MUSCLE_LABELS[item.muscle] ?? item.muscle}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color: C.fg3 }}>
                      {STATUS_LABELS[item.status]}
                    </span>
                    <span
                      className="text-xs font-bold w-16 text-right"
                      style={{ color }}
                    >
                      {item.weeklySets}/{item.mav} sets
                    </span>
                  </div>
                </div>

                <div
                  className="relative"
                  style={{
                    height: 4,
                    background: C.border,
                    borderRadius: 99,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${fillPercent}%`,
                      background: color,
                      borderRadius: 99,
                    }}
                  />

                  <div
                    title={`MEV: ${item.mev} sets`}
                    style={{
                      position: "absolute",
                      top: -2,
                      left: `${mevMarkerPercent}%`,
                      width: 2,
                      height: 8,
                      background: C.fg2,
                      borderRadius: 1,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] mt-4" style={{ color: C.fg3 }}>
          Bar shows weekly sets out of MAV (max adaptive volume). The grey tick
          marks MEV (minimum effective volume).
        </p>
      </div>
    </>
  );
}
