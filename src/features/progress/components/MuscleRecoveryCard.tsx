import { useState } from "react";
import { BatteryCharging, ChevronDown } from "lucide-react";

import { C } from "@/shared/ui";
import { SectionHeader } from "@/shared/components";
import type { MuscleGroup } from "@/types/workout";
import {
  getMuscleRecoveryDetail,
  type MuscleRecoveryInfo,
  type RecommendationWorkout,
} from "@/features/workout/utils/workoutRecommendation";

type Props = {
  data: MuscleRecoveryInfo[];
  /** when provided, rows expand into a per-muscle session breakdown */
  workouts?: readonly RecommendationWorkout[];
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

function formatEta(hours: number): string {
  if (hours <= 0) return "Fully recovered";
  if (hours < 24) return `Back to 100% in ~${hours}h`;

  const days = Math.floor(hours / 24);
  const rest = Math.round(hours % 24);

  return rest > 0
    ? `Back to 100% in ~${days}d ${rest}h`
    : `Back to 100% in ~${days}d`;
}

export default function MuscleRecoveryCard({ data, workouts }: Props) {
  const [expandedMuscle, setExpandedMuscle] = useState<MuscleGroup | null>(
    null
  );

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
            const isExpandable = workouts !== undefined;
            const isExpanded = expandedMuscle === item.muscle;
            const detail =
              isExpanded && workouts
                ? getMuscleRecoveryDetail(item.muscle, workouts)
                : null;

            return (
              <div key={item.muscle}>
                <button
                  type="button"
                  onClick={
                    isExpandable
                      ? () =>
                          setExpandedMuscle(isExpanded ? null : item.muscle)
                      : undefined
                  }
                  className="w-full text-left"
                  style={{ cursor: isExpandable ? "pointer" : "default" }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1">
                      <span
                        className="text-xs font-medium"
                        style={{ color: C.fg }}
                      >
                        {MUSCLE_LABELS[item.muscle] ?? item.muscle}
                      </span>

                      {isExpandable && (
                        <ChevronDown
                          size={12}
                          color={C.fg3}
                          style={{
                            transform: isExpanded
                              ? "rotate(180deg)"
                              : "none",
                            transition: "transform 0.15s",
                          }}
                        />
                      )}
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
                </button>

                {detail && (
                  <div
                    className="mt-2 rounded-[14px] p-3"
                    style={{
                      background: C.card2,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <p
                      className="text-[11px] font-semibold mb-2"
                      style={{ color }}
                    >
                      {formatEta(detail.hoursToFullRecovery)}
                    </p>

                    {detail.sessions.length === 0 ? (
                      <p className="text-[11px]" style={{ color: C.fg3 }}>
                        No sessions loaded this muscle in the last 10 days.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {detail.sessions.map((session) => (
                          <div
                            key={`${session.workoutId}-${session.date}`}
                            className="flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <p
                                className="text-[11px] font-medium truncate"
                                style={{ color: C.fg2 }}
                              >
                                {session.workoutName}
                              </p>
                              <p
                                className="text-[10px]"
                                style={{ color: C.fg3 }}
                              >
                                {session.date}
                              </p>
                            </div>

                            <p
                              className="text-[11px] font-semibold whitespace-nowrap ml-2"
                              style={{ color: C.fg2 }}
                            >
                              {session.weightedSets} sets ·{" "}
                              {session.weightedVolumeKg.toLocaleString()} kg
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}