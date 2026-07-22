import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Check, Circle } from "lucide-react";

import { C } from "@/shared/ui";
import type { SetEffort } from "@/types/workout";

type Props = {
  index: number;
  reps: number;
  weight: number;
  completed: boolean;
  effort?: SetEffort;

  onToggle: () => void;
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
  onEffortChange: (value: SetEffort) => void;
  showEffort?: boolean;
};

const EFFORTS: { value: SetEffort; label: string; color: string }[] = [
  { value: "easy", label: "Easy", color: C.blue },
  { value: "moderate", label: "OK", color: C.accentInk },
  { value: "hard", label: "Hard", color: C.amber },
];

export default function WorkoutSetRow({
  index,
  reps,
  weight,
  completed,
  effort,
  onToggle,
  onWeightChange,
  onRepsChange,
  onEffortChange,
  showEffort = true,
}: Props) {
  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-1"
        style={{
          opacity: completed ? 0.55 : 1,
          transition: "0.25s",
        }}
      >
        <span
          className="w-8 text-center text-xs font-semibold"
          style={{ color: completed ? C.accent : C.fg3 }}
        >
          {index + 1}
        </span>

        <div
          className="flex-1 rounded-xl flex items-center justify-between px-2 py-1"
          style={{ background: C.card2, border: `1px solid ${C.border}` }}
        >
          <button onClick={() => onWeightChange(Math.max(0, round1(weight - WEIGHT_STEP)))}>
            <Minus size={14} color={C.fg3} />
          </button>

          <EditableValue
            value={weight}
            suffix="kg"
            step="0.5"
            min={0}
            onCommit={onWeightChange}
          />

          <button onClick={() => onWeightChange(round1(weight + WEIGHT_STEP))}>
            <Plus size={14} color={C.accent} />
          </button>
        </div>

        <div
          className="flex-1 rounded-xl flex items-center justify-between px-2 py-1"
          style={{ background: C.card2, border: `1px solid ${C.border}` }}
        >
          <button onClick={() => onRepsChange(Math.max(1, reps - 1))}>
            <Minus size={14} color={C.fg3} />
          </button>

          <EditableValue
            value={reps}
            step="1"
            min={1}
            integer
            onCommit={onRepsChange}
          />

          <button onClick={() => onRepsChange(reps + 1)}>
            <Plus size={14} color={C.accent} />
          </button>
        </div>

        <button
          onClick={onToggle}
          aria-label={completed ? "Mark set incomplete" : "Mark set complete"}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: completed ? C.accentDim : C.card2,
            border: `1px solid ${completed ? C.accent : C.border}`,
          }}
        >
          {completed ? (
            <Check size={13} color={C.accent} />
          ) : (
            <Circle size={13} color={C.fg3} />
          )}
        </button>
      </div>

      {completed && showEffort && (
        <div className="flex items-center gap-2 pl-10 pr-1 pb-2">
          <span className="text-[11px]" style={{ color: C.fg3 }}>
            Felt
          </span>
          {EFFORTS.map((option) => {
            const active = effort === option.value;

            return (
              <button
                key={option.value}
                onClick={() => onEffortChange(option.value)}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{
                  background: active ? option.color : C.card2,
                  border: `1px solid ${active ? option.color : C.border}`,
                  color: active ? C.bg : C.fg3,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Step for the +/- buttons — fine enough for micro-plates. */
const WEIGHT_STEP = 1.25;

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/**
 * A number that turns into an input when tapped, so values can be typed
 * directly instead of only stepped with +/-.
 */
function EditableValue({
  value,
  suffix,
  step,
  min,
  integer,
  onCommit,
}: {
  value: number;
  suffix?: string;
  step: string;
  min: number;
  integer?: boolean;
  onCommit: (value: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    const parsed = Number(draft.replace(",", "."));

    if (!Number.isNaN(parsed)) {
      const clamped = Math.max(min, parsed);
      onCommit(integer ? Math.round(clamped) : round1(clamped));
    }

    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        type="number"
        inputMode="decimal"
        step={step}
        className="w-14 text-center font-bold rounded-lg outline-none"
        style={{
          background: C.bg,
          color: C.fg,
          border: `1px solid ${C.accent}`,
        }}
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className="font-bold px-1"
      style={{ color: C.fg }}
    >
      {value}
      {suffix ? ` ${suffix}` : ""}
    </button>
  );
}
