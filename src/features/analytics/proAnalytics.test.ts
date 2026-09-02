import { describe, expect, it } from "vitest";

import {
  estimateOneRepMax,
  getMuscleVolumeTrend,
  getStrengthTrend,
  getWeeklyVolumeTrend,
  type TrendWorkout,
} from "./proAnalytics";

function workout(
  date: string,
  volumeKg: number,
  exercises: TrendWorkout["exercises"] = []
): TrendWorkout {
  return { date, volumeKg, exercises };
}

describe("estimateOneRepMax", () => {
  it("applies the Epley formula", () => {
    expect(estimateOneRepMax(100, 1)).toBe(103.3);
    expect(estimateOneRepMax(100, 5)).toBe(116.7);
    expect(estimateOneRepMax(100, 10)).toBe(133.3);
  });

  it("returns 0 for non-positive inputs", () => {
    expect(estimateOneRepMax(0, 5)).toBe(0);
    expect(estimateOneRepMax(100, 0)).toBe(0);
    expect(estimateOneRepMax(-10, 5)).toBe(0);
  });
});

describe("getWeeklyVolumeTrend", () => {
  const now = new Date(2026, 7, 5); // Wed 2026-08-05, week start Mon 2026-08-03

  it("returns the requested number of weeks, oldest first", () => {
    const trend = getWeeklyVolumeTrend([], 4, now);
    expect(trend).toHaveLength(4);
    expect(trend[3].weekStart).toBe("2026-08-03"); // current week last
    expect(trend[0].weekStart).toBe("2026-07-13"); // 3 weeks back first
  });

  it("sums volume and counts sessions within each week", () => {
    const trend = getWeeklyVolumeTrend(
      [workout("2026-08-03", 1000), workout("2026-08-05", 500), workout("2026-07-29", 800)],
      4,
      now
    );

    const current = trend[trend.length - 1];
    expect(current.volumeKg).toBe(1500);
    expect(current.sessions).toBe(2);

    const previous = trend[trend.length - 2];
    expect(previous.volumeKg).toBe(800);
    expect(previous.sessions).toBe(1);
  });

  it("shows zero for a week with no sessions instead of omitting it", () => {
    const trend = getWeeklyVolumeTrend([workout("2026-08-03", 1000)], 4, now);
    expect(trend[0].volumeKg).toBe(0);
    expect(trend[0].sessions).toBe(0);
  });

  it("ignores workouts outside the requested window", () => {
    const trend = getWeeklyVolumeTrend([workout("2026-01-01", 1000)], 4, now);
    expect(trend.every((w) => w.volumeKg === 0)).toBe(true);
  });
});

describe("getStrengthTrend", () => {
  const bench = (weight: number, reps: number, completed = true) => ({
    exerciseId: "bench-press",
    id: "ex1",
    name: "Bench Press",
    sets: [{ weight, reps, completed }],
  });

  it("picks the best estimated 1RM per session, sorted oldest first", () => {
    const trend = getStrengthTrend(
      [
        workout("2026-08-05", 0, [bench(100, 5)]),
        workout("2026-08-01", 0, [bench(90, 8)]),
      ],
      { id: "bench-press", name: "Bench Press" }
    );

    expect(trend).toHaveLength(2);
    expect(trend[0].date).toBe("2026-08-01");
    expect(trend[1].date).toBe("2026-08-05");
  });

  it("ignores incomplete sets and sessions without the exercise", () => {
    const trend = getStrengthTrend(
      [
        workout("2026-08-01", 0, [bench(100, 5, false)]),
        workout("2026-08-02", 0, [
          { exerciseId: "squat", id: "ex2", name: "Squat", sets: [{ weight: 100, reps: 5, completed: true }] },
        ]),
      ],
      { id: "bench-press", name: "Bench Press" }
    );

    expect(trend).toHaveLength(0);
  });

  it("falls back to matching by name when no id is given", () => {
    const trend = getStrengthTrend(
      [workout("2026-08-01", 0, [bench(100, 5)])],
      { name: "Bench Press" }
    );

    expect(trend).toHaveLength(1);
  });

  it("picks the heaviest-implied set within a session", () => {
    const session = workout("2026-08-01", 0, [
      {
        exerciseId: "bench-press",
        id: "ex1",
        name: "Bench Press",
        sets: [
          { weight: 100, reps: 5, completed: true },
          { weight: 110, reps: 3, completed: true },
        ],
      },
    ]);

    const trend = getStrengthTrend([session], { id: "bench-press", name: "Bench Press" });
    expect(trend[0].weight).toBe(110);
  });
});

describe("getMuscleVolumeTrend", () => {
  const now = new Date(2026, 7, 5); // week start 2026-08-03
  const lookup = new Map([
    ["bench-press", "Chest"],
    ["squat", "Legs"],
  ]);

  it("splits completed sets by muscle group and week", () => {
    const trend = getMuscleVolumeTrend(
      [
        workout("2026-08-03", 0, [
          {
            exerciseId: "bench-press",
            id: "ex1",
            name: "Bench",
            sets: [
              { weight: 1, reps: 1, completed: true },
              { weight: 1, reps: 1, completed: true },
            ],
          },
        ]),
        workout("2026-07-29", 0, [
          {
            exerciseId: "bench-press",
            id: "ex1",
            name: "Bench",
            sets: [{ weight: 1, reps: 1, completed: true }],
          },
        ]),
      ],
      lookup,
      now
    );

    const chest = trend.find((t) => t.muscleGroup === "Chest");
    expect(chest?.setsThisWeek).toBe(2);
    expect(chest?.setsLastWeek).toBe(1);
  });

  it("ignores incomplete sets", () => {
    const trend = getMuscleVolumeTrend(
      [
        workout("2026-08-03", 0, [
          {
            exerciseId: "squat",
            id: "ex2",
            name: "Squat",
            sets: [{ weight: 1, reps: 1, completed: false }],
          },
        ]),
      ],
      lookup,
      now
    );

    expect(trend.find((t) => t.muscleGroup === "Legs")?.setsThisWeek).toBe(0);
  });

  it("buckets unknown exercises as Other", () => {
    const trend = getMuscleVolumeTrend(
      [
        workout("2026-08-03", 0, [
          {
            exerciseId: "mystery",
            id: "ex3",
            name: "?",
            sets: [{ weight: 1, reps: 1, completed: true }],
          },
        ]),
      ],
      lookup,
      now
    );

    expect(trend.find((t) => t.muscleGroup === "Other")?.setsThisWeek).toBe(1);
  });

  it("sorts by this week's volume descending", () => {
    const trend = getMuscleVolumeTrend(
      [
        workout("2026-08-03", 0, [
          {
            exerciseId: "squat",
            id: "ex2",
            name: "Squat",
            sets: [{ weight: 1, reps: 1, completed: true }],
          },
          {
            exerciseId: "bench-press",
            id: "ex1",
            name: "Bench",
            sets: Array(3).fill({ weight: 1, reps: 1, completed: true }),
          },
        ]),
      ],
      lookup,
      now
    );

    expect(trend[0].muscleGroup).toBe("Chest");
  });
});
