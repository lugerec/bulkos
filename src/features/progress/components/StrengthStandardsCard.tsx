import { Award } from "lucide-react";

import { C } from "@/shared/ui";
import { SectionHeader } from "@/shared/components";
import {
  STRENGTH_LEVELS,
  type StrengthLevel,
} from "@/lib/strengthStandards";
import type { StrengthStandard } from "@/lib/strengthStandards";

type Props = {
  standards: StrengthStandard[];
};

const EXERCISE_LABELS: Record<string, string> = {
  "bench-press": "Bench Press",
  squat: "Squat",
  deadlift: "Deadlift",
  "overhead-press": "Overhead Press",
};

const LEVEL_LABELS: Record<StrengthLevel, string> = {
  beginner: "Beginner",
  novice: "Novice",
  intermediate: "Intermediate",
  advanced: "Advanced",
  elite: "Elite",
};

function levelColor(level: StrengthLevel): string {
  if (level === "elite") return C.purple;
  if (level === "advanced") return C.accent;
  if (level === "intermediate") return C.blue;
  if (level === "novice") return C.amber;

  return C.fg2;
}

/**
 * Progress-screen card placing the big lifts on a beginner→elite scale by
 * est. 1RM ÷ body weight, with the weight needed for the next level.
 * Hidden until at least one standard lift has been trained.
 */
export default function StrengthStandardsCard({ standards }: Props) {
  if (standards.length === 0) return null;

  return (
    <>
      <SectionHeader title="Strength Standards" />

      <div
        className="rounded-[20px] p-4 mb-4 card-lit"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} color={C.accent} />
          <span className="text-sm font-semibold" style={{ color: C.fg }}>
            Relative to your body weight
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {standards.map((standard) => {
            const color = levelColor(standard.level);
            const levelIndex = STRENGTH_LEVELS.indexOf(standard.level);
            const fillPercent =
              ((levelIndex + 1) / STRENGTH_LEVELS.length) * 100;

            return (
              <div key={standard.exerciseId}>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-xs font-medium"
                    style={{ color: C.fg }}
                  >
                    {EXERCISE_LABELS[standard.exerciseId] ??
                      standard.exerciseId}
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold uppercase tracking-wide"
                      style={{ color }}
                    >
                      {LEVEL_LABELS[standard.level]}
                    </span>
                    <span
                      className="text-xs font-bold w-20 text-right"
                      style={{ color: C.fg }}
                    >
                      {standard.est1RM} kg ·{" "}
                      <span style={{ color: C.fg3 }}>{standard.ratio}×</span>
                    </span>
                  </div>
                </div>

                <div
                  style={{ height: 4, background: C.border, borderRadius: 99 }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${fillPercent}%`,
                      background: color,
                      borderRadius: 99,
                    }}
                  />
                </div>

                {standard.nextLevel && standard.nextLevelWeightKg !== null && (
                  <p className="text-[11px] mt-1" style={{ color: C.fg3 }}>
                    {standard.nextLevelWeightKg} kg to reach{" "}
                    {LEVEL_LABELS[standard.nextLevel]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
