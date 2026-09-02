import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  Tooltip,
} from "recharts";
import { ArrowLeft, TrendingUp, Lock } from "lucide-react";

import { C, type Screen } from "@/shared/ui";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";
import { useEntitlementStore } from "@/store/entitlementStore";
import { exerciseDefinitions } from "@/data/exercises";
import {
  getWeeklyVolumeTrend,
  getStrengthTrend,
  getMuscleVolumeTrend,
} from "@/features/analytics/proAnalytics";

const MUSCLE_GROUP_LOOKUP = new Map(
  exerciseDefinitions.map((def) => [def.id, def.primaryMuscle])
);

const MUSCLE_LABELS: Record<string, string> = {
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
  neck: "Neck",
  cardio: "Cardio",
  fullBody: "Full Body",
  Other: "Other",
};

export default function ProAnalyticsScreen({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}) {
  const isPro = useEntitlementStore((s) => s.isPro);
  const workouts = useWorkoutHistoryStore((s) => s.workouts);

  const exercisesWithHistory = useMemo(() => {
    const seen = new Map<string, string>();
    for (const w of workouts) {
      for (const ex of w.exercises ?? []) {
        const id = ex.exerciseId ?? ex.id;
        if (!seen.has(id)) seen.set(id, ex.name);
      }
    }
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [workouts]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    exercisesWithHistory[0]?.id ?? null
  );

  const volumeTrend = useMemo(() => getWeeklyVolumeTrend(workouts, 12), [workouts]);

  const selectedExercise = exercisesWithHistory.find(
    (e) => e.id === selectedExerciseId
  );
  const strengthTrend = useMemo(
    () => (selectedExercise ? getStrengthTrend(workouts, selectedExercise) : []),
    [workouts, selectedExercise]
  );

  const muscleTrend = useMemo(
    () => getMuscleVolumeTrend(workouts, MUSCLE_GROUP_LOOKUP),
    [workouts]
  );

  if (!isPro) {
    return (
      <div className="px-5 pb-10" style={{ paddingTop: 8 }}>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            aria-label="Back"
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-extrabold" style={{ color: C.fg }}>
            Advanced Analytics
          </h1>
        </div>

        <div
          className="rounded-[20px] p-6 text-center"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: C.accentDim }}
          >
            <Lock size={24} color={C.accent} />
          </div>
          <p className="text-sm font-bold mb-1" style={{ color: C.fg }}>
            This is a Pro feature
          </p>
          <p className="text-[12px] mb-5" style={{ color: C.fg3 }}>
            Strength trends, 12-week volume, and muscle balance across your
            full training history.
          </p>
          <button
            onClick={() => onNavigate("paywall")}
            className="w-full py-3.5 rounded-[16px] font-bold text-sm"
            style={{ background: C.accent, color: C.onAccent }}
          >
            See Pro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-10" style={{ paddingTop: 8 }}>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-extrabold" style={{ color: C.fg }}>
          Advanced Analytics
        </h1>
      </div>

      {/* Volume trend */}
      <div
        className="rounded-[20px] p-4 mb-4"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: C.fg2 }}>
          Volume — last 12 weeks
        </p>

        {volumeTrend.every((w) => w.volumeKg === 0) ? (
          <p className="text-sm py-6 text-center" style={{ color: C.fg3 }}>
            No logged training in this window yet.
          </p>
        ) : (
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeTrend}>
                <defs>
                  <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.accent} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="weekStart" hide />
                <Tooltip
                  contentStyle={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 11 }}
                  formatter={(value: number) => [`${value.toLocaleString()} kg`, "Volume"]}
                  labelFormatter={(label) => `Week of ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="volumeKg"
                  stroke={C.accent}
                  strokeWidth={2}
                  fill="url(#volumeFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Strength trend */}
      <div
        className="rounded-[20px] p-4 mb-4"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: C.fg2 }}>
            Est. 1RM trend
          </p>
          <TrendingUp size={14} color={C.accent} />
        </div>

        {exercisesWithHistory.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: C.fg3 }}>
            Log a few sessions to see strength trends here.
          </p>
        ) : (
          <>
            <select
              value={selectedExerciseId ?? ""}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="w-full mb-3 px-3 py-2.5 rounded-[12px] text-sm outline-none"
              style={{ background: C.card2, color: C.fg, border: `1px solid ${C.border}` }}
            >
              {exercisesWithHistory.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>

            {strengthTrend.length < 2 ? (
              <p className="text-sm py-6 text-center" style={{ color: C.fg3 }}>
                Need at least two sessions of this exercise to chart a trend.
              </p>
            ) : (
              <div style={{ height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={strengthTrend}>
                    <XAxis dataKey="date" hide />
                    <Tooltip
                      contentStyle={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 11 }}
                      formatter={(value: number) => [`${value} kg`, "Est. 1RM"]}
                      labelFormatter={(label) => label}
                    />
                    <Line
                      type="monotone"
                      dataKey="estimatedOneRepMax"
                      stroke={C.accent}
                      strokeWidth={2}
                      dot={{ r: 3, fill: C.accent }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>

      {/* Muscle balance */}
      <div
        className="rounded-[20px] p-4"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: C.fg2 }}>
          Muscle balance — this week vs last
        </p>

        {muscleTrend.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: C.fg3 }}>
            No sets logged in the last two weeks.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {muscleTrend.slice(0, 8).map((m) => {
              const max = Math.max(m.setsThisWeek, m.setsLastWeek, 1);
              return (
                <div key={m.muscleGroup}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: C.fg }}>
                      {MUSCLE_LABELS[m.muscleGroup] ?? m.muscleGroup}
                    </span>
                    <span className="text-[11px]" style={{ color: C.fg3 }}>
                      {m.setsThisWeek} sets{" "}
                      <span style={{ opacity: 0.6 }}>(was {m.setsLastWeek})</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.card2 }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(m.setsThisWeek / max) * 100}%`,
                        background: C.accent,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
