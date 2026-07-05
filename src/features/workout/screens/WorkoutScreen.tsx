import { findSetPRs, type PersonalRecord } from "@/features/workout/utils/pr";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";
import { useEffect, useState } from "react";
import { CheckCircle2, Timer, X } from "lucide-react";

import { C } from "@/shared/ui";
import { useAuthStore } from "@/store/authStore";
import { useWorkoutTemplateStore } from "@/store/workoutTemplateStore";
import { saveWorkout } from "@/services/workoutService";
import WorkoutSetRow from "@/features/workout/components/WorkoutSetRow";
import type { WorkoutExercise } from "@/types/workout";

const fmt = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
    .toString()
    .padStart(2, "0")}`;

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function WorkoutScreen() {
  const user = useAuthStore((s) => s.user);
  const workout = useWorkoutTemplateStore((s) => s.selected);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);

  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workouts = useWorkoutHistoryStore((s) => s.workouts);
  const loadWorkouts = useWorkoutHistoryStore((s) => s.loadWorkouts);

function getPreviousExercise(exerciseId: string) {
  for (const loggedWorkout of workouts) {
    const exercise = loggedWorkout.exercises?.find(
      (e) => e.id === exerciseId
    );

    if (exercise) return exercise;
  }

  return undefined;
}

useEffect(() => {
  if (!user) return;
  loadWorkouts(user.uid);
}, [user, loadWorkouts]);

useEffect(() => {
  if (!workout) return;

  setExercises(
    workout.exercises.map((exercise) => {
      const previous = getPreviousExercise(exercise.id);

      return {
        ...exercise,
        sets: exercise.sets.map((set, index) => {
          const previousSet = previous?.sets[index];

          if (!previousSet) return { ...set };

          return {
            ...set,
            weight: previousSet.weight,
            reps: previousSet.reps,
          };
        }),
      };
    })
  );

  setCompleted(new Set());
  setElapsed(0);
  setDone(false);
  setPrs([]);
}, [workout, workouts]);

useEffect(() => {
  const t = setInterval(() => setElapsed((e) => e + 1), 1000);
  return () => clearInterval(t);
}, []);

useEffect(() => {
  if (!isResting) return;

  const t = setInterval(() => {
    setRestTimer((r) => {
      if (r <= 1) {
        setIsResting(false);
        return 0;
      }

      return r - 1;
    });
  }, 1000);

  return () => clearInterval(t);
}, [isResting]);

if (!workout) return null;

  const toggleSet = (exIdx: number, setIdx: number) => {
    const key = `${exIdx}-${setIdx}`;

    setCompleted((prev) => {
      const next = new Set(prev);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      
        const currentSet = exercises[exIdx].sets[setIdx];
        const exercise = exercises[exIdx];
      
        const newPRs = findSetPRs({
          workouts,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          weight: currentSet.weight,
          reps: currentSet.reps,
        });
      
        if (newPRs.length > 0) {
          setPrs((prev) => [...prev, ...newPRs]);
        }
      
        setRestTimer(90);
        setIsResting(true);
      }

      return next;
    });
  };

  const updateSet = (
    exIdx: number,
    setIdx: number,
    field: "weight" | "reps",
    value: number
  ) => {
    setExercises((current) =>
      current.map((exercise, exerciseIndex) => {
        if (exerciseIndex !== exIdx) return exercise;

        return {
          ...exercise,
          sets: exercise.sets.map((set, setIndex) => {
            if (setIndex !== setIdx) return set;

            return {
              ...set,
              [field]: value,
            };
          }),
        };
      })
    );
  };

  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = completed.size;

  const volumeKg = exercises.reduce((sum, exercise, exIdx) => {
    const exerciseVolume = exercise.sets.reduce((setSum, set, setIdx) => {
      const key = `${exIdx}-${setIdx}`;
      return completed.has(key) ? setSum + set.weight * set.reps : setSum;
    }, 0);

    return sum + exerciseVolume;
  }, 0);

  const handleFinishWorkout = async () => {
    if (!user || saving) return;

    try {
      setSaving(true);
      setError(null);

      const loggedExercises = exercises.map((exercise, exIdx) => ({
        ...exercise,
        sets: exercise.sets.map((set, setIdx) => {
          const key = `${exIdx}-${setIdx}`;
      
          return {
            ...set,
            completed: completed.has(key),
          };
        }),
      }));
      
      await saveWorkout({
        uid: user.uid,
        date: getTodayKey(),
        templateId: workout.id,
        name: workout.name,
        durationSeconds: elapsed,
        completedSets: doneSets,
        totalSets,
        volumeKg,
        exercises: loggedExercises,
      });

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save workout");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div
        className="flex flex-col items-center justify-center px-8 text-center"
        style={{ minHeight: "100%", paddingTop: 60 }}
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{
            background: C.accentDim,
            border: `2px solid ${C.accent}`,
            boxShadow: `0 0 40px rgba(124,255,107,0.2)`,
          }}
        >
          <CheckCircle2 size={48} color={C.accent} />
        </div>

        <h2 className="text-3xl font-extrabold mb-2" style={{ color: C.fg }}>
          Workout Complete
        </h2>

        <p className="text-base mb-1" style={{ color: C.fg2 }}>
          {workout.name}
        </p>

        <p className="text-sm mb-8" style={{ color: C.fg3 }}>
          {fmt(elapsed)} elapsed · {doneSets} sets completed
        </p>

        {prs.length > 0 && (
        <div
          className="w-full rounded-[20px] p-4 mb-6 text-left"
          style={{
            background: "rgba(124,255,107,0.07)",
            border: "1px solid rgba(124,255,107,0.2)",
          }}
        >
          <p className="text-sm font-bold mb-3" style={{ color: C.accent }}>
            🏆 {prs.length} New Personal Record{prs.length > 1 ? "s" : ""}
          </p>

          <div className="flex flex-col gap-2">
            {prs.map((pr, index) => (
              <div key={`${pr.exerciseId}-${pr.type}-${index}`}>
                <p className="text-sm font-semibold" style={{ color: C.fg }}>
                  {pr.exerciseName}
                </p>
                <p className="text-xs" style={{ color: C.fg3 }}>
                  {pr.type === "maxWeight" ? "Max Weight" : "Rep PR"} ·{" "}
                  {pr.weight} kg × {pr.reps}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

        <div className="grid grid-cols-3 gap-3 w-full mb-8">
          {[
            { label: "Volume", val: `${volumeKg.toLocaleString()} kg` },
            { label: "Sets", val: `${doneSets}` },
            { label: "Duration", val: fmt(elapsed) },
          ].map(({ label, val }) => (
            <div
              key={label}
              className="rounded-[16px] p-3 text-center"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <p className="text-lg font-bold" style={{ color: C.accent }}>
                {val}
              </p>
              <p className="text-[11px] mt-1" style={{ color: C.fg3 }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setDone(false);
            setCompleted(new Set());
            setElapsed(0);
          }}
          className="w-full py-4 rounded-[18px] font-semibold"
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            color: C.fg,
          }}
        >
          Start Again
        </button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="px-5 pt-4 pb-4">
        <div className="flex justify-between items-start mb-1">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-1"
              style={{ color: C.accent }}
            >
              Active Workout
            </p>
            <h2 className="text-2xl font-extrabold" style={{ color: C.fg }}>
              {workout.name}
            </h2>
          </div>

          <div className="text-right">
            <p className="text-xl font-bold font-mono" style={{ color: C.fg }}>
              {fmt(elapsed)}
            </p>
            <p className="text-[11px]" style={{ color: C.fg3 }}>
              elapsed
            </p>
          </div>
        </div>

        <div style={{ height: 4, background: C.border, borderRadius: 99, marginTop: 14 }}>
          <div
            style={{
              height: "100%",
              width: `${totalSets > 0 ? (doneSets / totalSets) * 100 : 0}%`,
              background: C.accent,
              borderRadius: 99,
              transition: "width 0.4s ease",
            }}
          />
        </div>

        <div className="flex justify-between mt-1.5">
          <span className="text-[11px]" style={{ color: C.fg3 }}>
            {doneSets}/{totalSets} sets
          </span>
          <span className="text-[11px]" style={{ color: C.fg3 }}>
            {totalSets - doneSets} remaining
          </span>
        </div>
      </div>

      {isResting && (
        <div
          className="mx-5 mb-4 rounded-[18px] p-4 flex items-center gap-4"
          style={{
            background: "rgba(124,255,107,0.07)",
            border: "1px solid rgba(124,255,107,0.2)",
          }}
        >
          <Timer size={20} color={C.accent} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: C.fg }}>
              Rest Timer
            </p>
            <p className="text-[11px]" style={{ color: C.fg3 }}>
              Next set in...
            </p>
          </div>

          <p className="text-2xl font-bold font-mono" style={{ color: C.accent }}>
            {fmt(restTimer)}
          </p>

          <button
            onClick={() => setIsResting(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: C.accentDim }}
          >
            <X size={14} color={C.accent} />
          </button>
        </div>
      )}

            <div className="px-5 flex flex-col gap-4">
        {exercises.map((ex, exIdx) => {
          const previous = getPreviousExercise(ex.id);
          const previousSets = previous?.sets.filter((set) => set.completed) ?? [];

          return (
            <div
              key={ex.id}
              className="rounded-[20px] p-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: C.fg }}>
                    {ex.name}
                  </p>

                  {previousSets.length > 0 && (
                    <p className="text-[11px] mt-1" style={{ color: C.fg3 }}>
                      Previous{" "}
                      {previousSets
                        .map((set) => `${set.weight}×${set.reps}`)
                        .join(" • ")}
                    </p>
                  )}
                </div>

                <span className="text-[11px]" style={{ color: C.fg3 }}>
                  {ex.sets.length} sets
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-[10px] uppercase tracking-wide w-8 text-center" style={{ color: C.fg3 }}>
                  Set
                </span>
                <span className="text-[10px] uppercase tracking-wide flex-1 text-center" style={{ color: C.fg3 }}>
                  Weight
                </span>
                <span className="text-[10px] uppercase tracking-wide flex-1 text-center" style={{ color: C.fg3 }}>
                  Reps
                </span>
                <div className="w-8" />
              </div>

              {ex.sets.map((set, setIdx) => {
                const key = `${exIdx}-${setIdx}`;
                const isDone = completed.has(key);

                return (
                  <WorkoutSetRow
                    key={setIdx}
                    index={setIdx}
                    reps={set.reps}
                    weight={set.weight}
                    completed={isDone}
                    onToggle={() => toggleSet(exIdx, setIdx)}
                    onWeightChange={(value) =>
                      updateSet(exIdx, setIdx, "weight", value)
                    }
                    onRepsChange={(value) =>
                      updateSet(exIdx, setIdx, "reps", value)
                    }
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="px-5 mt-4 text-sm" style={{ color: "#ff4d4d" }}>
          {error}
        </p>
      )}

      <div className="px-5 mt-6">
        <button
          onClick={handleFinishWorkout}
          disabled={saving}
          className="w-full py-4 rounded-[18px] font-bold text-base"
          style={{
            background: C.accent,
            color: C.bg,
            opacity: saving ? 0.6 : 1,
            boxShadow: `0 8px 32px rgba(124,255,107,0.25)`,
          }}
        >
          {saving ? "Saving Workout..." : "Finish Workout"}
        </button>
      </div>
    </div>
  );
}