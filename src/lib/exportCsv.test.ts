import { describe, expect, it } from "vitest";

import { buildBodyMetricsCsv, buildWorkoutsCsv } from "./exportCsv";

describe("buildWorkoutsCsv", () => {
  it("emits only the header with no workouts", () => {
    expect(buildWorkoutsCsv([])).toBe(
      "date,workout,exercise,set,weight_kg,reps,completed"
    );
  });

  it("writes one row per set with set numbers", () => {
    const csv = buildWorkoutsCsv([
      {
        date: "2026-07-10",
        name: "Push Day",
        exercises: [
          {
            name: "Bench Press",
            sets: [
              { weight: 100, reps: 8, completed: true },
              { weight: 100, reps: 6, completed: false },
            ],
          },
        ],
      },
    ]);

    const lines = csv.split("\n");

    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe("2026-07-10,Push Day,Bench Press,1,100,8,true");
    expect(lines[2]).toBe("2026-07-10,Push Day,Bench Press,2,100,6,false");
  });

  it("sorts workouts chronologically", () => {
    const csv = buildWorkoutsCsv([
      {
        date: "2026-07-12",
        name: "B",
        exercises: [
          { name: "Squat", sets: [{ weight: 100, reps: 5, completed: true }] },
        ],
      },
      {
        date: "2026-07-10",
        name: "A",
        exercises: [
          { name: "Squat", sets: [{ weight: 100, reps: 5, completed: true }] },
        ],
      },
    ]);

    const lines = csv.split("\n");

    expect(lines[1].startsWith("2026-07-10")).toBe(true);
    expect(lines[2].startsWith("2026-07-12")).toBe(true);
  });

  it("escapes names containing commas or quotes", () => {
    const csv = buildWorkoutsCsv([
      {
        date: "2026-07-10",
        name: 'Push, "heavy" day',
        exercises: [
          {
            name: "Bench Press",
            sets: [{ weight: 100, reps: 8, completed: true }],
          },
        ],
      },
    ]);

    expect(csv.split("\n")[1]).toContain('"Push, ""heavy"" day"');
  });
});

describe("buildBodyMetricsCsv", () => {
  it("writes a row per check-in with blanks for missing measurements", () => {
    const csv = buildBodyMetricsCsv([
      { date: "2026-07-10", weightKg: 80.4, bodyFatPct: 15 },
      { date: "2026-07-08", weightKg: 80 },
    ]);

    const lines = csv.split("\n");

    expect(lines[0]).toBe("date,weight_kg,body_fat_pct,waist_cm,chest_cm");
    expect(lines[1]).toBe("2026-07-08,80,,,");
    expect(lines[2]).toBe("2026-07-10,80.4,15,,");
  });
});
