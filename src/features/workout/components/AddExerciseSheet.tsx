import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { C } from "@/shared/ui";
import { exerciseDefinitions } from "@/data/exercises";

type Props = {
  open: boolean;
  /** Exercise ids already in the session, to flag them as added. */
  existingIds: string[];
  onClose: () => void;
  onSelect: (definitionId: string) => void;
};

/**
 * Bottom sheet for adding an extra exercise to the current session — for
 * when you want to do something that wasn't in the template. Filters the
 * full exercise list by a search box.
 */
export default function AddExerciseSheet({
  open,
  existingIds,
  onClose,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? exerciseDefinitions.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.primaryMuscle.toLowerCase().includes(q)
        )
      : exerciseDefinitions;

    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-[20px] p-5 pb-8"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold" style={{ color: C.fg }}>
            Add exercise
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: C.card2, color: C.fg2 }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          className="flex items-center gap-2 rounded-[14px] px-3 py-2 mb-4"
          style={{ background: C.card2, border: `1px solid ${C.border}` }}
        >
          <Search size={16} color={C.fg3} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: C.fg }}
          />
        </div>

        <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
          {results.length === 0 ? (
            <p
              className="text-sm py-6 text-center"
              style={{ color: C.fg3 }}
            >
              No exercises match “{query}”.
            </p>
          ) : (
            results.map((exercise) => {
              const added = existingIds.includes(exercise.id);

              return (
                <button
                  key={exercise.id}
                  onClick={() => onSelect(exercise.id)}
                  className="rounded-[14px] p-3 text-left flex items-center justify-between gap-3"
                  style={{
                    background: C.card2,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div className="min-w-0">
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
                      className="text-[10px] font-semibold px-2 py-1 rounded-full"
                      style={{ background: C.accentDim, color: C.accent }}
                    >
                      Added
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
