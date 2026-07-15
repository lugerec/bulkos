import { useState } from "react";
import { Flame } from "lucide-react";

import { C } from "@/shared/ui";
import {
  getPlatesPerSide,
  getWarmupSets,
} from "@/features/workout/utils/warmup";
import type { Equipment } from "@/types/workout";

type Props = {
  workingWeight: number;
  equipment: Equipment | undefined;
};

const BAR_EQUIPMENT: readonly Equipment[] = [
  "barbell",
  "ezBar",
  "smithMachine",
];

/**
 * Collapsible warm-up ramp for a working weight. For bar lifts it also
 * shows the plates to load per side. Renders nothing when warm-up sets
 * aren't useful (light or non-loadable lifts).
 */
export default function WarmupHint({ workingWeight, equipment }: Props) {
  const [open, setOpen] = useState(false);

  const warmupSets = getWarmupSets(workingWeight, equipment);

  if (warmupSets.length === 0) return null;

  const isBar = equipment !== undefined && BAR_EQUIPMENT.includes(equipment);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-[11px] font-semibold"
        style={{ color: C.amber }}
      >
        <Flame size={12} color={C.amber} />
        {open ? "Hide warm-up" : "Warm-up sets"}
      </button>

      {open && (
        <div
          className="mt-2 rounded-[14px] p-3"
          style={{ background: C.card2, border: `1px solid ${C.border}` }}
        >
          <div className="flex flex-col gap-2">
            {warmupSets.map((set, index) => {
              const plates = isBar
                ? getPlatesPerSide(set.weight)
                : null;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >
                  <span
                    className="text-xs font-semibold"
                    style={{ color: C.fg }}
                  >
                    {set.weight} kg × {set.reps}
                    <span
                      className="text-[10px] font-normal ml-1.5"
                      style={{ color: C.fg3 }}
                    >
                      {Math.round(set.ratio * 100)}%
                    </span>
                  </span>

                  {plates && plates.platesPerSide.length > 0 && (
                    <span className="text-[10px]" style={{ color: C.fg3 }}>
                      {plates.platesPerSide.join(" · ")} / side
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {isBar && (
            <p className="text-[10px] mt-2" style={{ color: C.fg3 }}>
              Plates per side assume a 20 kg bar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
