import { toDateKey } from "@/lib/date";

/** Minimal shape needed from a logged workout. */
export type SummaryWorkout = {
  date: string;
  volumeKg: number;
  durationSeconds: number;
  completedSets: number;
};

export type WeekTotals = {
  sessions: number;
  volumeKg: number;
  minutes: number;
  sets: number;
};

export type WeeklySummary = {
  thisWeek: WeekTotals;
  lastWeek: WeekTotals;
  /** Percent change in volume vs last week; null when last week was empty. */
  volumeChangePct: number | null;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Monday 00:00 of the week containing `date`. */
export function getWeekStart(date: Date): Date {
  const monday = new Date(date);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - day + (day === 0 ? -6 : 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function totalsBetween(
  workouts: readonly SummaryWorkout[],
  startKey: string,
  endKey: string
): WeekTotals {
  const inRange = workouts.filter((w) => w.date >= startKey && w.date <= endKey);

  return {
    sessions: inRange.length,
    volumeKg: Math.round(inRange.reduce((sum, w) => sum + (w.volumeKg || 0), 0)),
    minutes: Math.round(
      inRange.reduce((sum, w) => sum + (w.durationSeconds || 0), 0) / 60
    ),
    sets: inRange.reduce((sum, w) => sum + (w.completedSets || 0), 0),
  };
}

/**
 * Training totals for the current week and the one before it, so progress is
 * shown against a reference rather than as a number with no context.
 */
export function getWeeklySummary(
  workouts: readonly SummaryWorkout[],
  now: Date = new Date()
): WeeklySummary {
  const thisMonday = getWeekStart(now);
  const lastMonday = new Date(thisMonday.getTime() - 7 * MS_PER_DAY);

  const thisWeek = totalsBetween(
    workouts,
    toDateKey(thisMonday),
    toDateKey(new Date(thisMonday.getTime() + 6 * MS_PER_DAY))
  );

  const lastWeek = totalsBetween(
    workouts,
    toDateKey(lastMonday),
    toDateKey(new Date(lastMonday.getTime() + 6 * MS_PER_DAY))
  );

  const volumeChangePct =
    lastWeek.volumeKg > 0
      ? Math.round(
          ((thisWeek.volumeKg - lastWeek.volumeKg) / lastWeek.volumeKg) * 100
        )
      : null;

  return { thisWeek, lastWeek, volumeChangePct };
}
