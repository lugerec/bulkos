import { Minus, Plus, Check, Circle } from "lucide-react";

import { C } from "@/shared/ui";

type Props = {
  index: number;
  reps: number;
  weight: number;
  completed: boolean;

  onToggle: () => void;
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
};

export default function WorkoutSetRow({
  index,
  reps,
  weight,
  completed,
  onToggle,
  onWeightChange,
  onRepsChange,
}: Props) {
  return (
    <div
      className="flex items-center gap-2 py-2 px-1"
      style={{
        opacity: completed ? 0.45 : 1,
        transition: "0.25s",
      }}
    >
      <span
        className="w-8 text-center text-xs font-semibold"
        style={{
          color: completed ? C.accent : C.fg3,
        }}
      >
        {index + 1}
      </span>

      <div
        className="flex-1 rounded-xl flex items-center justify-between px-2 py-1"
        style={{
          background: C.card2,
          border: `1px solid ${C.border}`,
        }}
      >
        <button
          onClick={() => onWeightChange(Math.max(0, weight - 2.5))}
        >
          <Minus size={14} color={C.fg3} />
        </button>

        <span
          className="font-bold"
          style={{ color: C.fg }}
        >
          {weight} kg
        </span>

        <button
          onClick={() => onWeightChange(weight + 2.5)}
        >
          <Plus size={14} color={C.accent} />
        </button>
      </div>

      <div
        className="flex-1 rounded-xl flex items-center justify-between px-2 py-1"
        style={{
          background: C.card2,
          border: `1px solid ${C.border}`,
        }}
      >
        <button
          onClick={() => onRepsChange(Math.max(1, reps - 1))}
        >
          <Minus size={14} color={C.fg3} />
        </button>

        <span
          className="font-bold"
          style={{ color: C.fg }}
        >
          {reps}
        </span>

        <button
          onClick={() => onRepsChange(reps + 1)}
        >
          <Plus size={14} color={C.accent} />
        </button>
      </div>

      <button
        onClick={onToggle}
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: completed ? C.accentDim : C.card2,
          border: `1px solid ${
            completed ? C.accent : C.border
          }`,
        }}
      >
        {completed ? (
          <Check
            size={13}
            color={C.accent}
          />
        ) : (
          <Circle
            size={13}
            color={C.fg3}
          />
        )}
      </button>
    </div>
  );
}