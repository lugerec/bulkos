import { describe, expect, it } from "vitest";
import { toDateKey } from "@/lib/date";

import { getFrequencyAdherence } from "./frequencyAdherence";

// Tuesday, July 14 2026 (week starts Monday July 13)
const NOW = new Date("2026-07-14T12:00:00");

function daysAgo(days: number): string {
  const date = new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);

  return toDateKey(date);
}

describe("getFrequencyAdherence", () => {
  it("starts the week empty and on pace", () => {
    const adherence = getFrequencyAdherence([], 5, NOW);

    expect(adherence.completedThisWeek).toBe(0);
    expect(adherence.remainingThisWeek).toBe(5);
    // Tuesday: 6 days left including today, nothing trained today
    expect(adherence.daysAvailable).toBe(6);
    expect(adherence.onPace).toBe(true);
  });

  it("counts distinct training days since Monday", () => {
    // Monday + two sessions on Tuesday = 2 training days
    const adherence = getFrequencyAdherence(
      [daysAgo(1), daysAgo(0), daysAgo(0)],
      5,
      NOW
    );

    expect(adherence.completedThisWeek).toBe(2);
    expect(adherence.remainingThisWeek).toBe(3);
  });

  it("excludes today from available days once trained", () => {
    const adherence = getFrequencyAdherence([daysAgo(0)], 5, NOW);

    expect(adherence.completedThisWeek).toBe(1);
    expect(adherence.daysAvailable).toBe(5);
    expect(adherence.onPace).toBe(true);
  });

  it("flags falling behind when remaining sessions no longer fit", () => {
    // Sunday of the same week: 1 day left, target 6, one day trained
    const sunday = new Date("2026-07-19T12:00:00");
    const adherence = getFrequencyAdherence(["2026-07-13"], 6, sunday);

    expect(adherence.completedThisWeek).toBe(1);
    expect(adherence.daysAvailable).toBe(1);
    expect(adherence.onPace).toBe(false);
  });

  it("reports zero remaining once the target is hit", () => {
    const adherence = getFrequencyAdherence(
      [daysAgo(0), daysAgo(1)],
      2,
      NOW
    );

    expect(adherence.remainingThisWeek).toBe(0);
    expect(adherence.onPace).toBe(true);
  });

  it("ignores workouts from previous weeks in the current-week count", () => {
    const adherence = getFrequencyAdherence(
      [daysAgo(3), daysAgo(4), daysAgo(5)],
      5,
      NOW
    );

    // NOW is Tuesday; 3-5 days ago is Thursday-Saturday of last week
    expect(adherence.completedThisWeek).toBe(0);
  });

  it("marks recent weeks hit or missed against the target", () => {
    // Last week (Mon Jul 6 - Sun Jul 12): 3 training days, target 3 -> hit
    // Two weeks ago (Jun 29 - Jul 5): 1 training day -> missed
    const adherence = getFrequencyAdherence(
      ["2026-07-06", "2026-07-08", "2026-07-10", "2026-06-30"],
      3,
      NOW
    );

    expect(adherence.recentWeeks).toHaveLength(4);

    const lastWeek = adherence.recentWeeks[3];
    const twoWeeksAgo = adherence.recentWeeks[2];

    expect(lastWeek.weekStart).toBe("2026-07-06");
    expect(lastWeek.completed).toBe(3);
    expect(lastWeek.hit).toBe(true);
    expect(twoWeeksAgo.completed).toBe(1);
    expect(twoWeeksAgo.hit).toBe(false);
  });
});
