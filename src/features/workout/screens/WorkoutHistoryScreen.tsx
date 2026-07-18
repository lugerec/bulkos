import { useEffect } from "react";
import { ArrowLeft, Dumbbell } from "lucide-react";

import { C, type Screen } from "@/shared/ui";
import EmptyState from "@/shared/EmptyState";
import { useAuthStore } from "@/store/authStore";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";

function fmt(seconds: number) {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return rest > 0 ? `${minutes}m ${rest}s` : `${minutes}m`;
}

function formatType(templateId?: string) {
  if (!templateId) return "Custom";

  return templateId
    .replace("-a", "")
    .replace("-b", "")
    .replace(/^./, (c) => c.toUpperCase());
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
            <div
              className="rounded-[20px] p-5"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <p className="text-sm" style={{ color: C.fg3 }}>
                Loading workouts…
              </p>
            </div>
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
              className="w-full text-left rounded-[20px] p-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-base font-bold" style={{ color: C.fg }}>
                    {workout.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.fg3 }}>
                    {workout.date}
                  </p>
                </div>

                <p className="text-xs font-bold" style={{ color: C.accent }}>
                  {fmt(workout.durationSeconds)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Stat label="Volume" value={`${workout.volumeKg.toLocaleString()} kg`} />
                <Stat label="Sets" value={`${workout.completedSets}/${workout.totalSets}`} />
                <Stat label="Type" value={formatType(workout.templateId)} />
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