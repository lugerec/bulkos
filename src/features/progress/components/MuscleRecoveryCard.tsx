import { BatteryCharging } from "lucide-react";

import { C } from "@/shared/ui";
import { SectionHeader } from "@/shared/components";
import type { MuscleGroup } from "@/types/workout";
import type { MuscleRecoveryInfo } from "@/features/workout/utils/workoutRecommendation";

type Props = {
  data: MuscleRecoveryInfo[];
};

const HIDDEN_MUSCLES: readonly MuscleGroup[] = ["cardio", "fullBody", "neck"];

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

function recoveryColor(percent: number): string {
  if (percent < 50) return C.red;
  if (percent < 80) return C.amber;
  return C.accent;
}

function formatLastTrained(hours: number | null): string {
  if (hours === null) return "Not trained recently";
  if (hours < 24) return `${Math.round(hours)}h ago`;

  return `${Math.round(hours / 24)}d ago`;
}

export default function MuscleRecoveryCard({ data }: Props) {
  const rows = data
    .filter((item) => !HIDDEN_MUSCLES.includes(item.muscle))
    .sort((a, b) => a.recoveryPercent - b.recoveryPercent);

  const trained = rows.filter((item) => item.hoursSinceTrained !== null);
  const averageRecovery =
    trained.length > 0
      ? Math.round(
          trained.reduce((sum, item) => sum + item.recoveryPercent, 0) /
            trained.length
        )
      : 100;

  return (
    <>
      <SectionHeader title="Muscle Recovery" />

      <div
        className="rounded-[22px] p-4 mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BatteryCharging size={16} color={recoveryColor(averageRecovery)} />
            <span className="text-sm font-semibold" style={{ color: C.fg }}>
              Overall readiness
            </span>
          </div>

          <span
            className="text-sm font-bold"
            style={{ color: recoveryColor(averageRecovery) }}
          >
            {averageRecovery}%
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((item) => {
            const color = recoveryColor(item.recoveryPercent);

            return (
              <div key={item.muscle}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium" style={{ color: C.fg }}>
                    {MUSCLE_LABELS[item.muscle] ?? item.muscle}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color: C.fg3 }}>
                      {formatLastTrained(item.hoursSinceTrained)}
                    </span>
                    <span
                      className="text-xs font-bold w-9 text-right"
                      style={{ color }}
                    >
                      {item.recoveryPercent}%
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    height: 4,
                    background: C.border,
                    borderRadius: 99,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(item.recoveryPercent, 100)}%`,
                      background: color,
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}