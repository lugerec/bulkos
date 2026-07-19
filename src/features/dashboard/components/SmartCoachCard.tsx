import { Sparkles, Moon, ChevronRight } from "lucide-react";

import { C, T } from "@/shared/ui";
import type { WorkoutRecommendation } from "@/features/workout/utils/workoutRecommendation";

type Props = {
  recommendation: WorkoutRecommendation;
  onStart: () => void;
};

export default function SmartCoachCard({ recommendation, onStart }: Props) {
  const isRecovery = recommendation.split === "recovery";

  return (
    <div
      className="rounded-[20px] p-5 mb-4 card-lit"
      style={{
        background: isRecovery
          ? "linear-gradient(135deg, rgba(96,165,250,0.14), rgba(192,132,252,0.08))"
          : "linear-gradient(135deg, rgba(192,132,252,0.14), rgba(74,222,128,0.08))",
        border: `1px solid ${
          isRecovery ? "rgba(96,165,250,0.25)" : "rgba(192,132,252,0.25)"
        }`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        {isRecovery ? (
          <Moon size={15} color={C.blue} />
        ) : (
          <Sparkles size={15} color={C.purple} />
        )}
        <p
          style={{ ...T.eyebrow, color: isRecovery ? C.blue : C.purple }}
        >
          Smart Coach
        </p>
      </div>

      <div className="flex items-center justify-between mb-2">
        <p style={{ ...T.title, color: C.fg }}>
          {recommendation.title}
        </p>

        {!isRecovery && (
          <span
            className="px-2.5 py-1 rounded-full"
            style={
              recommendation.isDeloadWeek
                ? { ...T.caption, fontWeight: 700, background: "rgba(251,191,36,0.14)", color: C.amber }
                : { ...T.caption, fontWeight: 700, background: C.accentDim, color: C.accent }
            }
          >
            {recommendation.isDeloadWeek
              ? "Deload week"
              : `${recommendation.readinessPercent}% ready`}
          </span>
        )}
      </div>

      <p className="mb-4" style={{ ...T.body, color: C.fg }}>
        {recommendation.reason}
      </p>

      {recommendation.focusMuscles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {recommendation.focusMuscles.slice(0, 4).map((muscle) => {
            const info = recommendation.muscleRecovery.find(
              (item) => item.muscle === muscle
            );

            return (
              <span
                key={muscle}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full capitalize"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${C.border}`,
                  color: C.fg2,
                }}
              >
                {muscle}
                {info ? ` · ${info.recoveryPercent}%` : ""}
              </span>
            );
          })}
        </div>
      )}

      {!isRecovery && recommendation.isGenerated && (
        <p className="text-[11px] mb-2" style={{ color: C.fg3 }}>
          No matching template — workout generated from your exercise library.
        </p>
      )}

      {!isRecovery && (
        <button
          onClick={onStart}
          className="w-full py-3 rounded-[14px] text-sm font-bold flex items-center justify-center gap-1.5"
          style={{
            background: C.accent,
            color: C.bg,
          }}
        >
          {recommendation.template
            ? recommendation.isDeloadWeek
              ? `Start "${recommendation.template.name}" (deload)`
              : `Start "${recommendation.template.name}"`
            : `Start ${recommendation.title}`}
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}