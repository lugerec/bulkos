import { TrendingDown } from "lucide-react";

import { C } from "@/shared/ui";
import { SectionHeader } from "@/shared/components";
import {
  suggestVariations,
  type ExercisePlateau,
} from "@/features/workout/utils/plateauDetection";

type Props = {
  plateaus: ExercisePlateau[];
};

/**
 * Progress-screen card listing lifts whose estimated 1RM has stalled,
 * with a concrete nudge to break the plateau. Hidden when nothing stalls.
 */
export default function StallingLiftsCard({ plateaus }: Props) {
  if (plateaus.length === 0) return null;

  return (
    <>
      <SectionHeader title="Stalling Lifts" />

      <div
        className="rounded-[20px] p-4 mb-4"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown size={16} color={C.amber} />
          <span className="text-sm font-semibold" style={{ color: C.fg }}>
            {plateaus.length === 1
              ? "1 lift has stopped progressing"
              : `${plateaus.length} lifts have stopped progressing`}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {plateaus.map((item) => {
            const variations = suggestVariations(item.exerciseId);

            return (
              <div key={item.exerciseId}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p
                      className="text-xs font-medium truncate"
                      style={{ color: C.fg }}
                    >
                      {item.exerciseName}
                    </p>
                    <p className="text-[11px]" style={{ color: C.fg3 }}>
                      Best est. 1RM {item.bestEst1RM} kg · recent{" "}
                      {item.recentBestEst1RM} kg
                    </p>
                  </div>

                  <span
                    className="text-[11px] font-bold whitespace-nowrap ml-2"
                    style={{ color: C.amber }}
                  >
                    {item.sessionsSinceBest}{" "}
                    {item.sessionsSinceBest === 1 ? "session" : "sessions"}{" "}
                    since PR
                  </span>
                </div>

                {variations.length > 0 && (
                  <p className="text-[11px] mt-0.5" style={{ color: C.fg2 }}>
                    Try:{" "}
                    {variations.map((variation) => variation.name).join(" · ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] mt-3" style={{ color: C.fg3 }}>
          Try a different rep range, add a back-off set, or swap in a close
          variation for a few weeks.
        </p>
      </div>
    </>
  );
}
