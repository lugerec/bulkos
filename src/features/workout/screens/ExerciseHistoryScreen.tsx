import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { C } from "@/shared/ui";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";

type ChartMode = "est1RM" | "maxWeight" | "volume";

type ExerciseHistoryEntry = {
  workoutId: string;
  date: string;
  workoutName: string;
  sets: { reps: number; weight: number; completed: boolean }[];
  completedSets: { reps: number; weight: number; completed: boolean }[];
  volume: number;
  maxWeight: number;
  estimatedOneRepMax: number;
};

function estimateOneRepMax(weight: number, reps: number) {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export default function ExerciseHistoryScreen({ onBack }: { onBack: () => void }) {
  const [chartMode, setChartMode] = useState<ChartMode>("est1RM");

  const workouts = useWorkoutHistoryStore((s) => s.workouts);
  const exerciseId = useWorkoutHistoryStore((s) => s.selectedExerciseId);
  const exerciseName = useWorkoutHistoryStore((s) => s.selectedExerciseName);

  const history = workouts
    .map((workout): ExerciseHistoryEntry | null => {
      const exercise = workout.exercises?.find((ex) => ex.id === exerciseId);
      if (!exercise) return null;

      const completedSets = exercise.sets.filter((set) => set.completed);

      const volume = completedSets.reduce(
        (sum, set) => sum + set.weight * set.reps,
        0
      );

      const maxWeight = completedSets.reduce(
        (max, set) => Math.max(max, set.weight),
        0
      );

      const estimatedOneRepMax = completedSets.reduce(
        (max, set) => Math.max(max, estimateOneRepMax(set.weight, set.reps)),
        0
      );

      return {
        workoutId: workout.id,
        date: workout.date,
        workoutName: workout.name,
        sets: exercise.sets,
        completedSets,
        volume,
        maxWeight,
        estimatedOneRepMax,
      };
    })
    .filter((entry): entry is ExerciseHistoryEntry => entry !== null);

  const chronologicalHistory = [...history].reverse();

  const chartData = chronologicalHistory.map((entry) => ({
    date: entry.date.slice(5),
    maxWeight: entry.maxWeight,
    est1RM: entry.estimatedOneRepMax,
    volume: entry.volume,
  }));

  const allCompletedSets = history.flatMap((entry) => entry.completedSets);

  const maxWeight = allCompletedSets.reduce(
    (max, set) => Math.max(max, set.weight),
    0
  );

  const estimatedOneRepMax = allCompletedSets.reduce(
    (max, set) => Math.max(max, estimateOneRepMax(set.weight, set.reps)),
    0
  );

  const totalVolume = history.reduce((sum, entry) => sum + entry.volume, 0);

  const chartTitle =
    chartMode === "est1RM"
      ? "Estimated 1RM"
      : chartMode === "maxWeight"
        ? "Max weight"
        : "Volume";

  return (
    <div className="px-5 pb-8 pt-4">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-full flex items-center justify-center mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <ArrowLeft size={18} color={C.fg} />
      </button>

      <h2 className="text-2xl font-extrabold mb-1" style={{ color: C.fg }}>
        {exerciseName ?? "Exercise"}
      </h2>

      <p className="text-sm mb-5" style={{ color: C.fg3 }}>
        Exercise progress
      </p>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <Stat label="Max weight" value={`${maxWeight} kg`} />
        <Stat label="Est. 1RM" value={`${estimatedOneRepMax} kg`} />
        <Stat label="Total volume" value={`${totalVolume.toLocaleString()} kg`} />
        <Stat label="Sessions" value={`${history.length}`} />
      </div>

      {chartData.length > 0 && (
        <div
          className="rounded-[20px] p-4 mb-5"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: C.fg }}>
                {chartTitle}
              </p>
              <p className="text-xs" style={{ color: C.fg3 }}>
                Progress over time
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <ChartPill active={chartMode === "est1RM"} onClick={() => setChartMode("est1RM")}>
              1RM
            </ChartPill>
            <ChartPill active={chartMode === "maxWeight"} onClick={() => setChartMode("maxWeight")}>
              Max
            </ChartPill>
            <ChartPill active={chartMode === "volume"} onClick={() => setChartMode("volume")}>
              Volume
            </ChartPill>
          </div>

          <div style={{ height: 170 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: C.fg3, fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    background: C.card2,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    fontSize: 12,
                    color: C.fg,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={chartMode}
                  stroke={C.accent}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {history.length === 0 ? (
          <div
            className="rounded-[20px] p-5"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <p className="text-sm" style={{ color: C.fg3 }}>
              No history for this exercise yet.
            </p>
          </div>
        ) : (
          history.map((entry) => (
            <div
              key={entry.workoutId}
              className="rounded-[20px] p-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: C.fg }}>
                    {entry.date}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.fg3 }}>
                    {entry.workoutName}
                  </p>
                </div>

                <p className="text-xs font-bold" style={{ color: C.accent }}>
                  {entry.estimatedOneRepMax} kg est. 1RM
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <Stat label="Volume" value={`${entry.volume.toLocaleString()} kg`} />
                <Stat label="Max" value={`${entry.maxWeight} kg`} />
              </div>

              <div className="flex flex-col gap-2">
                {entry.sets.map((set, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-[14px] px-3 py-2"
                    style={{
                      background: C.card2,
                      border: `1px solid ${set.completed ? C.accent : C.border}`,
                      opacity: set.completed ? 1 : 0.45,
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: C.fg3 }}>
                      Set {index + 1}
                    </span>

                    <span className="text-sm font-bold" style={{ color: C.fg }}>
                      {set.weight} kg × {set.reps}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ChartPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-bold"
      style={{
        background: active ? C.accentDim : C.card2,
        color: active ? C.accent : C.fg3,
        border: `1px solid ${active ? C.accent : C.border}`,
      }}
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[14px] px-3 py-2"
      style={{ background: C.card2, border: `1px solid ${C.border}` }}
    >
      <p className="text-[10px] mb-1" style={{ color: C.fg3 }}>
        {label}
      </p>
      <p className="text-xs font-bold" style={{ color: C.fg }}>
        {value}
      </p>
    </div>
  );
}