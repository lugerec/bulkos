import { describe, expect, it } from "vitest";

import { getWeekStart, getWeeklySummary, type SummaryWorkout } from "./weeklySummary";

function workout(
  date: string,
  volumeKg = 1000,
  durationSeconds = 3600,
  completedSets = 20
): SummaryWorkout {
  return { date, volumeKg, durationSeconds, completedSets };
}

describe("getWeekStart", () => {
  it("returns Monday for a mid-week date", () => {
    // Wednesday 2026-08-05
    expect(getWeekStart(new Date(2026, 7, 5)).getDate()).toBe(3);
  });

  it("treats Sunday as the end of the week, not the start", () => {
    // Sunday 2026-08-09 belongs to the week starting Mon 2026-08-03.
    expect(getWeekStart(new Date(2026, 7, 9)).getDate()).toBe(3);
  });

  it("returns the same day for a Monday, at midnight", () => {
    const monday = getWeekStart(new Date(2026, 7, 3, 15, 30));
    expect(monday.getDate()).toBe(3);
    expect(monday.getHours()).toBe(0);
  });
});

describe("getWeeklySummary", () => {
  // "Now" is Wednesday 2026-08-05; this week = Aug 3–9, last = Jul 27–Aug 2.
  const now = new Date(2026, 7, 5, 12);

  it("totals sessions, volume, minutes and sets for the current week", () => {
    const summary = getWeeklySummary(
      [workout("2026-08-03", 1000, 3600, 20), workout("2026-08-05", 1500, 1800, 15)],
      now
    );

    expect(summary.thisWeek.sessions).toBe(2);
    expect(summary.thisWeek.volumeKg).toBe(2500);
    expect(summary.thisWeek.minutes).toBe(90);
    expect(summary.thisWeek.sets).toBe(35);
  });

  it("separates last week from this week", () => {
    const summary = getWeeklySummary(
      [workout("2026-08-03", 1000), workout("2026-07-29", 2000)],
      now
    );

    expect(summary.thisWeek.sessions).toBe(1);
    expect(summary.lastWeek.sessions).toBe(1);
    expect(summary.lastWeek.volumeKg).toBe(2000);
  });

  it("ignores workouts outside both weeks", () => {
    const summary = getWeeklySummary([workout("2026-07-01")], now);

    expect(summary.thisWeek.sessions).toBe(0);
    expect(summary.lastWeek.sessions).toBe(0);
  });

  it("computes the volume change against last week", () => {
    const summary = getWeeklySummary(
      [workout("2026-08-03", 1200), workout("2026-07-29", 1000)],
      now
    );

    expect(summary.volumeChangePct).toBe(20);
  });

  it("reports a drop as a negative change", () => {
    const summary = getWeeklySummary(
      [workout("2026-08-03", 800), workout("2026-07-29", 1000)],
      now
    );

    expect(summary.volumeChangePct).toBe(-20);
  });

  it("has no percentage when last week was empty", () => {
    const summary = getWeeklySummary([workout("2026-08-03", 1000)], now);

    expect(summary.volumeChangePct).toBeNull();
  });

  it("handles an empty history", () => {
    const summary = getWeeklySummary([], now);

    expect(summary.thisWeek.sessions).toBe(0);
    expect(summary.volumeChangePct).toBeNull();
  });

  it("includes Sunday in the current week", () => {
    const summary = getWeeklySummary([workout("2026-08-09")], now);

    expect(summary.thisWeek.sessions).toBe(1);
  });
});
