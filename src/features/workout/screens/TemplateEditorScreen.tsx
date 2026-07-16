import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Plus, Save, Trash2 } from "lucide-react";

import { exerciseDefinitions } from "@/data/exercises";
import { C } from "@/shared/ui";
import { useAuthStore } from "@/store/authStore";
import { useWorkoutTemplateStore } from "@/store/workoutTemplateStore";
import type {
  Equipment,
  ExerciseDefinition,
  MuscleGroup,
  WorkoutExercise,
} from "@/types/workout";

type FilterValue<T extends string> = T | "all";

const muscleFilters: { label: string; value: FilterValue<MuscleGroup> }[] = [
  { label: "All", value: "all" },
  { label: "Chest", value: "chest" },
  { label: "Back", value: "back" },
  { label: "Shoulders", value: "shoulders" },
  { label: "Biceps", value: "biceps" },
  { label: "Triceps", value: "triceps" },
  { label: "Legs", value: "legs" },
  { label: "Glutes", value: "glutes" },
  { label: "Abs", value: "abs" },
];

const equipmentFilters: { label: string; value: FilterValue<Equipment> }[] = [
  { label: "All", value: "all" },
  { label: "Barbell", value: "barbell" },
  { label: "Dumbbell", value: "dumbbell" },
  { label: "Machine", value: "machine" },
  { label: "Cable", value: "cable" },
  { label: "Bodyweight", value: "bodyweight" },
];

export default function TemplateEditorScreen({ onBack }: { onBack: () => void }) {
  const user = useAuthStore((s) => s.user);
  const template = useWorkoutTemplateStore((s) => s.selected);
  const saveTemplate = useWorkoutTemplateStore((s) => s.save);

  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [search, setSearch] = useState("");
  const [activeMuscle, setActiveMuscle] = useState<FilterValue<MuscleGroup>>("all");
  const [activeEquipment, setActiveEquipment] = useState<FilterValue<Equipment>>("all");

  useEffect(() => {
    if (!template) return;

    setName(template.name);
    setExercises(template.exercises);
  }, [template]);

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exerciseDefinitions.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(query);

      const matchesMuscle =
        activeMuscle === "all" ||
        exercise.primaryMuscle === activeMuscle ||
        exercise.secondaryMuscles?.includes(activeMuscle);

      const matchesEquipment =
        activeEquipment === "all" || exercise.equipment === activeEquipment;

      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [activeEquipment, activeMuscle, search]);

  if (!template) {
    return (
      <div className="px-5 pt-5">
        <p style={{ color: C.fg3 }}>No template selected.</p>
      </div>
    );
  }

  const addExercise = (definition: ExerciseDefinition) => {
    setExercises((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        exerciseId: definition.id,
        name: definition.name,
        restSeconds: definition.defaultRestSeconds,
        sets: Array.from({ length: definition.defaultSets }, () => ({
          weight: 0,
          reps: definition.defaultReps,
        })),
      },
    ]);
  };

  const removeExercise = (id: string) => {
    setExercises((current) => current.filter((exercise) => exercise.id !== id));
  };

  const duplicateExercise = (id: string) => {
    setExercises((current) => {
      const exercise = current.find((item) => item.id === id);
      if (!exercise) return current;

      const copy: WorkoutExercise = {
        ...exercise,
        id: crypto.randomUUID(),
        name: `${exercise.name} Copy`,
        sets: exercise.sets.map((set) => ({ ...set })),
      };

      const index = current.findIndex((item) => item.id === id);
      const next = [...current];
      next.splice(index + 1, 0, copy);

      return next;
    });
  };

  const updateExerciseName = (id: string, value: string) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === id ? { ...exercise, name: value } : exercise
      )
    );
  };

  const updateNotes = (id: string, value: string) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === id ? { ...exercise, notes: value } : exercise
      )
    );
  };

  const updateRest = (id: string, amount: number) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === id
          ? {
              ...exercise,
              restSeconds: Math.max(30, (exercise.restSeconds ?? 90) + amount),
            }
          : exercise
      )
    );
  };

  const updateReps = (id: string, amount: number) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === id
          ? {
              ...exercise,
              sets: exercise.sets.map((set) => ({
                ...set,
                reps: Math.max(1, set.reps + amount),
              })),
            }
          : exercise
      )
    );
  };

  const updateWeight = (id: string, amount: number) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === id
          ? {
              ...exercise,
              sets: exercise.sets.map((set) => ({
                ...set,
                weight: Math.max(0, set.weight + amount),
              })),
            }
          : exercise
      )
    );
  };

  const updateSets = (id: string, amount: number) => {
    setExercises((current) =>
      current.map((exercise) => {
        if (exercise.id !== id) return exercise;

        const nextCount = Math.max(1, exercise.sets.length + amount);

        return {
          ...exercise,
          sets: Array.from({ length: nextCount }, (_, index) =>
            exercise.sets[index] ?? {
              weight: exercise.sets[0]?.weight ?? 0,
              reps: exercise.sets[0]?.reps ?? 8,
            }
          ),
        };
      })
    );
  };

  const moveExercise = (id: string, direction: "up" | "down") => {
    setExercises((current) => {
      const index = current.findIndex((exercise) => exercise.id === id);
      if (index === -1) return current;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;

    await saveTemplate(user.uid, {
      ...template,
      name: name.trim() || "Untitled Template",
      exercises,
    });

    onBack();
  };

  return (
    <div className="px-5 pt-4 pb-8">
      <button onClick={onBack} className="mb-5" style={{ color: C.accent }}>
        ← Back
      </button>

      <p
        className="text-[11px] uppercase tracking-widest font-bold"
        style={{ color: C.accent }}
      >
        Workout Template
      </p>

      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="w-full bg-transparent outline-none text-3xl font-extrabold mt-1 mb-6"
        style={{ color: C.fg }}
      />

      <div className="flex flex-col gap-3">
        {exercises.length === 0 ? (
          <div
            className="rounded-[18px] p-5 text-center"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <p className="text-sm" style={{ color: C.fg3 }}>
              No exercises yet.
            </p>
          </div>
        ) : (
          exercises.map((exercise) => (
            <TemplateExerciseCard
              key={exercise.id}
              exercise={exercise}
              onNameChange={updateExerciseName}
              onNotesChange={updateNotes}
              onRepsChange={updateReps}
              onWeightChange={updateWeight}
              onRestChange={updateRest}
              onSetsChange={updateSets}
              onMove={moveExercise}
              onDuplicate={duplicateExercise}
              onRemove={removeExercise}
            />
          ))
        )}
      </div>

      <p
        className="text-[11px] uppercase tracking-widest font-bold mt-7 mb-3"
        style={{ color: C.fg2 }}
      >
        Add Exercise
      </p>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search exercise..."
        className="w-full mb-3 px-4 py-3 rounded-[14px] bg-transparent outline-none"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          color: C.fg,
        }}
      />

      <FilterChips
        items={muscleFilters}
        value={activeMuscle}
        onChange={setActiveMuscle}
      />

      <div className="mt-3">
        <FilterChips
          items={equipmentFilters}
          value={activeEquipment}
          onChange={setActiveEquipment}
        />
      </div>

      <div className="flex flex-col gap-3 mt-4 mb-6">
        {filteredExercises.map((exercise) => (
          <ExerciseDefinitionCard
            key={exercise.id}
            exercise={exercise}
            onAdd={addExercise}
          />
        ))}
      </div>

      <button
        onClick={handleSave}
        className="w-full py-4 rounded-[18px] font-bold flex items-center justify-center gap-2"
        style={{ background: C.accent, color: C.bg }}
      >
        <Save size={18} />
        Save Template
      </button>
    </div>
  );
}

function TemplateExerciseCard({
  exercise,
  onNameChange,
  onNotesChange,
  onRepsChange,
  onWeightChange,
  onRestChange,
  onSetsChange,
  onMove,
  onDuplicate,
  onRemove,
}: {
  exercise: WorkoutExercise;
  onNameChange: (id: string, value: string) => void;
  onNotesChange: (id: string, value: string) => void;
  onRepsChange: (id: string, amount: number) => void;
  onWeightChange: (id: string, amount: number) => void;
  onRestChange: (id: string, amount: number) => void;
  onSetsChange: (id: string, amount: number) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className="rounded-[18px] p-4"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <input
            value={exercise.name}
            onChange={(event) => onNameChange(exercise.id, event.target.value)}
            className="w-full bg-transparent outline-none font-bold text-base"
            style={{ color: C.fg }}
          />

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs" style={{ color: C.fg3 }}>
              {exercise.sets.length} sets
            </span>

            <ControlButton onClick={() => onRepsChange(exercise.id, -1)}>
              -
            </ControlButton>

            <span className="text-xs font-bold" style={{ color: C.fg }}>
              {exercise.sets[0]?.reps ?? 8} reps
            </span>

            <ControlButton onClick={() => onRepsChange(exercise.id, 1)}>
              +
            </ControlButton>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs" style={{ color: C.fg3 }}>
              Rest
            </span>

            <ControlButton onClick={() => onRestChange(exercise.id, -15)}>
              -
            </ControlButton>

            <span className="text-xs font-bold" style={{ color: C.fg }}>
              {exercise.restSeconds ?? 90}s
            </span>

            <ControlButton onClick={() => onRestChange(exercise.id, 15)}>
              +
            </ControlButton>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs" style={{ color: C.fg3 }}>
              Weight
            </span>

            <ControlButton onClick={() => onWeightChange(exercise.id, -2.5)}>
              -
            </ControlButton>

            <span className="text-xs font-bold" style={{ color: C.fg }}>
              {exercise.sets[0]?.weight ?? 0} kg
            </span>

            <ControlButton onClick={() => onWeightChange(exercise.id, 2.5)}>
              +
            </ControlButton>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          <IconButton onClick={() => onMove(exercise.id, "up")}>
            <ArrowUp size={14} color={C.fg3} />
          </IconButton>

          <IconButton onClick={() => onMove(exercise.id, "down")}>
            <ArrowDown size={14} color={C.fg3} />
          </IconButton>

          <IconButton onClick={() => onDuplicate(exercise.id)}>
            <Copy size={14} color={C.fg3} />
          </IconButton>

          <IconButton onClick={() => onRemove(exercise.id)}>
            <Trash2 size={14} color={C.red} />
          </IconButton>
        </div>
      </div>

      <textarea
        value={exercise.notes ?? ""}
        onChange={(event) => onNotesChange(exercise.id, event.target.value)}
        placeholder="Notes..."
        className="w-full mt-4 px-3 py-2 rounded-xl text-xs outline-none resize-none"
        style={{
          background: C.card2,
          border: `1px solid ${C.border}`,
          color: C.fg,
        }}
      />

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onSetsChange(exercise.id, -1)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold"
          style={{
            background: C.card2,
            border: `1px solid ${C.border}`,
            color: C.fg,
          }}
        >
          - Set
        </button>

        <button
          onClick={() => onSetsChange(exercise.id, 1)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold"
          style={{
            background: C.card2,
            border: `1px solid ${C.border}`,
            color: C.fg,
          }}
        >
          + Set
        </button>
      </div>
    </div>
  );
}

function ExerciseDefinitionCard({
  exercise,
  onAdd,
}: {
  exercise: ExerciseDefinition;
  onAdd: (exercise: ExerciseDefinition) => void;
}) {
  return (
    <button
      onClick={() => onAdd(exercise)}
      className="rounded-[18px] p-4 text-left"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: C.fg }}>
            {exercise.name}
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            <Tag>💪 {exercise.primaryMuscle}</Tag>
            <Tag>🏋️ {exercise.equipment}</Tag>

            <span
              className="px-2 py-1 rounded-full text-[10px]"
              style={{
                background:
                  exercise.category === "compound"
                    ? "rgba(163,230,53,.12)"
                    : C.card2,
                color: exercise.category === "compound" ? C.accent : C.fg2,
              }}
            >
              {exercise.category}
            </span>
          </div>

          <div className="flex gap-5 mt-3 text-[11px]" style={{ color: C.fg3 }}>
            <span>
              {exercise.defaultSets} × {exercise.defaultReps}
            </span>
            <span>Rest {exercise.defaultRestSeconds}s</span>
          </div>
        </div>

        <div
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: C.accent, color: C.bg }}
        >
          <Plus size={18} />
        </div>
      </div>
    </button>
  );
}

function FilterChips<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {items.map((filter) => {
        const active = value === filter.value;

        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className="px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap"
            style={{
              background: active ? C.accent : C.card,
              border: `1px solid ${active ? C.accent : C.border}`,
              color: active ? C.bg : C.fg2,
            }}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

function IconButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full flex items-center justify-center"
      style={{ background: C.card2, border: `1px solid ${C.border}` }}
    >
      {children}
    </button>
  );
}

function ControlButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 rounded-lg text-xs font-bold"
      style={{ background: C.card2, color: C.fg }}
    >
      {children}
    </button>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="px-2 py-1 rounded-full text-[10px]"
      style={{ background: C.card2, color: C.fg2 }}
    >
      {children}
    </span>
  );
}
