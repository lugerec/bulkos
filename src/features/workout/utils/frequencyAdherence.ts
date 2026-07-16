import { toDateKey } from "@/lib/date";
export type WeekAdherence = {
  /** Monday of that week, YYYY-MM-DD */
  weekStart: string;
  /** distinct training days that week */
  completed: number;
  hit: boolean;
};

export type FrequencyAdherence = {
  targetPerWeek: number;
  /** distinct training days since Monday */
  completedThisWeek: number;
  remainingThisWeek: number;
  /** calendar days left this week, today included only if not yet trained */
  daysAvailable: number;
  /** true when the remaining sessions still fit into the available days */
  onPace: boolean;
  /** previous 4 full weeks, oldest first */
  recentWeeks: WeekAdherence[];
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const RECENT_WEEKS = 4;

/** Monday 00:00 of the week containing `date`. */
function getWeekStart(date: Date): Date {
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);

  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  return monday;
}

/**
 * Weekly training-day adherence against the frequency chosen at
 * onboarding. Distinct training *days* are counted (two sessions on one
 * day are one day toward a days-per-week target).
 */
export function getFrequencyAdherence(
  workoutDates: readonly string[],
  targetPerWeek: number,
  now: Date = new Date()
): FrequencyAdherence {
  const trainedDays = new Set(workoutDates);
  const weekStart = getWeekStart(now);
  const weekStartKey = toDateKey(weekStart);
  const todayKey = toDateKey(now);

  const completedThisWeek = [...trainedDays].filter(
    (date) => date >= weekStartKey && date <= todayKey
  ).length;

  const remainingThisWeek = Math.max(0, targetPerWeek - completedThisWeek);

  const dayIndex = Math.floor(
    (now.getTime() - weekStart.getTime()) / MS_PER_DAY
  );
  const daysLeftInclToday = 7 - dayIndex;
  const daysAvailable = trainedDays.has(todayKey)
    ? daysLeftInclToday - 1
    : daysLeftInclToday;

  const recentWeeks: WeekAdherence[] = [];

  for (let weeksBack = RECENT_WEEKS; weeksBack >= 1; weeksBack--) {
    const start = new Date(weekStart.getTime() - weeksBack * 7 * MS_PER_DAY);
    const end = new Date(start.getTime() + 7 * MS_PER_DAY);
    const startKey = toDateKey(start);
    const endKey = toDateKey(end);

    const completed = [...trainedDays].filter(
      (date) => date >= startKey && date < endKey
    ).length;

    recentWeeks.push({
      weekStart: startKey,
      completed,
      hit: completed >= targetPerWeek,
    });
  }

  return {
    targetPerWeek,
    completedThisWeek,
    remainingThisWeek,
    daysAvailable,
    onPace: remainingThisWeek <= daysAvailable,
    recentWeeks,
  };
}
