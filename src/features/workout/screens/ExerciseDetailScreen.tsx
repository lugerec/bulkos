import { ArrowLeft } from "lucide-react";

import { C } from "@/shared/ui";
import { exerciseDefinitions } from "@/data/exercises";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";
import ExerciseMedia from "@/features/workout/components/ExerciseMedia";
import { getExerciseMedia } from "@/features/workout/utils/exerciseMedia";

type Props = {
  onBack: () => void;
};

export default function ExerciseDetailScreen({ onBack }: Props) {
  const exerciseId = useWorkoutHistoryStore((s) => s.selectedExerciseId);

  const exercise = exerciseDefinitions.find(
    (e) => e.id === exerciseId
  );

  if (!exercise) {
    return (
      <div className="px-5 pt-5">
        <button
          onClick={onBack}
          className="mb-5"
          style={{ color: C.accent }}
        >
          ← Back
        </button>

        <p style={{ color: C.fg3 }}>
          Exercise not found.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5 pb-10">

      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6"
        style={{ color: C.accent }}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <p
        className="text-[11px] uppercase tracking-widest font-bold"
        style={{ color: C.accent }}
      >
        Exercise
      </p>

      <h1
        className="text-[32px] font-extrabold mt-1"
        style={{ color: C.fg }}
      >
        {exercise.name}
      </h1>

      <div className="flex gap-2 flex-wrap mt-4">

        <Badge text={exercise.primaryMuscle} />

        {exercise.secondaryMuscles?.map((muscle) => (
          <Badge key={muscle} text={muscle} />
        ))}

        <Badge text={exercise.equipment} />

        <Badge text={exercise.category} />

      </div>

      <div className="mt-5">
        <ExerciseMedia
          media={getExerciseMedia(exercise.id, exercise.media)}
          name={exercise.name}
          primaryMuscle={exercise.primaryMuscle}
        />
      </div>

      <Section title="Instructions">
        {exercise.instructions?.map((step, index) => (
          <p
            key={index}
            className="mb-3"
            style={{ color: C.fg2 }}
          >
            {index + 1}. {step}
          </p>
        ))}
      </Section>

      <Section title="Tips">
        {exercise.tips?.map((tip) => (
          <p
            key={tip}
            className="mb-2"
            style={{ color: C.fg2 }}
          >
            ✓ {tip}
          </p>
        ))}
      </Section>

      <Section title="Common mistakes">
        {exercise.mistakes?.map((mistake) => (
          <p
            key={mistake}
            className="mb-2"
            style={{ color: C.fg2 }}
          >
            ✕ {mistake}
          </p>
        ))}
      </Section>

      <Section title="Default prescription">

        <Stat
          label="Sets"
          value={exercise.defaultSets.toString()}
        />

        <Stat
          label="Reps"
          value={exercise.defaultReps.toString()}
        />

        <Stat
          label="Rest"
          value={`${exercise.defaultRestSeconds}s`}
        />

      </Section>

    </div>
  );
}

function Section({
  title,
  children,
}: React.PropsWithChildren<{
  title: string;
}>) {
  return (
    <div
      className="mt-8 rounded-[20px] p-4 card-lit"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
      }}
    >
      <h3
        className="font-bold mb-4"
        style={{ color: C.fg }}
      >
        {title}
      </h3>

      {children}
    </div>
  );
}

function Badge({
  text,
}: {
  text: string;
}) {
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        background: C.card2,
        color: C.fg2,
      }}
    >
      {text}
    </span>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between mb-2">
      <span style={{ color: C.fg3 }}>
        {label}
      </span>

      <span
        className="font-semibold"
        style={{ color: C.fg }}
      >
        {value}
      </span>
    </div>
  );
}