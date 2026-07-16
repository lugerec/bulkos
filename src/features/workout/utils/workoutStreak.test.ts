import { describe, expect, it } from "vitest";
import { toDateKey } from "@/lib/date";

import { getWorkoutStreak } from "./workoutStreak";

// Wednesday, July 15 2026 — current week starts Monday July 13
const NOW = new Date("2026-07-15T12:00:00");

/** Training days for a given week offset (0 = current), spread Mon/Wed/Fri… */
function weekDays(weeksBack: number, count: number): string[] {
  const monday = new Date("2026-07-13T00:00:00");
  monday.setDate(monday.getDate() - weeksBack * 7);

  return Array.from({ length: count }, (_, index) => {
    const day = new Date(monday);
    day.setDate(day.getDate() + index * 2);

    return toDateKey(day);
  });
}

describe("getWorkoutStreak", () => {
  it("has no streak with no history", () => {
    const streak = getWorkoutStreak([], 3, NOW);

    expect(streak.currentStreak).toBe(0);
    expect(streak.longestStreak).toBe(0);
    expect(streak.currentWeekAtRisk).toBe(false);
  });

  it("counts consecutive hit weeks including a completed current week", () => {
    const dates = [
      ...weekDays(0, 3),
      ...weekDays(1, 3),
      ...weekDays(2, 3),
    ];

    const streak = getWorkoutStreak(dates, 3, NOW);

    expect(streak.currentStreak).toBe(3);
    expect(streak.longestStreak).toBe(3);
    expect(streak.currentWeekAtRisk).toBe(false);
  });

  it("keeps the streak alive from prior weeks when the current week is unfinished", () => {
    const dates = [
      ...weekDays(0, 1), // current week only 1 of 3 so far
      ...weekDays(1, 3),
      ...weekDays(2, 3),
    ];

    const streak = getWorkoutStreak(dates, 3, NOW);

    expect(streak.currentStreak).toBe(2);
    expect(streak.currentWeekAtRisk).toBe(true);
  });

  it("does not flag risk when the current week already hit target", () => {
    const dates = [...weekDays(0, 3), ...weekDays(1, 3)];

    const streak = getWorkoutStreak(dates, 3, NOW);

    expect(streak.currentStreak).toBe(2);
    expect(streak.currentWeekAtRisk).toBe(false);
  });

  it("breaks the streak on a missed week", () => {
    const dates = [
      ...weekDays(0, 3),
      ...weekDays(1, 3),
      // week 2 missed (only 1 day)
      ...weekDays(2, 1),
      ...weekDays(3, 3),
    ];

    const streak = getWorkoutStreak(dates, 3, NOW);

    expect(streak.currentStreak).toBe(2);
    expect(streak.longestStreak).toBe(2);
  });

  it("reports the longest past streak even after it ended", () => {
    const dates = [
      ...weekDays(0, 3), // current
      // week 1 missed
      ...weekDays(2, 3),
      ...weekDays(3, 3),
      ...weekDays(4, 3),
    ];

    const streak = getWorkoutStreak(dates, 3, NOW);

    expect(streak.currentStreak).toBe(1);
    expect(streak.longestStreak).toBe(3);
  });
});
