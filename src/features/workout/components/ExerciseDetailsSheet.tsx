import MuscleActivationList from "@/features/workout/components/MuscleActivationList";
import ExerciseMedia from "@/features/workout/components/ExerciseMedia";

import {
  getExerciseMedia,
} from "@/features/workout/utils/exerciseMedia";

import ExerciseProgressChart from "@/features/workout/components/ExerciseProgressChart";
import { Dumbbell, Timer, Trophy, X } from "lucide-react";

import { exerciseDefinitions } from "@/data/exercises";
import { C } from "@/shared/ui";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";

type Props = {
  exerciseId: string | null;
  onClose: () => void;
};

function InfoBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        background: C.card2,
        border: `1px solid ${C.border}`,
        color: C.fg,
      }}
    >
      {children}
    </span>
  );
}

export default function ExerciseDetailsSheet({ exerciseId, onClose }: Props) {
  const workouts = useWorkoutHistoryStore((s) => s.workouts);

  if (!exerciseId) return null;

  const exercise = exerciseDefinitions.find((e) => e.id === exerciseId);
  if (!exercise) return null;

  const getStoredExerciseId = (item: { id: string; exerciseId?: string }) =>
    item.exerciseId ?? item.id;

  const loggedSets = workouts
    .flatMap((workout) =>
      (workout.exercises ?? [])
        .filter((item) => getStoredExerciseId(item) === exercise.id)
        .flatMap((item) =>
          item.sets
            .filter((set) => set.completed)
            .map((set) => ({
              weight: set.weight,
              reps: set.reps,
              date: workout.date,
              volume: set.weight * set.reps,
              estimatedOneRepMax: Math.round(set.weight * (1 + set.reps / 30)),
            }))
        )
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const bestSet = [...loggedSets].sort(
    (a, b) => b.estimatedOneRepMax - a.estimatedOneRepMax
  )[0];

  function capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  
  function difficultyStars(level?: string) {
    switch (level) {
      case "beginner":
        return "★☆☆☆☆";
      case "intermediate":
        return "★★★☆☆";
      case "advanced":
        return "★★★★★";
      default:
        return null;
    }
  }

  function getNextSuggestion() {
    if (!bestSet) return null;
  
    if (bestSet.reps >= 10) {
      return {
        weight: bestSet.weight + 2.5,
        reps: bestSet.reps,
        reason: "Increase weight",
      };
    }
  
    return {
      weight: bestSet.weight,
      reps: bestSet.reps + 1,
      reason: "Increase reps first",
    };
  }

  const suggestion = getNextSuggestion();

  const totalVolume = loggedSets.reduce((sum, set) => sum + set.volume, 0);
  const lastSet = loggedSets[0];

  const chartData = [...loggedSets]
  .reverse()
  .map((set) => ({
    date: set.date.slice(5),
    value: set.estimatedOneRepMax,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,.55)" }}
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full rounded-t-[30px] px-5 pt-4 pb-7 overflow-y-auto"
        style={{
          background: C.bg,
          borderTop: `1px solid ${C.border}`,
          maxHeight: "82vh",
        }}
      >
        <div className="flex justify-center mb-4">
          <div
            style={{
              width: 42,
              height: 4,
              borderRadius: 999,
              background: C.border,
            }}
          />
        </div>

        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p
              className="text-[11px] uppercase tracking-widest font-bold mb-1"
              style={{ color: C.accent }}
            >
              Exercise Detail
            </p>

            <h2 className="text-[22px] font-extrabold" style={{ color: C.fg }}>
              {exercise.name}
            </h2>

            <div className="flex flex-wrap gap-2 mt-3 mb-5">
            {exercise.difficulty && (
              <InfoBadge>
                {difficultyStars(exercise.difficulty)}{" "}
                {capitalize(exercise.difficulty)}
              </InfoBadge>
            )}

            <InfoBadge>
              {capitalize(exercise.category)}
            </InfoBadge>

            <InfoBadge>
              {capitalize(exercise.equipment)}
            </InfoBadge>

            <InfoBadge>
              {capitalize(exercise.primaryMuscle)}
            </InfoBadge>
          </div>

          <div className="mt-5">
            <ExerciseMedia
              media={getExerciseMedia(exercise.id, exercise.media)}
              name={exercise.name}
              primaryMuscle={exercise.primaryMuscle}
            />
          </div>

            <div className="flex flex-wrap gap-2 mt-5">
            <InfoChip label="Primary" value={exercise.primaryMuscle} />
            <InfoChip label="Equipment" value={exercise.equipment} />
            <InfoChip label="Category" value={exercise.category} />

            {exercise.difficulty && (
                <InfoChip
                label="Difficulty"
                value={exercise.difficulty}
                />
            )}
            </div>

            {exercise.secondaryMuscles?.length ? (
            <div className="mt-6">
                <p
                className="text-xs font-bold uppercase mb-2"
                style={{ color: C.fg3 }}
                >
                Secondary muscles
                </p>

                <div className="flex flex-wrap gap-2">
                {exercise.secondaryMuscles.map((muscle) => (
                    <div
                    key={muscle}
                    className="px-3 py-2 rounded-full"
                    style={{
                        background: C.card2,
                        border: `1px solid ${C.border}`,
                        color: C.fg,
                    }}
                    >
                    {muscle}
                    </div>
                ))}
                </div>
            </div>
            ) : null}
          </div>

          <Section title="Muscle Activation">
          {exercise.activation ? (
            <MuscleActivationList activation={exercise.activation} />
          ) : (
            <p className="text-sm" style={{ color: C.fg3 }}>
              No activation data yet.
            </p>
          )}
        </Section>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <X size={16} color={C.fg2} />
          </button>
        </div>

        <div
          className="rounded-[20px] p-5 mb-4 flex items-center justify-center card-lit"
          style={{
            background:
              "linear-gradient(135deg, rgba(74,222,128,0.10), rgba(96,165,250,0.08))",
            border: "1px solid rgba(74,222,128,0.18)",
            height: 150,
          }}
        >
          <Dumbbell size={42} color={C.accent} />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <MiniStat label="Sets" value={`${exercise.defaultSets}`} />
          <MiniStat label="Reps" value={`${exercise.defaultReps}`} />
          <MiniStat label="Rest" value={`${exercise.defaultRestSeconds}s`} />
        </div>

        <Section title="Tips">
          {exercise.tips?.length ? (
            exercise.tips.map((tip) => (
              <p key={tip} className="text-sm mb-2" style={{ color: C.fg2 }}>
                ✓ {tip}
              </p>
            ))
          ) : (
            <p className="text-sm" style={{ color: C.fg3 }}>
              No tips added yet.
            </p>
          )}
        </Section>

        <Section title="Common Mistakes">
          {exercise.mistakes?.length ? (
            exercise.mistakes.map((mistake) => (
              <p key={mistake} className="text-sm mb-2" style={{ color: C.fg2 }}>
                ✕ {mistake}
              </p>
            ))
          ) : (
            <p className="text-sm" style={{ color: C.fg3 }}>
              No mistakes added yet.
            </p>
          )}
        </Section>

        <Section title="Your Stats">
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              icon={<Trophy size={15} color={C.accent} />}
              label="Best Set"
              value={bestSet ? `${bestSet.weight} × ${bestSet.reps}` : "—"}
            />
            <StatCard
              icon={<Timer size={15} color={C.blue} />}
              label="Est. 1RM"
              value={bestSet ? `${bestSet.estimatedOneRepMax} kg` : "—"}
            />
            <StatCard
              label="Last Set"
              value={lastSet ? `${lastSet.weight} × ${lastSet.reps}` : "—"}
            />
            <StatCard
              label="Total Volume"
              value={`${totalVolume.toLocaleString()} kg`}
            />
          </div>
        </Section>

        <Section title="Next Suggested Target">
        {suggestion ? (
            <>
            <div className="flex justify-between mb-3">
                <span style={{ color: C.fg3 }}>Last best</span>

                <strong style={{ color: C.fg }}>
                {bestSet?.weight} × {bestSet?.reps}
                </strong>
            </div>

            <div className="flex justify-between mb-3">
                <span style={{ color: C.fg3 }}>Recommended</span>

                <strong style={{ color: C.accent }}>
                {suggestion.weight} × {suggestion.reps}
                </strong>
            </div>

            <p
                className="text-xs"
                style={{ color: C.fg3 }}
            >
                {suggestion.reason}
            </p>
            </>
        ) : (
            <p style={{ color: C.fg3 }}>
            No recommendation yet.
            </p>
        )}
        </Section>

        <Section title="Progress">
        {chartData.length > 1 ? (
            <ExerciseProgressChart data={chartData} />
        ) : (
            <p className="text-sm" style={{ color: C.fg3 }}>
            Not enough data for a chart yet.
            </p>
        )}
        </Section>

        <Section title="Recent Performance">{loggedSets.length === 0 ? (
            <p className="text-sm" style={{ color: C.fg3 }}>
            No history yet.
            </p>
        ) : (
            loggedSets.slice(0, 5).map((set, index) => (
            <div
                key={index}
                className="flex justify-between items-center py-2"
                style={{
                borderBottom:
                    index !== Math.min(loggedSets.length, 5) - 1
                    ? `1px solid ${C.border}`
                    : "none",
                }}
            >
                <div>
                <p
                    className="text-sm font-semibold"
                    style={{ color: C.fg }}
                >
                    {set.weight} kg × {set.reps}
                </p>

                <p
                    className="text-[11px]"
                    style={{ color: C.fg3 }}
                >
                    {set.date}
                </p>
                </div>

                <div
                className="text-sm font-bold"
                style={{ color: C.accent }}
                >
                {set.estimatedOneRepMax} kg
                </div>
            </div>
            ))
        )}
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[20px] p-4 mb-4 card-lit"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <h3 className="text-sm font-bold mb-3" style={{ color: C.fg }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[14px] p-3 text-center"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <p className="text-[17px] font-bold" style={{ color: C.fg }}>
        {value}
      </p>
      <p className="text-[11px] mt-1" style={{ color: C.fg3 }}>
        {label}
      </p>
    </div>
  );
}

function Tag({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <span
      className="inline-flex mr-2 mb-2 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{
        background: muted ? C.card2 : C.accentDim,
        color: muted ? C.fg2 : C.accent,
      }}
    >
      {label}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-[14px] p-3"
      style={{ background: C.card2, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-[11px]" style={{ color: C.fg3 }}>
          {label}
        </p>
      </div>
      <p className="text-sm font-bold" style={{ color: C.fg }}>
        {value}
      </p>
    </div>
  );
}

function InfoChip({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) {
    return (
      <div
        className="rounded-full px-3 py-2"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
        }}
      >
        <div
          className="text-[11px] uppercase"
          style={{ color: C.fg3 }}
        >
          {label}
        </div>
  
        <div
          className="text-xs font-semibold"
          style={{ color: C.fg }}
        >
          {value}
        </div>
      </div>
    );
  }