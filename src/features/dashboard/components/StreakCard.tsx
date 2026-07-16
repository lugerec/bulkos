import { Flame } from "lucide-react";

import { C } from "@/shared/ui";
import type { WorkoutStreak } from "@/features/workout/utils/workoutStreak";

type Props = {
  streak: WorkoutStreak;
};

/**
 * Dashboard streak card: consecutive weeks that hit the frequency target.
 * Hidden until a streak exists. Warns when the current week is still short
 * of target but the streak is alive.
 */
export default function StreakCard({ streak }: Props) {
  if (streak.currentStreak === 0) return null;

  const color = streak.currentWeekAtRisk ? C.amber : C.accent;

  return (
    <div
      className="rounded-[22px] p-4 mb-5"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}1a` }}
          >
            <Flame size={22} color={color} />
          </div>

          <div>
            <p className="text-2xl font-extrabold leading-none" style={{ color: C.fg }}>
              {streak.currentStreak}
              <span className="text-sm font-semibold ml-1" style={{ color: C.fg2 }}>
                week{streak.currentStreak === 1 ? "" : "s"}
              </span>
            </p>
            <p className="text-[11px] mt-1" style={{ color: C.fg3 }}>
              {streak.currentWeekAtRisk
                ? "Train this week to keep your streak"
                : "On-target weeks in a row"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide" style={{ color: C.fg3 }}>
            Best
          </p>
          <p className="text-sm font-bold mt-0.5" style={{ color: C.fg }}>
            {streak.longestStreak} wk
          </p>
        </div>
      </div>
    </div>
  );
}
