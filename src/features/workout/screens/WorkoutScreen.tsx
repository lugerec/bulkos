import { exerciseDefinitions } from "@/data/exercises";
import { getProgressionSuggestion } from "@/features/workout/utils/progression";

import ExerciseDetailsSheet from "@/features/workout/components/ExerciseDetailsSheet";
import SwapExerciseSheet from "@/features/workout/components/SwapExerciseSheet";
import AddExerciseSheet from "@/features/workout/components/AddExerciseSheet";
import ExerciseThumb from "@/features/workout/components/ExerciseThumb";

import { useEffect, useState } from "react";
import { CheckCircle2, Dumbbell, Timer, X, Repeat, StickyNote } from "lucide-react";

import { C } from "@/shared/ui";
import { useAuthStore } from "@/store/authStore";
import { useBodyMetricsStore } from "@/store/bodyMetricsStore";
import { useWorkoutTemplateStore } from "@/store/workoutTemplateStore";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";
import { useAppStore } from "@/store/appStore";
import { saveWorkout } from "@/services/workoutService";
import { getEffectiveSetWeight } from "@/features/workout/utils/setVolume";
import { getRestSeconds } from "@/features/workout/utils/restTime";
import { notifyRestComplete, adjustRest } from "@/features/workout/utils/restNotify";
import {
  getSessionEffort,
  describeSessionEffort,
} from "@/features/workout/utils/sessionEffort";
import WorkoutSetRow from "@/features/workout/components/WorkoutSetRow";
import WarmupHint from "@/features/workout/components/WarmupHint";
import type { WorkoutExercise, SetEffort } from "@/types/workout";
import { findSetPRs, type PersonalRecord } from "@/features/workout/utils/pr";
import { toDateKey } from "@/lib/date";

const fmt = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
    .toString()
    .padStart(2, "0")}`;

    function signedDuration(seconds: number) {
      if (seconds === 0) return "00:00";
      return `${seconds > 0 ? "+" : "-"}${fmt(Math.abs(seconds))}`;
    }

    function getTodayKey() {
  return toDateKey(new Date());
}

type WorkoutComparison = {
  volumeDiff: number;
  setsDiff: number;
  durationDiff: number;
};

export default function WorkoutScreen() {
  const user = useAuthStore((s) => s.user);
  const workout = useWorkoutTemplateStore((s) => s.selected);
  const templates = useWorkoutTemplateStore((s) => s.templates);
  const selectTemplate = useWorkoutTemplateStore((s) => s.selectTemplate);

  const workouts = useWorkoutHistoryStore((s) => s.workouts);
  const loadWorkouts = useWorkoutHistoryStore((s) => s.loadWorkouts);

  const bodyEntries = useBodyMetricsStore((s) => s.entries);
  const loadBodyMetrics = useBodyMetricsStore((s) => s.load);

  const latestBodyweightKg = [...bodyEntries].sort((a, b) =>
    a.date.localeCompare(b.date)
  )[bodyEntries.length - 1]?.weightKg;

  const [prs, setPrs] = useState<Record<string, PersonalRecord>>({});
  const [comparison, setComparison] = useState<WorkoutComparison | null>(null);
  const prList = Object.values(prs);

  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workoutStarted = useAppStore((s) => s.sessionActive);
  const startSession = useAppStore((s) => s.startSession);

  // Guarantee a clean slate whenever this screen mounts: never resume a
  // session automatically. `sessionActive` is already cleared by navigation,
  // this just resets the local timers/flags.
  useEffect(() => {
    setElapsed(0);
    setDone(false);
    setIsResting(false);
    setRestTimer(0);
    // Intentionally run only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [swapExerciseIdx, setSwapExerciseIdx] = useState<number | null>(null);
  const [addingExercise, setAddingExercise] = useState(false);
  const [notesOpen, setNotesOpen] = useState<Set<number>>(new Set());

  const exerciseHasPR = (exerciseId: string) => Boolean(prs[exerciseId]);

  function getPreviousExercise(exerciseId: string) {
    for (const loggedWorkout of workouts) {
      const exercise = loggedWorkout.exercises?.find(
        (e) => e.id === exerciseId
      );

      if (exercise) return exercise;
    }

    return undefined;
  }

  function getPreviousSameWorkout(templateId: string) {
    return workouts.find((w) => w.templateId === templateId);
  }

  useEffect(() => {
    if (!user) return;
    loadWorkouts(user.uid);
    loadBodyMetrics(user.uid);
  }, [user, loadWorkouts, loadBodyMetrics]);

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
    setPrs({});
    setComparison(null);
  }, [workout]);

  useEffect(() => {
    if (!workoutStarted || done) return;
  
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
  
    return () => clearInterval(t);
  }, [workoutStarted, done]);

  useEffect(() => {
    if (!isResting) return;

    const t = setInterval(() => {
      setRestTimer((r) => {
        if (r <= 1) {
          setIsResting(false);
          notifyRestComplete();
          return 0;
        }

        return r - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [isResting]);

  if (!workoutStarted || !workout) {
    return (
      <div className="px-5 pt-4 pb-8">
        <div className="mb-6">
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: C.accent }}
          >
            Train
          </p>
  
          <h2 className="text-2xl font-extrabold" style={{ color: C.fg }}>
            Select Workout
          </h2>
  
          <p className="text-sm mt-1" style={{ color: C.fg3 }}>
            Choose a template to start your session.
          </p>
        </div>
  
        {templates.length === 0 ? (
          <div
            className="rounded-[20px] p-5 text-center"
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
            }}
          >
            <Dumbbell size={24} color={C.fg3} className="mx-auto mb-3" />
  
            <p className="text-sm font-semibold" style={{ color: C.fg }}>
              No workout templates yet.
            </p>
  
            <p className="text-xs mt-2" style={{ color: C.fg3 }}>
              Create one in Settings → Workout Templates.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  selectTemplate(template.id);
                  startSession();
                }}
                className="rounded-[20px] p-4 text-left flex items-center justify-between gap-3"
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div>
                  <p className="text-base font-bold" style={{ color: C.fg }}>
                    {template.name}
                  </p>
  
                  <p className="text-xs mt-1" style={{ color: C.fg3 }}>
                    {template.exercises.length} exercises ·{" "}
                    {template.exercises.reduce(
                      (sum, exercise) => sum + exercise.sets.length,
                      0
                    )}{" "}
                    sets
                  </p>
                </div>
  
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: C.accent,
                    color: C.bg,
                  }}
                >
                  <Dumbbell size={17} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const toggleSet = (exIdx: number, setIdx: number) => {
    const key = `${exIdx}-${setIdx}`;

    setCompleted((prev) => {
      const next = new Set(prev);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);

        const current = exercises[exIdx].sets[setIdx];

        if (setIdx + 1 < exercises[exIdx].sets.length) {
          setExercises((prev) =>
            prev.map((exercise, exerciseIndex) => {
              if (exerciseIndex !== exIdx) return exercise;

              return {
                ...exercise,
                sets: exercise.sets.map((set, index) => {
                  if (index !== setIdx + 1) return set;

                  return {
                    ...set,
                    weight: current.weight,
                    reps: current.reps,
                  };
                }),
              };
            })
          );
        }

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
          const bestPr = newPRs[0];

          setPrs((prevPrs) => ({
            ...prevPrs,
            [exercise.id]: bestPr,
          }));
        }

        const restDefinition = exerciseDefinitions.find(
          (item) => item.id === (exercise.exerciseId ?? exercise.id)
        );

        setRestTimer(
          getRestSeconds(
            {
              equipment: restDefinition?.equipment,
              category: restDefinition?.category,
              name: exercise.name,
            },
            exercise.restSeconds ?? restDefinition?.defaultRestSeconds
          )
        );
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

  const updateEffort = (
    exIdx: number,
    setIdx: number,
    effort: SetEffort
  ) => {
    setExercises((current) =>
      current.map((exercise, exerciseIndex) => {
        if (exerciseIndex !== exIdx) return exercise;

        return {
          ...exercise,
          sets: exercise.sets.map((set, setIndex) => {
            if (setIndex !== setIdx) return set;

            // Tapping the active rating again clears it.
            return {
              ...set,
              effort: set.effort === effort ? undefined : effort,
            };
          }),
        };
      })
    );
  };

  const addSet = (exIdx: number) => {
    setExercises((current) =>
      current.map((exercise, exerciseIndex) => {
        if (exerciseIndex !== exIdx) return exercise;

        const lastSet = exercise.sets[exercise.sets.length - 1];
        const newSet = lastSet
          ? { ...lastSet }
          : { weight: 0, reps: 0, completed: false };

        return { ...exercise, sets: [...exercise.sets, newSet] };
      })
    );
  };

  const removeSet = (exIdx: number) => {
    setExercises((current) =>
      current.map((exercise, exerciseIndex) => {
        if (exerciseIndex !== exIdx) return exercise;
        if (exercise.sets.length <= 1) return exercise;

        return {
          ...exercise,
          sets: exercise.sets.slice(0, -1),
        };
      })
    );

    // Drop the completed flag for the removed (last) set to avoid stale keys.
    setCompleted((prev) => {
      const next = new Set(prev);
      const lastIndex = exercises[exIdx].sets.length - 1;

      next.delete(`${exIdx}-${lastIndex}`);

      return next;
    });
  };

  const swapExercise = (exIdx: number, newDefinitionId: string) => {
    const definition = exerciseDefinitions.find(
      (d) => d.id === newDefinitionId
    );
    if (!definition) return;

    setExercises((current) =>
      current.map((exercise, exerciseIndex) => {
        if (exerciseIndex !== exIdx) return exercise;

        // Keep the same number of sets, but reset weights/reps to the new
        // exercise's defaults — the old numbers don't transfer to a different lift.
        const setCount = exercise.sets.length;

        return {
          ...exercise,
          id: definition.id,
          exerciseId: definition.id,
          name: definition.name,
          sets: Array.from({ length: setCount }, () => ({
            weight: 0,
            reps: definition.defaultReps ?? 0,
            completed: false,
          })),
        };
      })
    );

    // Clear any completed flags for this exercise's sets.
    setCompleted((prev) => {
      const next = new Set<string>();
      prev.forEach((key) => {
        if (!key.startsWith(`${exIdx}-`)) next.add(key);
      });
      return next;
    });

    setSwapExerciseIdx(null);
  };

  const addExerciseToSession = (definitionId: string) => {
    const definition = exerciseDefinitions.find((d) => d.id === definitionId);
    if (!definition) return;

    setExercises((current) => [
      ...current,
      {
        id: definition.id,
        exerciseId: definition.id,
        name: definition.name,
        sets: Array.from({ length: definition.defaultSets ?? 3 }, () => ({
          weight: 0,
          reps: definition.defaultReps ?? 0,
          completed: false,
        })),
      },
    ]);

    setAddingExercise(false);
  };

  const updateNote = (exIdx: number, value: string) => {
    setExercises((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === exIdx ? { ...exercise, notes: value } : exercise
      )
    );
  };

  const toggleNote = (exIdx: number) => {
    setNotesOpen((prev) => {
      const next = new Set(prev);
      if (next.has(exIdx)) next.delete(exIdx);
      else next.add(exIdx);
      return next;
    });
  };

  function applySuggested(
    exIdx: number,
    weight: number,
    reps: number
  ) {
    setExercises((current) =>
      current.map((exercise, exerciseIndex) => {
        if (exerciseIndex !== exIdx) return exercise;
  
        const firstIncomplete = exercise.sets.findIndex(
          (_, setIndex) => !completed.has(`${exerciseIndex}-${setIndex}`)
        );
  
        if (firstIncomplete === -1) return exercise;
  
        return {
          ...exercise,
          sets: exercise.sets.map((set, setIndex) =>
            setIndex === firstIncomplete
              ? {
                  ...set,
                  weight,
                  reps,
                }
              : set
          ),
        };
      })
    );
  }

  function applySuggestedAll(
    exIdx: number,
    weight: number,
    reps: number
  ) {
    setExercises((current) =>
      current.map((exercise, exerciseIndex) => {
        if (exerciseIndex !== exIdx) return exercise;
  
        return {
          ...exercise,
          sets: exercise.sets.map((set, setIndex) =>
            completed.has(`${exerciseIndex}-${setIndex}`)
              ? set
              : {
                  ...set,
                  weight,
                  reps,
                }
          ),
        };
      })
    );
  }

  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = completed.size;
  const completionPercent =
  totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  const workoutRating =
  completionPercent === 100
    ? { emoji: "🔥", text: "Perfect Workout" }
    : completionPercent >= 90
    ? { emoji: "💪", text: "Great Session" }
    : completionPercent >= 75
    ? { emoji: "👍", text: "Solid Work" }
    : { emoji: "👊", text: "Keep Going" };

    const setEffectiveWeight = (
      exercise: WorkoutExercise,
      setWeight: number
    ) => {
      const definition = exerciseDefinitions.find(
        (item) => item.id === (exercise.exerciseId ?? exercise.id)
      );

      return getEffectiveSetWeight(
        definition?.equipment,
        setWeight,
        latestBodyweightKg
      );
    };

    const volumeKg = exercises.reduce((sum, exercise, exIdx) => {
      const exerciseVolume = exercise.sets.reduce((setSum, set, setIdx) => {
        const key = `${exIdx}-${setIdx}`;
        return completed.has(key)
          ? setSum + setEffectiveWeight(exercise, set.weight) * set.reps
          : setSum;
      }, 0);
    
      return sum + exerciseVolume;
    }, 0);
    
    const strongestSet = exercises
      .flatMap((exercise, exIdx) =>
        exercise.sets
          .filter((_, setIdx) => completed.has(`${exIdx}-${setIdx}`))
          .map((set) => ({
            exercise: exercise.name,
            weight: set.weight,
            reps: set.reps,
            score: set.weight * (1 + set.reps / 30),
          }))
      )
      .sort((a, b) => b.score - a.score)[0];

      function getExerciseVolume(exIdx: number) {
        return exercises[exIdx].sets.reduce((sum, set, setIdx) => {
          const key = `${exIdx}-${setIdx}`;
      
          if (!completed.has(key)) return sum;
      
          return (
            sum + setEffectiveWeight(exercises[exIdx], set.weight) * set.reps
          );
        }, 0);
      }

      const estimatedOneRepMax = strongestSet
      ? Math.round(strongestSet.weight * (1 + strongestSet.reps / 30))
      : 0;

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

      const previousWorkout = getPreviousSameWorkout(workout.id);

    setComparison(
      previousWorkout
        ? {
            volumeDiff: volumeKg - previousWorkout.volumeKg,
            setsDiff: doneSets - previousWorkout.completedSets,
            durationDiff: elapsed - previousWorkout.durationSeconds,
          }
        : null
    );

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

      await loadWorkouts(user.uid);

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save workout");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    const sessionEffort = getSessionEffort(exercises);

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
            boxShadow: `0 0 40px rgba(163,230,53,0.2)`,
          }}
        >
          <CheckCircle2 size={48} color={C.accent} />
        </div>
  
        <h2 className="text-3xl font-extrabold mb-2" style={{ color: C.fg }}>
          Workout Complete
        </h2>

        <div className="mb-4">
        <p
          className="text-xl font-bold"
          style={{ color: C.accent }}
        >
          {workoutRating.emoji} {workoutRating.text}
        </p>
        </div>
  
        <p className="text-base mb-1" style={{ color: C.fg2 }}>
          {workout.name}
        </p>
  
        <p className="text-sm mb-8" style={{ color: C.fg3 }}>
          {fmt(elapsed)} elapsed · {doneSets} sets completed
        </p>
  
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          {[
            { label: "Volume", val: `${volumeKg.toLocaleString()} kg` },
            { label: "Sets", val: `${doneSets}/${totalSets}` },
            { label: "Duration", val: fmt(elapsed) },
            { label: "Complete", val: `${completionPercent}%` },
          ].map(({ label, val }) => (
            <div
              key={label}
              className="rounded-[14px] p-3 text-center"
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
  
        {sessionEffort.overall && (
          <div
            className="w-full rounded-[20px] p-4 mb-5 flex items-center gap-3"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <span className="text-2xl">
              {describeSessionEffort(sessionEffort.overall).emoji}
            </span>
            <div className="text-left flex-1">
              <p className="text-sm font-bold" style={{ color: C.fg }}>
                {describeSessionEffort(sessionEffort.overall).label}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: C.fg3 }}>
                {sessionEffort.counts.easy > 0 &&
                  `${sessionEffort.counts.easy} easy · `}
                {sessionEffort.counts.moderate > 0 &&
                  `${sessionEffort.counts.moderate} ok · `}
                {sessionEffort.counts.hard > 0 &&
                  `${sessionEffort.counts.hard} hard`}
                {" "}
                across {sessionEffort.rated} rated set
                {sessionEffort.rated > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {prList.length > 0 && (
          <div
            className="w-full rounded-[20px] p-4 mb-5 text-left"
            style={{
              background: "rgba(163,230,53,0.07)",
              border: "1px solid rgba(163,230,53,0.2)",
            }}
          >
            <p className="text-sm font-bold mb-3" style={{ color: C.accent }}>
              🏆 {prList.length} New Personal Record
              {prList.length > 1 ? "s" : ""}
            </p>
  
            <div className="flex flex-col gap-2">
              {prList.map((pr, index) => (
                <div key={`${pr.exerciseId}-${index}`}>
                  <p className="text-sm font-semibold" style={{ color: C.fg }}>
                    {pr.exerciseName}
                  </p>
                  <p className="text-xs" style={{ color: C.fg3 }}>
                    {pr.weight} kg × {pr.reps}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {strongestSet && (
          <div
            className="w-full rounded-[20px] p-4 mb-5 text-left"
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
            }}
          >
            <p
              className="text-sm font-bold mb-2"
              style={{ color: C.accent }}
            >
              💪 Strongest Lift Today
            </p>

            <p
              className="text-base font-semibold"
              style={{ color: C.fg }}
            >
              {strongestSet.exercise}
            </p>

            <p
              className="text-sm"
              style={{ color: C.fg3 }}
            >
              {strongestSet.weight} kg × {strongestSet.reps}
            </p>
          </div>
        )}
  
        {comparison && (
          <div
            className="w-full rounded-[20px] p-4 mb-5 text-left"
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
            }}
          >
            <p className="text-sm font-bold mb-3" style={{ color: C.fg }}>
              Compared to last time
            </p>
  
            <div className="grid grid-cols-3 gap-2">
              <DiffStat
                label="Volume"
                value={`${comparison.volumeDiff > 0 ? "+" : ""}${comparison.volumeDiff.toLocaleString()} kg`}
                positive={comparison.volumeDiff >= 0}
              />
  
              <DiffStat
                label="Sets"
                value={`${comparison.setsDiff > 0 ? "+" : ""}${comparison.setsDiff}`}
                positive={comparison.setsDiff >= 0}
              />
  
              <DiffStat
                label="Duration"
                value={signedDuration(comparison.durationDiff)}
                positive={comparison.durationDiff <= 0}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => {
            setDone(false);
            setCompleted(new Set());
            setElapsed(0);
            setPrs({});
          }}
          className="w-full py-4 rounded-[20px] font-semibold"
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

        <div
          style={{
            height: 4,
            background: C.border,
            borderRadius: 99,
            marginTop: 14,
          }}
        >
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
        <div className="grid grid-cols-3 gap-2 mt-4">
        <LiveStat label="Volume" value={`${volumeKg.toLocaleString()} kg`} />

        <LiveStat
          label="Best set"
          value={
            strongestSet
              ? `${strongestSet.weight}×${strongestSet.reps}`
              : "—"
          }
        />

        <LiveStat
          label="Est. 1RM"
          value={estimatedOneRepMax > 0 ? `${estimatedOneRepMax} kg` : "—"}
        />
      </div>
      </div>
      

      {isResting && (
        <div
          className="mx-5 mb-4 rounded-[20px] p-4"
          style={{
            background: "rgba(163,230,53,0.07)",
            border: "1px solid rgba(163,230,53,0.2)",
          }}
        >
          <div className="flex items-center gap-4">
            <Timer size={20} color={C.accent} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: C.fg }}>
                Rest Timer
              </p>
              <p className="text-[11px]" style={{ color: C.fg3 }}>
                Next set in…
              </p>
            </div>

            <div className="text-right">
              <p
                className="text-2xl font-bold font-mono leading-none"
                style={{ color: C.accent }}
              >
                {fmt(restTimer)}
              </p>
              <p className="text-[10px] mt-1" style={{ color: C.fg3 }}>
                Recommended rest
              </p>
            </div>

            <button
              onClick={() => setIsResting(false)}
              aria-label="Skip rest"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: C.accentDim }}
            >
              <X size={14} color={C.accent} />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setRestTimer((r) => adjustRest(r, -15))}
              className="flex-1 py-2 rounded-[14px] text-xs font-semibold"
              style={{
                background: C.card2,
                border: `1px solid ${C.border}`,
                color: C.fg2,
              }}
            >
              −15s
            </button>
            <button
              onClick={() => setRestTimer((r) => adjustRest(r, 15))}
              className="flex-1 py-2 rounded-[14px] text-xs font-semibold"
              style={{
                background: C.card2,
                border: `1px solid ${C.border}`,
                color: C.fg2,
              }}
            >
              +15s
            </button>
          </div>
        </div>
      )}

      <div className="px-5 flex flex-col gap-4">
        {exercises.map((ex, exIdx) => {
          const exerciseVolume = getExerciseVolume(exIdx);
          const previous = getPreviousExercise(ex.id);
          const previousSets = previous?.sets.filter((set) => set.completed) ?? [];
          const exerciseDefinition = exerciseDefinitions.find(
            (definition) => definition.id === (ex.exerciseId ?? ex.id)
          );
          
          const suggested = exerciseDefinition
            ? getProgressionSuggestion(exerciseDefinition, previous?.sets ?? [])
            : null;

          return (
            <div
              key={ex.id}
              className="rounded-[20px] p-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <ExerciseThumb
                    exercise={{
                      id: ex.exerciseId ?? ex.id,
                      media: exerciseDefinition?.media,
                    }}
                  />
                  <div>
                  <div className="flex items-center gap-2">
                  <button
                  type="button"
                  onClick={() => {
                    if (ex.exerciseId) {setSelectedExerciseId(ex.exerciseId);
                    }
                  }}
                  className="text-left hover:underline">
                  <p className="text-sm font-bold"
                    style={{ color: C.fg }}>
                    {ex.name}
                  </p>
                </button>

                    {exerciseHasPR(ex.id) && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: "rgba(163,230,53,0.15)",
                          color: C.accent,
                          border: "1px solid rgba(163,230,53,0.25)",
                        }}
                      >
                        🏆 NEW PR
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setSwapExerciseIdx(exIdx)}
                      aria-label="Swap exercise"
                      className="flex items-center justify-center w-6 h-6 rounded-full"
                      style={{ background: C.card2, color: C.fg3 }}
                    >
                      <Repeat size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleNote(exIdx)}
                      aria-label="Exercise note"
                      className="flex items-center justify-center w-6 h-6 rounded-full"
                      style={{
                        background: ex.notes ? C.accentDim : C.card2,
                        color: ex.notes ? C.accent : C.fg3,
                      }}
                    >
                      <StickyNote size={12} />
                    </button>
                  </div>

                  {(() => {
                    const range = exerciseDefinition?.progression;
                    const minReps =
                      range?.minReps ?? exerciseDefinition?.defaultReps;
                    const maxReps = range?.maxReps;

                    if (minReps == null) return null;

                    const label =
                      maxReps != null && maxReps !== minReps
                        ? `${minReps}–${maxReps}`
                        : `${minReps}`;

                    return (
                      <p
                        className="text-[11px] mt-1 font-medium"
                        style={{ color: C.accent }}
                      >
                        Target {label} reps
                      </p>
                    );
                  })()}

                  {previousSets.length > 0 && (
                    <p className="text-[11px] mt-1" style={{ color: C.fg3 }}>
                      Previous{" "}
                      {previousSets
                        .map((set) => `${set.weight}×${set.reps}`)
                        .join(" • ")}
                    </p>
                  )}

                  {suggested && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() =>
                          applySuggested(
                            exIdx,
                            suggested.weight,
                            suggested.reps
                          )
                        }
                        className="px-2 py-1 rounded-lg text-[11px] font-semibold"
                        style={{
                          background: "rgba(163,230,53,0.12)",
                          color: C.accent,
                          border: "1px solid rgba(163,230,53,0.25)",
                        }}
                      >
                        ⭐ Apply
                      </button>

                      <button
                        onClick={() =>
                          applySuggestedAll(
                            exIdx,
                            suggested.weight,
                            suggested.reps
                          )
                        }
                        className="px-2 py-1 rounded-lg text-[11px] font-semibold"
                        style={{
                          background: C.card2,
                          color: C.fg,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        Apply All
                      </button>

                      <span
                        className="flex items-center text-[11px] font-semibold"
                        style={{ color: C.accent }}
                      >
                        {suggested.weight} × {suggested.reps}
                        <span
                          className="ml-1"
                          style={{ color: C.fg3 }}
                        >
                          · {suggested.reason === "increase_weight"
                            ? "add weight"
                            : suggested.reason === "increase_reps"
                            ? "add reps"
                            : suggested.reason === "maintain"
                            ? "repeat, hit reps"
                            : suggested.reason === "deload"
                            ? "back off"
                            : suggested.reason}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
                </div>

                <span className="text-[11px]" style={{ color: C.fg3 }}>
                  {ex.sets.length} sets
                </span>
                <p className="text-[11px] mt-1 text-right" style={{ color: C.accent }}>
                  {exerciseVolume.toLocaleString()} kg
                </p>
              </div>

              {notesOpen.has(exIdx) && (
                <textarea
                  value={ex.notes ?? ""}
                  onChange={(e) => updateNote(exIdx, e.target.value)}
                  placeholder="Note for this exercise (e.g. grip, form cue, how it felt)…"
                  rows={2}
                  className="w-full rounded-[14px] px-3 py-2 mb-3 text-sm outline-none resize-none"
                  style={{
                    background: C.card2,
                    border: `1px solid ${C.border}`,
                    color: C.fg,
                  }}
                />
              )}

              {!notesOpen.has(exIdx) && ex.notes && (
                <p
                  className="text-[11px] mb-3 px-1 italic"
                  style={{ color: C.fg2 }}
                >
                  “{ex.notes}”
                </p>
              )}

              <WarmupHint
                workingWeight={Math.max(
                  0,
                  ...ex.sets.map((set) => set.weight),
                  suggested?.weight ?? 0
                )}
                equipment={exerciseDefinition?.equipment}
              />

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
                    effort={set.effort}
                    onToggle={() => toggleSet(exIdx, setIdx)}
                    onWeightChange={(value) =>
                      updateSet(exIdx, setIdx, "weight", value)
                    }
                    onRepsChange={(value) =>
                      updateSet(exIdx, setIdx, "reps", value)
                    }
                    onEffortChange={(value) =>
                      updateEffort(exIdx, setIdx, value)
                    }
                  />
                );
              })}

              <div className="flex items-center gap-2 mt-2 px-1">
                <button
                  onClick={() => addSet(exIdx)}
                  className="flex-1 py-2 rounded-[14px] text-xs font-semibold"
                  style={{
                    background: C.card2,
                    border: `1px solid ${C.border}`,
                    color: C.fg2,
                  }}
                >
                  + Add set
                </button>

                {ex.sets.length > 1 && (
                  <button
                    onClick={() => removeSet(exIdx)}
                    className="py-2 px-3 rounded-[14px] text-xs font-semibold"
                    style={{
                      background: "transparent",
                      border: `1px solid ${C.border}`,
                      color: C.fg3,
                    }}
                  >
                    − Remove
                  </button>
                )}
              </div>
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
          onClick={() => setAddingExercise(true)}
          className="w-full py-3 rounded-[20px] font-semibold text-sm mb-3"
          style={{
            background: "transparent",
            border: `1px dashed ${C.border}`,
            color: C.fg2,
          }}
        >
          + Add exercise
        </button>

        <button
          onClick={handleFinishWorkout}
          disabled={saving}
          className="w-full py-4 rounded-[20px] font-bold text-base"
          style={{
            background: C.accent,
            color: C.bg,
            opacity: saving ? 0.6 : 1,
            boxShadow: `0 8px 32px rgba(163,230,53,0.25)`,
          }}
        >
          {saving ? "Saving Workout..." : "Finish Workout"}
        </button>
      </div>

      <ExerciseDetailsSheet
        exerciseId={selectedExerciseId}
        onClose={() => setSelectedExerciseId(null)}
      />

      <AddExerciseSheet
        open={addingExercise}
        existingIds={exercises.map((e) => e.exerciseId ?? e.id)}
        onClose={() => setAddingExercise(false)}
        onSelect={addExerciseToSession}
      />

      <SwapExerciseSheet
        current={
          swapExerciseIdx !== null
            ? exerciseDefinitions.find(
                (d) =>
                  d.id ===
                  (exercises[swapExerciseIdx]?.exerciseId ??
                    exercises[swapExerciseIdx]?.id)
              ) ?? null
            : null
        }
        onClose={() => setSwapExerciseIdx(null)}
        onSelect={(definitionId) => {
          if (swapExerciseIdx !== null) {
            swapExercise(swapExerciseIdx, definitionId);
          }
        }}
      />
    </div>
  );
}

function DiffStat({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <div
      className="rounded-[14px] px-3 py-3"
      style={{ background: C.card2, border: `1px solid ${C.border}` }}
    >
      <p className="text-[10px] mb-1" style={{ color: C.fg3 }}>
        {label}
      </p>
      <p
        className="text-xs font-bold"
        style={{ color: positive ? C.accent : "#ff4d4d" }}
      >
        {value}
      </p>
    </div>
  );
}

function LiveStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[14px] px-3 py-2"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
      }}
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