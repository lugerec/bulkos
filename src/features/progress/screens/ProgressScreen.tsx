import { useEffect } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Camera,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { C, type Screen } from "@/shared/ui";
import { ProgressRing, SectionHeader } from "@/shared/components";
import { useAuthStore } from "@/store/authStore";
import { useBodyMetricsStore } from "@/store/bodyMetricsStore";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";

type StrengthPR = {
  lift: string;
  pr: string;
  date: string;
  score: number;
};

function estimateOneRepMax(weight: number, reps: number) {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

function getStrengthPRs(
  workouts: ReturnType<typeof useWorkoutHistoryStore.getState>["workouts"]
) {
  const bestByExercise = new Map<string, StrengthPR>();

  for (const workout of workouts) {
    for (const exercise of workout.exercises ?? []) {
      for (const set of exercise.sets) {
        if (!set.completed) continue;

        const score = estimateOneRepMax(set.weight, set.reps);
        const current = bestByExercise.get(exercise.id);

        if (!current || score > current.score) {
          bestByExercise.set(exercise.id, {
            lift: exercise.name,
            pr: `${set.weight} kg × ${set.reps}`,
            date: workout.date,
            score,
          });
        }
      }
    }
  }

  return Array.from(bestByExercise.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function formatTrainingTime(seconds: number) {
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function formatChange(value: number, unit: string) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)} ${unit}`;
}

export default function ProgressScreen({
  onNavigate,
}: {
  onNavigate: (screen: Screen) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const workouts = useWorkoutHistoryStore((s) => s.workouts);

  const bodyEntries = useBodyMetricsStore((s) => s.entries);
  const loadBodyMetrics = useBodyMetricsStore((s) => s.load);

  useEffect(() => {
    if (!user) return;
    loadBodyMetrics(user.uid);
  }, [user, loadBodyMetrics]);

  const sortedBodyEntries = [...bodyEntries].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const latestBodyEntry =
    sortedBodyEntries.length > 0
      ? sortedBodyEntries[sortedBodyEntries.length - 1]
      : undefined;

  const previousBodyEntry =
    sortedBodyEntries.length > 1
      ? sortedBodyEntries[sortedBodyEntries.length - 2]
      : undefined;

  const currentWeight = latestBodyEntry?.weightKg;
  const currentBodyFat = latestBodyEntry?.bodyFatPct;

  const weightChange =
    latestBodyEntry && previousBodyEntry
      ? latestBodyEntry.weightKg - previousBodyEntry.weightKg
      : 0;

  const bodyFatChange =
    latestBodyEntry?.bodyFatPct != null &&
    previousBodyEntry?.bodyFatPct != null
      ? latestBodyEntry.bodyFatPct - previousBodyEntry.bodyFatPct
      : undefined;

  const weightTrend = sortedBodyEntries.map((entry) => ({
    week: new Date(entry.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    weight: entry.weightKg,
  }));

  const strengthPRs = getStrengthPRs(workouts);

  const totalWorkouts = workouts.length;

  const totalVolume = workouts.reduce(
    (sum, workout) => sum + workout.volumeKg,
    0
  );

  const totalTrainingTime = workouts.reduce(
    (sum, workout) => sum + workout.durationSeconds,
    0
  );

  const prCount = strengthPRs.length;

  const measurementCards = [
    {
      label: "Waist",
      current: latestBodyEntry?.waistCm,
      previous: previousBodyEntry?.waistCm,
      unit: "cm",
    },
    {
      label: "Chest",
      current: latestBodyEntry?.chestCm,
      previous: previousBodyEntry?.chestCm,
      unit: "cm",
    },
    {
      label: "Arms",
      current: latestBodyEntry?.armCm,
      previous: previousBodyEntry?.armCm,
      unit: "cm",
    },
    {
      label: "Legs",
      current: latestBodyEntry?.legCm,
      previous: previousBodyEntry?.legCm,
      unit: "cm",
    },
  ];

  return (
    <div className="px-5 pb-8 pt-4">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold mb-0.5" style={{ color: C.fg }}>
            Progress
          </h2>
          <p className="text-sm" style={{ color: C.fg3 }}>
            Body metrics · Strength · Photos
          </p>
        </div>

        <button
          onClick={() => onNavigate("check-in")}
          className="px-3 py-2 rounded-[14px] text-xs font-bold"
          style={{
            background: C.accent,
            color: C.bg,
          }}
        >
          Check-in
        </button>
      </div>

      <div
        className="rounded-[22px] p-4 mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex justify-between items-end mb-4">
          <div>
            <p
              className="text-[11px] uppercase tracking-wider font-semibold"
              style={{ color: C.fg2 }}
            >
              Bodyweight
            </p>
            <p
              className="text-2xl font-extrabold mt-0.5 leading-none"
              style={{ color: C.fg }}
            >
              {currentWeight ?? "--"}
              <span
                className="text-sm font-medium ml-1"
                style={{ color: C.fg3 }}
              >
                kg
              </span>
            </p>
          </div>

          <div className="flex items-center gap-1 pb-0.5">
            {weightChange >= 0 ? (
              <ArrowUpRight size={14} color={C.accent} />
            ) : (
              <ArrowDownRight size={14} color={C.red} />
            )}

            <span
              className="text-sm font-bold"
              style={{ color: weightChange >= 0 ? C.accent : C.red }}
            >
              {formatChange(weightChange, "kg")}
            </span>
          </div>
        </div>

        <div style={{ height: 120 }}>
          {weightTrend.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm" style={{ color: C.fg3 }}>
                Add your first check-in to see weight progress.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weightTrend}
                margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.accent} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: C.fg3,
                    fontSize: 10,
                    fontFamily: "Inter",
                  }}
                />

                <Tooltip
                  contentStyle={{
                    background: C.card2,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    color: C.fg,
                    fontSize: 12,
                    fontFamily: "Inter",
                  }}
                  labelStyle={{ color: C.fg2 }}
                  cursor={{ stroke: C.border }}
                />

                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke={C.accent}
                  strokeWidth={2}
                  fill="url(#wGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <SectionHeader title="Training Stats" />

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Stat label="Workouts" value={`${totalWorkouts}`} />
        <Stat label="Volume" value={`${totalVolume.toLocaleString()} kg`} />
        <Stat label="Time" value={formatTrainingTime(totalTrainingTime)} />
        <Stat label="PRs" value={`${prCount}`} />
      </div>

      <SectionHeader
        title="Measurements"
        action="New Check-in"
        onAction={() => onNavigate("check-in")}
      />

      <div className="grid grid-cols-2 gap-3 mb-5">
        {measurementCards.map(({ label, current, previous, unit }) => {
          const hasValue = current != null;
          const change =
            current != null && previous != null ? current - previous : null;
          const isDown = change != null && change < 0;

          return (
            <div
              key={label}
              className="rounded-[18px] p-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <p className="text-[11px] mb-2" style={{ color: C.fg2 }}>
                {label}
              </p>

              <p
                className="text-2xl font-bold leading-none"
                style={{ color: C.fg }}
              >
                {hasValue ? current : "--"}
                <span className="text-xs ml-1" style={{ color: C.fg3 }}>
                  {unit}
                </span>
              </p>

              <div className="flex items-center gap-1 mt-2">
                {change == null ? (
                  <span className="text-[11px]" style={{ color: C.fg3 }}>
                    No previous data
                  </span>
                ) : (
                  <>
                    {isDown ? (
                      <ArrowDownRight size={11} color={C.accent} />
                    ) : (
                      <ArrowUpRight size={11} color={C.accent} />
                    )}

                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: C.accent }}
                    >
                      {formatChange(change, unit)}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-[22px] p-4 mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[11px] uppercase tracking-wider font-semibold mb-1.5"
              style={{ color: C.fg2 }}
            >
              Est. Body Fat
            </p>

            <p
              className="text-3xl font-extrabold leading-none"
              style={{ color: C.fg }}
            >
              {currentBodyFat?.toFixed(1) ?? "--"}
              <span className="text-lg ml-0.5">%</span>
            </p>

            {bodyFatChange == null ? (
              <p className="text-xs mt-2" style={{ color: C.fg3 }}>
                Based on latest check-in
              </p>
            ) : (
              <div className="flex items-center gap-1 mt-2">
                {bodyFatChange < 0 ? (
                  <ArrowDownRight size={11} color={C.accent} />
                ) : (
                  <ArrowUpRight size={11} color={C.red} />
                )}

                <span
                  className="text-xs font-semibold"
                  style={{ color: bodyFatChange < 0 ? C.accent : C.red }}
                >
                  {formatChange(bodyFatChange, "%")}
                </span>
              </div>
            )}
          </div>

          <ProgressRing
            value={currentBodyFat ?? 0}
            max={30}
            size={72}
            stroke={6}
            color={C.accent}
          >
            <span className="text-[13px] font-bold" style={{ color: C.fg }}>
              {currentBodyFat != null ? `${Math.round(currentBodyFat)}%` : "--"}
            </span>
          </ProgressRing>
        </div>
      </div>

      <SectionHeader title="Personal Records" action="View all" />

      <div
        className="rounded-[20px] mb-5 overflow-hidden"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        {strengthPRs.length === 0 ? (
          <div className="px-4 py-5">
            <p className="text-sm" style={{ color: C.fg3 }}>
              No personal records yet.
            </p>
          </div>
        ) : (
          strengthPRs.map(({ lift, pr, date }, i) => (
            <div
              key={`${lift}-${date}`}
              className="flex items-center justify-between px-4 py-3.5"
              style={{
                borderBottom:
                  i < strengthPRs.length - 1
                    ? `1px solid ${C.border}`
                    : "none",
              }}
            >
              <div className="flex items-center gap-3">
                <Award size={16} color={C.accent} />

                <div>
                  <p className="text-sm font-medium" style={{ color: C.fg }}>
                    {lift}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: C.fg3 }}>
                    {date}
                  </p>
                </div>
              </div>

              <p className="text-sm font-bold" style={{ color: C.fg }}>
                {pr}
              </p>
            </div>
          ))
        )}
      </div>

      <SectionHeader title="Progress Photos" action="Upload" />

      <div
        className="rounded-[20px] overflow-hidden flex items-center justify-center"
        style={{
          height: 140,
          background: C.card,
          border: `1px solid ${C.border}`,
        }}
      >
        <div className="text-center">
          <Camera size={22} color={C.fg3} className="mx-auto mb-2" />
          <p className="text-sm font-medium" style={{ color: C.fg3 }}>
            Upload progress photos
          </p>
          <p className="text-xs mt-1" style={{ color: C.fg3 }}>
            Compare your transformation week by week
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[18px] p-4"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <p className="text-[11px] mb-2" style={{ color: C.fg2 }}>
        {label}
      </p>

      <p className="text-xl font-bold leading-none" style={{ color: C.fg }}>
        {value}
      </p>
    </div>
  );
}