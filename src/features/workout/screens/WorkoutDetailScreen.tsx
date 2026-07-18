import { ArrowLeft } from "lucide-react";

import { C, type Screen } from "@/shared/ui";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return rest > 0 ? `${minutes}m ${rest}s` : `${minutes}m`;
}

export default function WorkoutDetailScreen({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}) {
  const workout = useWorkoutHistoryStore((s) => s.selectedWorkout);
  const selectExercise = useWorkoutHistoryStore((s) => s.selectExercise);

  if (!workout) {
    return (
      <div className="px-5 pt-4">
        <BackButton onBack={onBack} />
        <p className="text-sm" style={{ color: C.fg3 }}>
          Workout not found.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 pb-8 pt-4">
      <BackButton onBack={onBack} />

      <h2 className="text-[22px] font-extrabold mb-1" style={{ color: C.fg }}>
        {workout.name}
      </h2>

      <p className="text-sm mb-5" style={{ color: C.fg3 }}>
        {workout.date}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <Stat label="Duration" value={formatDuration(workout.durationSeconds)} />
        <Stat label="Volume" value={`${workout.volumeKg.toLocaleString()} kg`} />
        <Stat label="Sets" value={`${workout.completedSets}/${workout.totalSets}`} />
      </div>

      <div className="flex flex-col gap-4">
        {(workout.exercises ?? []).map((exercise) => {
          const completedSets = exercise.sets.filter((set) => set.completed);
          const exerciseVolume = completedSets.reduce(
            (sum, set) => sum + set.weight * set.reps,
            0
          );

          return (
            <div
              key={exercise.id}
              className="rounded-[20px] p-4 card-lit"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="mb-3">
                <button
                  onClick={() => {
                    selectExercise(exercise.id, exercise.name);
                    onNavigate("exercise-history");
                  }}
                  className="text-base font-bold text-left"
                  style={{ color: C.fg }}
                >
                  {exercise.name}
                </button>

                <p className="text-xs mt-1" style={{ color: C.fg3 }}>
                  {completedSets.length}/{exercise.sets.length} sets ·{" "}
                  {exerciseVolume.toLocaleString()} kg volume
                </p>

                {exercise.notes && (
                  <p
                    className="text-[11px] mt-2 italic"
                    style={{ color: C.fg2 }}
                  >
                    “{exercise.notes}”
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {exercise.sets.map((set, index) => (
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

                    <div className="flex items-center gap-2">
                      {set.effort && (
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                          style={{
                            background: C.card,
                            border: `1px solid ${C.border}`,
                            color:
                              set.effort === "hard"
                                ? C.amber
                                : set.effort === "easy"
                                ? C.blue
                                : C.accent,
                          }}
                        >
                          {set.effort === "moderate" ? "ok" : set.effort}
                        </span>
                      )}

                      <span
                        className="text-sm font-bold"
                        style={{ color: C.fg }}
                      >
                        {set.weight} kg × {set.reps}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="w-10 h-10 rounded-full flex items-center justify-center mb-5"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <ArrowLeft size={18} color={C.fg} />
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[14px] px-3 py-3"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
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