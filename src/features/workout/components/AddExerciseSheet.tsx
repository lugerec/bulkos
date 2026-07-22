import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { C } from "@/shared/ui";
import ExercisePicker from "@/features/workout/components/ExercisePicker";

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
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
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
          paddingBottom: "max(20px, env(safe-area-inset-bottom, 20px))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[17px] font-extrabold" style={{ color: C.fg }}>
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

        <ExercisePicker
          existingIds={existingIds}
          onSelect={onSelect}
        />
      </div>
    </div>,
    document.body
  );
}
