import type { ReactNode } from "react";
import { Dumbbell, Timer, TrendingUp } from "lucide-react";

import { Badge } from "@/shared/components";
import { C, T } from "@/shared/ui";

type Props = {
  workoutsThisWeek: number;
  weeklyWorkoutGoal: number;
  weeklyProgress: number;
  volumeThisWeek: number;
  trainingTimeThisWeek: string;
};

export default function WeeklyProgressCard({
  workoutsThisWeek,
  weeklyWorkoutGoal,
  weeklyProgress,
  volumeThisWeek,
  trainingTimeThisWeek,
}: Props) {
  return (
    <div
      className="rounded-[24px] p-5 mb-4 card-lit"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex justify-between items-center mb-4">
        <p style={{ ...T.eyebrow, color: C.fg3 }}>This week</p>
        <Badge>{Math.round(weeklyProgress * 100)}%</Badge>
      </div>

      <div
        style={{
          height: 8,
          background: C.card2,
          borderRadius: 99,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(weeklyProgress * 100, 100)}%`,
            transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            background: C.accent,
            borderRadius: 99,
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={<Dumbbell size={16} />}
          value={`${workoutsThisWeek}/${weeklyWorkoutGoal}`}
          label="Workouts"
        />
        <StatTile
          icon={<TrendingUp size={16} />}
          value={formatVolume(volumeThisWeek)}
          label="Volume"
        />
        <StatTile
          icon={<Timer size={16} />}
          value={trainingTimeThisWeek}
          label="Time"
        />
      </div>
    </div>
  );
}

function formatVolume(kg: number) {
  if (kg >= 10000) return `${(kg / 1000).toFixed(1)}t`;

  return `${kg.toLocaleString()} kg`;
}

/** Reference-style stat tile: icon in a tinted squircle, value, quiet label. */
function StatTile({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div
      className="rounded-[16px] px-3 py-3 flex flex-col items-start gap-2"
      style={{ background: C.card2, border: `1px solid ${C.border}` }}
    >
      <div
        className="w-8 h-8 rounded-[10px] flex items-center justify-center"
        style={{ background: C.accentDim, color: C.accent }}
      >
        {icon}
      </div>

      <div>
        <p style={{ ...T.bodyStrong, color: C.fg }}>{value}</p>
        <p className="mt-0.5" style={{ ...T.caption, color: C.fg3 }}>
          {label}
        </p>
      </div>
    </div>
  );
}
