import { Play } from "lucide-react";

import { Badge, SectionHeader } from "@/shared/components";
import { C, type Screen } from "@/shared/ui";

type Props = {
  latestWorkout?: {
    name: string;
    completedSets: number;
    totalSets: number;
    durationSeconds: number;
    volumeKg: number;
  };
  onNavigate: (screen: Screen) => void;
  formatDuration: (seconds: number) => string;
};

export default function WorkoutSection({
  latestWorkout,
  onNavigate,
  formatDuration,
}: Props) {
  const completionPercent = latestWorkout
    ? Math.round((latestWorkout.completedSets / latestWorkout.totalSets) * 100)
    : 0;

  return (
    <>
      <SectionHeader
        title="Today's Training"
        action="History"
        onAction={() => onNavigate("workout-history")}
      />

      <div
        className="rounded-[24px] p-5 mb-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(124,255,107,0.12), rgba(255,181,71,0.07))",
          border: "1px solid rgba(124,255,107,0.2)",
        }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-2"
          style={{ color: C.accent }}
        >
          Today&apos;s Workout
        </p>

        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className="text-2xl font-extrabold leading-none"
              style={{ color: C.fg }}
            >
              {latestWorkout?.name ?? "Push Day A"}
            </p>

            <p className="text-xs mt-2" style={{ color: C.fg3 }}>
              {latestWorkout
                ? `${latestWorkout.completedSets}/${latestWorkout.totalSets} sets completed`
                : "Chest · Shoulders · Triceps"}
            </p>
          </div>

          <Badge>{latestWorkout ? `${completionPercent}%` : "Ready"}</Badge>
        </div>

        <div
          style={{
            height: 6,
            background: C.border,
            borderRadius: 99,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              height: "100%",
              width: latestWorkout
                ? `${Math.min(completionPercent, 100)}%`
                : "0%",
              background: C.accent,
              borderRadius: 99,
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <MiniStat
            label="Sets"
            value={
              latestWorkout
                ? `${latestWorkout.completedSets}/${latestWorkout.totalSets}`
                : "—"
            }
          />

          <MiniStat
            label="Time"
            value={
              latestWorkout
                ? formatDuration(latestWorkout.durationSeconds)
                : "~65m"
            }
          />

          <MiniStat
            label="Volume"
            value={
              latestWorkout
                ? `${latestWorkout.volumeKg.toLocaleString()} kg`
                : "—"
            }
          />
        </div>

        <button
          onClick={() => onNavigate("workout")}
          className="w-full py-4 rounded-[18px] font-bold text-base flex items-center justify-center gap-2"
          style={{
            background: C.accent,
            color: C.bg,
            boxShadow: `0 8px 32px rgba(124,255,107,0.22)`,
          }}
        >
          <Play size={18} fill={C.bg} color={C.bg} />
          {latestWorkout ? "Continue Workout" : "Start Workout"}
        </button>
      </div>
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[14px] px-3 py-2"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${C.border}`,
      }}
    >
      <p className="text-[10px] mb-1" style={{ color: C.fg3 }}>
        {label}
      </p>
      <p className="text-sm font-bold" style={{ color: C.fg }}>
        {value}
      </p>
    </div>
  );
}