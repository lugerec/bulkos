import { useState } from "react";
import { Layers } from "lucide-react";

import { C } from "@/shared/ui";
import type { Equipment } from "@/types/workout";
import {
  calculatePlates,
  formatPlatePlan,
  DEFAULT_BAR_KG,
} from "@/features/workout/utils/plateCalculator";

/** Only barbell-style lifts load plates on a bar. */
const BAR_EQUIPMENT: Equipment[] = ["barbell"];

type Props = {
  /** Target weight for the set, in kg. */
  weight: number;
  equipment: Equipment | undefined;
};

/**
 * Shows what to load per side for a barbell lift, so the lifter doesn't do
 * the arithmetic mid-session. Collapsed to a one-line summary; tapping opens
 * the per-side breakdown and lets the bar weight be changed for the odd
 * 15 kg women's bar or a 25 kg safety-squat bar.
 */
export default function PlateHint({ weight, equipment }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [barWeight, setBarWeight] = useState(DEFAULT_BAR_KG);

  const isBar = equipment !== undefined && BAR_EQUIPMENT.includes(equipment);
  if (!isBar || weight <= barWeight) return null;

  const plan = calculatePlates(weight, barWeight);
  if (plan.plates.length === 0) return null;

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-[12px] mb-2"
      style={{ background: C.card2, border: `1px solid ${C.border}` }}
    >
      <Layers size={13} color={C.fg3} />

      <span className="text-[11px] flex-1 text-left" style={{ color: C.fg2 }}>
        {expanded ? (
          <>
            Per side: <span style={{ color: C.fg }}>{formatPlatePlan(plan)}</span>
            {!plan.exact && (
              <span style={{ color: C.fg3 }}>
                {" "}
                (closest {plan.achievableTotal} kg)
              </span>
            )}
          </>
        ) : (
          <>
            Plates:{" "}
            <span style={{ color: C.fg }}>{formatPlatePlan(plan)}</span> per side
          </>
        )}
      </span>

      {expanded && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setBarWeight((b) => (b === 20 ? 15 : b === 15 ? 25 : 20));
          }}
          className="text-[10px] px-2 py-1 rounded-lg flex-shrink-0"
          style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg3 }}
        >
          Bar {barWeight}kg
        </span>
      )}
    </button>
  );
}
