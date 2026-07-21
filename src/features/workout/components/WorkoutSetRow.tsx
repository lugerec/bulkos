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
          <button onClick={() => onWeightChange(Math.max(0, weight - 2.5))}>
            <Minus size={14} color={C.fg3} />
          </button>

          <span className="font-bold" style={{ color: C.fg }}>
            {weight} kg
          </span>

          <button onClick={() => onWeightChange(weight + 2.5)}>
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

          <span className="font-bold" style={{ color: C.fg }}>
            {reps}
          </span>

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
