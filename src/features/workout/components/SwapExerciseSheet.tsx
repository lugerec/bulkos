import { X } from "lucide-react";

import { C } from "@/shared/ui";
import { exerciseDefinitions } from "@/data/exercises";
import type { ExerciseDefinition } from "@/types/workout";

type Props = {
  /** The exercise currently in the slot being swapped, or null when closed. */
  current: ExerciseDefinition | null;
  onClose: () => void;
  onSelect: (definitionId: string) => void;
};

/**
 * Same-primary-muscle alternatives for an exercise, excluding itself,
 * sorted by name.
 */
export function getAlternatives(
  current: ExerciseDefinition,
  all: ExerciseDefinition[] = exerciseDefinitions
): ExerciseDefinition[] {
  return all
    .filter(
      (d) => d.id !== current.id && d.primaryMuscle === current.primaryMuscle
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Bottom sheet for swapping one exercise for another that trains the same
 * primary muscle — e.g. when a station is taken. Same-muscle alternatives
 * are listed first; the current exercise is excluded.
 */
export default function SwapExerciseSheet({
  current,
  onClose,
  onSelect,
}: Props) {
  if (!current) return null;

  const alternatives = getAlternatives(current);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-[20px] p-5"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[17px] font-extrabold" style={{ color: C.fg }}>
            Swap exercise
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

        <p className="text-xs mb-4" style={{ color: C.fg3 }}>
          Same muscle ({current.primaryMuscle}) — sets are kept, weights reset.
        </p>

        {alternatives.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: C.fg3 }}>
            No other {current.primaryMuscle} exercises available.
          </p>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto"
          style={{ flex: 1, minHeight: 0, WebkitOverflowScrolling: "touch" }}>
            {alternatives.map((alt) => (
              <button
                key={alt.id}
                onClick={() => onSelect(alt.id)}
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
                    {alt.name}
                  </p>
                  <p
                    className="text-[11px] mt-0.5 capitalize"
                    style={{ color: C.fg3 }}
                  >
                    {alt.equipment} · {alt.category}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
