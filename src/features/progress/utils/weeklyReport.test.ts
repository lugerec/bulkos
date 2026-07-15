import { describe, expect, it } from "vitest";

import { getWeeklyReport } from "./weeklyReport";

// Tuesday, July 14 2026 — last completed week is Mon Jul 6 to Sun Jul 12
const NOW = new Date("2026-07-14T12:00:00");

describe("getWeeklyReport", () => {
  it("targets the last completed Mon-Sun week", () => {
    const report = getWeeklyReport([], [], 4, NOW);

    expect(report.weekStart).toBe("2026-07-06");
    expect(report.weekEnd).toBe("2026-07-12");
  });

  it("counts distinct training days and total volume for that week only", () => {
    const workouts = [
      { date: "2026-07-06", volumeKg: 5000 },
      { date: "2026-07-08", volumeKg: 4000 },
      { date: "2026-07-08", volumeKg: 1000 },
      // current week — must be excluded
      { date: "2026-07-13", volumeKg: 9000 },
      // two weeks ago — excluded from the report, used for the delta
      { date: "2026-07-01", volumeKg: 8000 },
    ];

    const report = getWeeklyReport(workouts, [], 4, NOW);

    expect(report.trainingDays).toBe(2);
    expect(report.volumeKg).toBe(10000);
    expect(report.volumeDeltaKg).toBe(2000);
  });

  it("computes body weight change from that week's first and last check-ins", () => {
    const entries = [
      { date: "2026-07-06", weightKg: 80 },
      { date: "2026-07-09", weightKg: 80.4 },
      { date: "2026-07-12", weightKg: 80.6 },
      // outside the week — ignored
      { date: "2026-07-13", weightKg: 82 },
    ];

    const report = getWeeklyReport([], entries, 4, NOW);

    expect(report.weightChangeKg).toBe(0.6);
  });

  it("returns null weight change with fewer than two check-ins in the week", () => {
    const report = getWeeklyReport(
      [],
      [{ date: "2026-07-08", weightKg: 80 }],
      4,
      NOW
    );

    expect(report.weightChangeKg).toBeNull();
  });

  it("passes the frequency target through", () => {
    expect(getWeeklyReport([], [], 5, NOW).targetTrainingDays).toBe(5);
  });
});
