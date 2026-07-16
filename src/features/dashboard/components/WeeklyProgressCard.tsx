import { Badge } from "@/shared/components";
import { C } from "@/shared/ui";

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
      className="rounded-[24px] p-5 mb-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(163,230,53,0.10), rgba(96,165,250,0.08))",
        border: "1px solid rgba(163,230,53,0.18)",
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: C.accent }}
          >
            This Week
          </p>

          <p className="text-2xl font-extrabold" style={{ color: C.fg }}>
            {workoutsThisWeek}/{weeklyWorkoutGoal} workouts
          </p>
        </div>

        <Badge>{Math.round(weeklyProgress * 100)}%</Badge>
      </div>

      <div
        style={{
          height: 5,
          background: C.border,
          borderRadius: 99,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(weeklyProgress * 100, 100)}%`,
            background: C.accent,
            borderRadius: 99,
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MiniStat
          label="Volume"
          value={`${volumeThisWeek.toLocaleString()} kg`}
        />
        <MiniStat label="Time" value={trainingTimeThisWeek} />
      </div>
    </div>
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