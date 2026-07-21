import { useEffect } from "react";
import { ArrowLeft, Dumbbell } from "lucide-react";

import { C, type Screen } from "@/shared/ui";
import EmptyState from "@/shared/EmptyState";
import { classifyWorkoutSplit } from "@/features/workout/utils/workoutRecommendation";
import { useAuthStore } from "@/store/authStore";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";

function fmt(seconds: number) {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return rest > 0 ? `${minutes}m ${rest}s` : `${minutes}m`;
}

const SPLIT_LABELS: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  lower: "Legs",
  full: "Full body",
};

function formatSplit(workout: { exercises?: { id: string; exerciseId?: string; name: string; sets: { reps: number; weight: number }[] }[] }) {
  const split = classifyWorkoutSplit(workout);

  return split ? SPLIT_LABELS[split] ?? "Mixed" : "Mixed";
}

function formatDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return dateKey;

  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function WorkoutHistoryScreen({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}) {
  const user = useAuthStore((s) => s.user);

  const workouts = useWorkoutHistoryStore((s) => s.workouts);
  const loading = useWorkoutHistoryStore((s) => s.loading);
  const loadWorkouts = useWorkoutHistoryStore((s) => s.loadWorkouts);
  const selectWorkout = useWorkoutHistoryStore((s) => s.selectWorkout);

  useEffect(() => {
    if (!user) return;
    loadWorkouts(user.uid);
  }, [user, loadWorkouts]);

  return (
    <div className="px-5 pb-8 pt-4">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-full flex items-center justify-center mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <ArrowLeft size={18} color={C.fg} />
      </button>

      <h2 className="text-[22px] font-extrabold mb-1" style={{ color: C.fg }}>
        Workout History
      </h2>

      <p className="text-sm mb-5" style={{ color: C.fg3 }}>
        Your completed workouts
      </p>

      <div className="flex flex-col gap-3">
        {workouts.length === 0 ? (
          loading ? (
            <>
              <div className="skeleton" style={{ height: 108 }} />
              <div className="skeleton" style={{ height: 108, opacity: 0.7 }} />
              <div className="skeleton" style={{ height: 108, opacity: 0.4 }} />
            </>
          ) : (
            <EmptyState
              icon={Dumbbell}
              title="No workouts yet"
              body="Finish a session and it'll show up here with your volume, sets and personal records."
              actionLabel="Start a workout"
              onAction={() => onNavigate("workout")}
            />
          )
        ) : (
          workouts.map((workout) => (
            <button
              key={workout.id}
              onClick={() => {
                selectWorkout(workout.id);
                onNavigate("workout-detail");
              }}
              className="w-full text-left rounded-[20px] p-4 card-lit"
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                opacity: workout.completedSets === 0 ? 0.55 : 1,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-base font-bold" style={{ color: C.fg }}>
                    {workout.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.fg3 }}>
                    {formatDate(workout.date)}
                  </p>
                </div>

                <p className="text-xs font-bold" style={{ color: C.accentInk }}>
                  {fmt(workout.durationSeconds)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Stat label="Volume" value={`${workout.volumeKg.toLocaleString()} kg`} />
                <Stat label="Sets" value={`${workout.completedSets}/${workout.totalSets}`} />
                <Stat label="Type" value={formatSplit(workout)} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[14px] px-3 py-2"
      style={{ background: C.card2, border: `1px solid ${C.border}` }}
    >
      <p className="text-[11px] mb-1" style={{ color: C.fg3 }}>
        {label}
      </p>
      <p className="text-xs font-bold" style={{ color: C.fg }}>
        {value}
      </p>
    </div>
  );
}