import { ArrowLeft } from "lucide-react";

import { C } from "@/shared/ui";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";

export default function ExerciseHistoryScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const workouts = useWorkoutHistoryStore((s) => s.workouts);
  const exerciseId = useWorkoutHistoryStore((s) => s.selectedExerciseId);
  const exerciseName = useWorkoutHistoryStore((s) => s.selectedExerciseName);

  const history = workouts
    .map((workout) => {
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

      return {
        workoutId: workout.id,
        date: workout.date,
        workoutName: workout.name,
        sets: exercise.sets,
        completedSets,
        volume,
        maxWeight,
      };
    })
    .filter(Boolean);

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
        Strength history
      </p>

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
              key={entry!.workoutId}
              className="rounded-[20px] p-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: C.fg }}>
                    {entry!.date}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.fg3 }}>
                    {entry!.workoutName}
                  </p>
                </div>

                <p className="text-xs font-bold" style={{ color: C.accent }}>
                  {entry!.maxWeight} kg max
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <Stat
                  label="Volume"
                  value={`${entry!.volume.toLocaleString()} kg`}
                />
                <Stat
                  label="Sets"
                  value={`${entry!.completedSets.length}/${entry!.sets.length}`}
                />
              </div>

              <div className="flex flex-col gap-2">
                {entry!.sets.map((set, index) => (
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