import type { ReactNode } from "react";
import { Dumbbell, Timer, TrendingUp } from "lucide-react";

import { Badge, StatTile } from "@/shared/components";
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
