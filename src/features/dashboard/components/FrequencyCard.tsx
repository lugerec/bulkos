import { CalendarCheck } from "lucide-react";

import { C } from "@/shared/ui";
import type { FrequencyAdherence } from "@/features/workout/utils/frequencyAdherence";

type Props = {
  adherence: FrequencyAdherence;
};

/**
 * Dashboard card tracking distinct training days this week against the
 * frequency chosen at onboarding, with a 4-week hit/miss history.
 */
export default function FrequencyCard({ adherence }: Props) {
  const targetHit = adherence.remainingThisWeek === 0;

  const color = targetHit
    ? C.accent
    : adherence.onPace
    ? C.blue
    : C.amber;

  const statusLabel = targetHit
    ? "Target hit"
    : adherence.onPace
    ? "On pace"
    : "Falling behind";

  const detail = targetHit
    ? "Weekly training target done — anything extra is a bonus."
    : `${adherence.remainingThisWeek} ${
        adherence.remainingThisWeek === 1 ? "session" : "sessions"
      } left, ${adherence.daysAvailable} ${
        adherence.daysAvailable === 1 ? "day" : "days"
      } to go.`;

  return (
    <div
      className="rounded-[22px] p-4 mb-5"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CalendarCheck size={16} color={color} />
          <span className="text-sm font-semibold" style={{ color: C.fg }}>
            Training days
          </span>
        </div>

        <span className="text-[11px] font-bold" style={{ color }}>
          {statusLabel}
        </span>
      </div>

      <p className="text-2xl font-extrabold mb-1" style={{ color: C.fg }}>
        {adherence.completedThisWeek}
        <span className="text-sm font-semibold" style={{ color: C.fg2 }}>
          {" "}
          / {adherence.targetPerWeek} this week
        </span>
      </p>

      <p className="text-xs mb-3" style={{ color: C.fg2 }}>
        {detail}
      </p>

      <div className="flex items-center gap-2">
        <span className="text-[10px]" style={{ color: C.fg3 }}>
          Last 4 weeks
        </span>

        <div className="flex items-center gap-1.5">
          {adherence.recentWeeks.map((week) => (
            <span
              key={week.weekStart}
              title={`Week of ${week.weekStart}: ${week.completed}/${adherence.targetPerWeek}`}
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: week.hit ? C.accent : C.border,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
