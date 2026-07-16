import { Target } from "lucide-react";

import { C } from "@/shared/ui";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";

function estimateOneRepMax(weight: number, reps: number) {
  return Math.round(weight * (1 + reps / 30));
}

export default function NextTargetCard() {
  const workouts = useWorkoutHistoryStore((s) => s.workouts);

  const bestSet = workouts
    .flatMap((workout) =>
      (workout.exercises ?? []).flatMap((exercise) =>
        exercise.sets
          .filter((set) => set.completed)
          .map((set) => ({
            exerciseName: exercise.name,
            weight: set.weight,
            reps: set.reps,
            score: estimateOneRepMax(set.weight, set.reps),
          }))
      )
    )
    .sort((a, b) => b.score - a.score)[0];

  if (!bestSet) return null;

  const suggested =
    bestSet.reps >= 10
      ? { weight: bestSet.weight + 2.5, reps: bestSet.reps }
      : { weight: bestSet.weight, reps: bestSet.reps + 1 };

  return (
    <div
      className="rounded-[24px] p-5 mb-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(163,230,53,0.12), rgba(96,165,250,0.08))",
        border: "1px solid rgba(163,230,53,0.2)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: C.accentDim }}
        >
          <Target size={18} color={C.accent} />
        </div>

        <div className="flex-1">
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: C.accent }}
          >
            Next Target
          </p>

          <p className="text-lg font-extrabold" style={{ color: C.fg }}>
            {bestSet.exerciseName}
          </p>

          <p className="text-sm mt-1" style={{ color: C.fg3 }}>
            Recommended next set
          </p>

          <p className="text-2xl font-extrabold mt-3" style={{ color: C.fg }}>
            {suggested.weight} kg × {suggested.reps}
          </p>
        </div>
      </div>
    </div>
  );
}