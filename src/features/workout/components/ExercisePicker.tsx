import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { C, T } from "@/shared/ui";
import { exerciseDefinitions } from "@/data/exercises";
import ExerciseThumb from "@/features/workout/components/ExerciseThumb";
import type { ExerciseDefinition, MuscleGroup } from "@/types/workout";

/**
 * The one exercise picker used by Add/Swap sheets (and anywhere else):
 * search (name + aliases + muscle), muscle-group filter chips, and results
 * ordered by match quality → compounds first → name. Rows show a thumbnail
 * and muscle · equipment caption.
 */

const MUSCLE_FILTERS: { value: MuscleGroup | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "biceps", label: "Biceps" },
  { value: "triceps", label: "Triceps" },
  { value: "legs", label: "Legs" },
  { value: "glutes", label: "Glutes" },
  { value: "calves", label: "Calves" },
  { value: "abs", label: "Abs" },
];

type Props = {
  /** Exercise ids already in the session — shown dimmed with a badge. */
  existingIds: string[];
  onSelect: (definitionId: string) => void;
  /** Text on the badge for already-added items. */
  addedLabel?: string;
  /** Pre-select a muscle chip (e.g. swap defaults to the current muscle). */
  initialMuscle?: MuscleGroup;
};

export default function ExercisePicker({
  existingIds,
  onSelect,
  addedLabel = "Added",
  initialMuscle,
}: Props) {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "all">(
    initialMuscle ?? "all"
  );

  const results = useMemo(
    () => filterAndRank(exerciseDefinitions, query, muscle),
    [query, muscle]
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Search */}
      <div
        className="flex items-center gap-2 rounded-[14px] px-3 py-2 mb-3"
        style={{ background: C.card2, border: `1px solid ${C.border}` }}
      >
        <Search size={16} color={C.fg3} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises…"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: C.fg }}
        />
      </div>

      {/* Muscle chips */}
      <div
        className="flex gap-1.5 overflow-x-auto mb-3 pb-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {MUSCLE_FILTERS.map((filter) => {
          const active = muscle === filter.value;

          return (
            <button
              key={filter.value}
              onClick={() => setMuscle(filter.value)}
              className="px-3 py-1.5 rounded-full flex-shrink-0"
              style={{
                ...T.caption,
                fontWeight: 700,
                background: active ? C.accent : C.card2,
                color: active ? "#0A0A0B" : C.fg2,
                border: `1px solid ${active ? C.accent : C.border}`,
              }}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Results — the single scroll area */}
      <div
        className="flex flex-col gap-2 overflow-y-auto"
        style={{ flex: 1, minHeight: 0, WebkitOverflowScrolling: "touch" }}
      >
        {results.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: C.fg3 }}>
            No exercises match.
          </p>
        ) : (
          results.map((exercise) => {
            const added = existingIds.includes(exercise.id);

            return (
              <button
                key={exercise.id}
                onClick={() => !added && onSelect(exercise.id)}
                disabled={added}
                className="rounded-[14px] p-2.5 text-left flex items-center gap-3"
                style={{
                  background: C.card2,
                  border: `1px solid ${C.border}`,
                  opacity: added ? 0.45 : 1,
                }}
              >
                <ExerciseThumb exercise={exercise} size={40} />

                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-bold truncate"
                    style={{ color: C.fg }}
                  >
                    {exercise.name}
                  </p>
                  <p
                    className="text-[11px] mt-0.5 capitalize"
                    style={{ color: C.fg3 }}
                  >
                    {exercise.primaryMuscle} · {exercise.equipment}
                  </p>
                </div>

                {added && (
                  <span
                    className="text-[11px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
                    style={{ background: C.accentDim, color: C.accentInk }}
                  >
                    {addedLabel}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/** Search + muscle filter + ranking: exact/startsWith > includes > alias/muscle;
 *  compounds before isolation within the same tier; then by name. */
export function filterAndRank(
  definitions: readonly ExerciseDefinition[],
  query: string,
  muscle: MuscleGroup | "all"
): ExerciseDefinition[] {
  const q = query.trim().toLowerCase();

  const pool =
    muscle === "all"
      ? definitions
      : definitions.filter(
          (d) =>
            d.primaryMuscle === muscle ||
            d.secondaryMuscles?.includes(muscle)
        );

  const score = (d: ExerciseDefinition): number => {
    if (!q) return 1;

    const name = d.name.toLowerCase();
    if (name.startsWith(q)) return 0;
    if (name.includes(q)) return 1;

    const aliasHit = d.aliases?.some((a) => a.toLowerCase().includes(q));
    if (aliasHit) return 2;

    if (d.primaryMuscle.toLowerCase().includes(q)) return 3;

    return -1; // no match
  };

  return pool
    .map((d) => ({ d, s: score(d) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => {
      if (a.s !== b.s) return a.s - b.s;

      const aCompound = a.d.category === "compound" ? 0 : 1;
      const bCompound = b.d.category === "compound" ? 0 : 1;
      if (aCompound !== bCompound) return aCompound - bCompound;

      return a.d.name.localeCompare(b.d.name);
    })
    .map((x) => x.d);
}
