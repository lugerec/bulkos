import { useState } from "react";
import { Sparkles, X } from "lucide-react";

import { C, T } from "@/shared/ui";

export type AiSplit = "push" | "pull" | "lower" | "fullBody";

const SPLITS: { value: AiSplit; label: string; hint: string }[] = [
  { value: "push", label: "Push", hint: "Chest · shoulders · triceps" },
  { value: "pull", label: "Pull", hint: "Back · biceps" },
  { value: "lower", label: "Legs", hint: "Quads · hams · glutes · calves" },
  { value: "fullBody", label: "Full body", hint: "Everything, balanced" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerate: (split: AiSplit) => void;
};

/**
 * Bottom sheet for generating a coach-built workout: pick a split, tap
 * Generate. Uses the same generator the Smart Coach uses (prefers exercises
 * you've done before, compounds first).
 */
export default function AiWorkoutSheet({ open, onClose, onGenerate }: Props) {
  const [split, setSplit] = useState<AiSplit>("fullBody");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-[24px] p-5"
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
          <h3 style={{ ...T.title, color: C.fg }}>AI workout</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: C.card2, color: C.fg2 }}
          >
            <X size={16} />
          </button>
        </div>

        <p className="mb-4" style={{ ...T.body, color: C.fg3 }}>
          Pick a focus — the coach builds the workout from exercises you know,
          compounds first.
        </p>

        <div
          className="flex flex-col gap-2 mb-4 overflow-y-auto"
          style={{ flex: 1, minHeight: 0, WebkitOverflowScrolling: "touch" }}
        >
          {SPLITS.map((option) => {
            const active = split === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setSplit(option.value)}
                className="rounded-[16px] px-4 py-3 text-left flex items-center justify-between"
                style={{
                  background: active ? C.accentDim : C.card2,
                  border: `1px solid ${active ? C.accent : C.border}`,
                }}
              >
                <div>
                  <p style={{ ...T.bodyStrong, color: C.fg }}>
                    {option.label}
                  </p>
                  <p className="mt-0.5" style={{ ...T.caption, color: C.fg3 }}>
                    {option.hint}
                  </p>
                </div>

                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{
                    border: `2px solid ${active ? C.accent : C.border}`,
                    background: active ? C.accent : "transparent",
                  }}
                />
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onGenerate(split)}
          className="w-full py-4 rounded-full font-bold flex items-center justify-center gap-2"
          style={{
            background: C.accent,
            color: "#0A0A0B",
            boxShadow: "0 8px 28px rgba(204,242,50,0.25)",
          }}
        >
          <Sparkles size={17} />
          Generate workout
        </button>
      </div>
    </div>
  );
}
