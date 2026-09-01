import { toDateKey } from "@/lib/date";

export type WeekDay = {
  /** YYYY-MM-DD */
  key: string;
  /** Single-letter label, Mon–Sun. */
  label: string;
  trained: boolean;
  isToday: boolean;
  /** Days in the future (this week, not yet reached). */
  isFuture: boolean;
};

const LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

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
 * The current week as seven Monday-first days, each flagged with whether a
 * workout was logged that day, plus today/future markers for display.
 */
export function getWeekDays(
  trainedDates: readonly string[],
  now: Date = new Date()
): WeekDay[] {
  const trained = new Set(trainedDates);
  const weekStart = getWeekStart(now);
  const todayKey = toDateKey(now);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.getTime() + i * MS_PER_DAY);
    const key = toDateKey(d);

    return {
      key,
      label: LABELS[i],
      trained: trained.has(key),
      isToday: key === todayKey,
      isFuture: key > todayKey,
    };
  });
}
