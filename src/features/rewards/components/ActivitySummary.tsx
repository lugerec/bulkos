import { useEffect, useState } from "react";
import { Activity, Footprints, Flame, TrendingUp, TrendingDown } from "lucide-react";

import { C } from "@/shared/ui";
import { readTodayTotal } from "@/services/healthService";
import {
  getWeeklySummary,
  type SummaryWorkout,
} from "@/features/rewards/weeklySummary";

/**
 * One place to see what you actually did: this week's training next to last
 * week's, plus today's Apple Health activity. Training totals come from the
 * logged history; Health is read live and simply omitted when unavailable
 * (off-device, or access not granted), rather than showing empty zeroes.
 */
export default function ActivitySummary({
  workouts,
}: {
  workouts: readonly SummaryWorkout[];
}) {
  const [health, setHealth] = useState<{
    steps: number;
    calories: number;
    distanceMeters: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      readTodayTotal("steps"),
      readTodayTotal("calories"),
      readTodayTotal("distance"),
    ])
      .then(([steps, calories, distanceMeters]) => {
        if (cancelled) return;
        if (steps > 0 || calories > 0 || distanceMeters > 0) {
          setHealth({ steps, calories, distanceMeters });
        }
      })
      .catch(() => {
        // Health is optional — the training summary stands on its own.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const { thisWeek, lastWeek, volumeChangePct } = getWeeklySummary(workouts);

  const stats = [
    { label: "Sessions", value: String(thisWeek.sessions), was: lastWeek.sessions },
    { label: "Sets", value: String(thisWeek.sets), was: lastWeek.sets },
    { label: "Minutes", value: String(thisWeek.minutes), was: lastWeek.minutes },
    {
      label: "Volume",
      value: `${thisWeek.volumeKg.toLocaleString()} kg`,
      was: lastWeek.volumeKg,
    },
  ];

  return (
    <div
      className="rounded-[18px] p-4 mb-4"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={15} color={C.accent} />
          <p className="text-sm font-bold" style={{ color: C.fg }}>
            Activity
          </p>
        </div>

        {volumeChangePct !== null && (
          <div className="flex items-center gap-1">
            {volumeChangePct >= 0 ? (
              <TrendingUp size={13} color={C.accentInk} />
            ) : (
              <TrendingDown size={13} color={C.amber} />
            )}
            <span
              className="text-[11px] font-bold"
              style={{ color: volumeChangePct >= 0 ? C.accentInk : C.amber }}
            >
              {volumeChangePct > 0 ? "+" : ""}
              {volumeChangePct}% volume
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stats.map(({ label, value, was }) => (
          <div key={label}>
            <p className="text-[15px] font-extrabold" style={{ color: C.fg }}>
              {value}
            </p>
            <p className="text-[10px]" style={{ color: C.fg3 }}>
              {label}
            </p>
            <p className="text-[9px]" style={{ color: C.fg3, opacity: 0.7 }}>
              was {was.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {health && (
        <div
          className="flex items-center gap-4 mt-3 pt-3"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          <span className="text-[10px] font-semibold" style={{ color: C.fg3 }}>
            TODAY
          </span>

          <div className="flex items-center gap-1.5">
            <Footprints size={13} color={C.blue} />
            <span className="text-[11px] font-bold" style={{ color: C.fg2 }}>
              {health.steps.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Flame size={13} color={C.amber} />
            <span className="text-[11px] font-bold" style={{ color: C.fg2 }}>
              {Math.round(health.calories)} kcal
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Activity size={13} color={C.accent} />
            <span className="text-[11px] font-bold" style={{ color: C.fg2 }}>
              {(health.distanceMeters / 1000).toFixed(1)} km
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
