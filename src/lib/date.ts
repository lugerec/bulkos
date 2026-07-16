/**
 * Local-time date key `YYYY-MM-DD`. Unlike `toISOString().slice(0, 10)`,
 * which converts to UTC and can roll a local midnight back to the previous
 * day for users in positive-offset zones (e.g. Central Europe), this keeps
 * the date the user actually sees on their calendar. All day/week bucketing
 * in the app must go through this so "today", week starts, streaks, and
 * daily logs agree with the user's local day.
 */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Local-time date key for right now (or a supplied date). */
export function getTodayKey(now: Date = new Date()): string {
  return toDateKey(now);
}
