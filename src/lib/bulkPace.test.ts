import { describe, expect, it } from "vitest";
import { toDateKey } from "@/lib/date";

import { applyKcalDeltaToTargets, getBulkPace, getPaceInsight } from "./bulkPace";

const NOW = new Date("2026-07-14T12:00:00");

function entry(daysAgo: number, weightKg: number) {
  const date = new Date(NOW.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  return { date: toDateKey(date), weightKg };
}

describe("getBulkPace", () => {
  it("reports insufficient data with no entries", () => {
    expect(getBulkPace([], "bulk", NOW).status).toBe("insufficient_data");
  });

  it("reports insufficient data when entries span fewer than 5 days", () => {
    const pace = getBulkPace([entry(2, 80), entry(0, 80.5)], "bulk", NOW);

    expect(pace.status).toBe("insufficient_data");
  });

  it("ignores entries older than the 14-day window", () => {
    const pace = getBulkPace([entry(30, 75), entry(0, 80)], "bulk", NOW);

    expect(pace.status).toBe("insufficient_data");
  });

  it("flags on-track bulking pace (+0.25% to +0.5%/week)", () => {
    // 80.0 -> 80.3 over 7 days = +0.3 kg/week ≈ +0.37%/week
    const pace = getBulkPace([entry(7, 80), entry(0, 80.3)], "bulk", NOW);

    expect(pace.status).toBe("on_track");
    expect(pace.weeklyChangeKg).toBeCloseTo(0.3, 1);
    expect(pace.suggestedDailyKcalDelta).toBe(0);
  });

  it("flags too-fast bulking and suggests eating less", () => {
    // +1 kg over 7 days = +1.25%/week, way above the 0.5% cap
    const pace = getBulkPace([entry(7, 80), entry(0, 81)], "bulk", NOW);

    expect(pace.status).toBe("too_fast");
    expect(pace.suggestedDailyKcalDelta).toBeLessThan(0);
    expect(Math.abs(pace.suggestedDailyKcalDelta) % 50).toBe(0);
  });

  it("flags too-slow bulking and suggests eating more", () => {
    // flat weight over 10 days on a bulk
    const pace = getBulkPace([entry(10, 80), entry(0, 80)], "bulk", NOW);

    expect(pace.status).toBe("too_slow");
    expect(pace.suggestedDailyKcalDelta).toBeGreaterThan(0);
  });

  it("evaluates a cut against the negative band", () => {
    // -0.6 kg over 7 days = -0.75%/week: inside the cut band (-1.0..-0.5)
    const onTrack = getBulkPace([entry(7, 80), entry(0, 79.4)], "cut", NOW);
    // weight gain on a cut is too slow (above the band's max of -0.5%)
    const gaining = getBulkPace([entry(7, 80), entry(0, 80.5)], "cut", NOW);

    expect(onTrack.status).toBe("on_track");
    expect(gaining.status).toBe("too_slow");
    expect(gaining.suggestedDailyKcalDelta).toBeLessThan(0);
  });

  it("uses the oldest and newest entries inside the window", () => {
    // Intermediate noise should not change the endpoints-based trend.
    const pace = getBulkPace(
      [entry(13, 80), entry(7, 81.2), entry(3, 80.1), entry(0, 80.6)],
      "bulk",
      NOW
    );

    // (80.6 - 80) / 13 days * 7 ≈ +0.32 kg/week
    expect(pace.weeklyChangeKg).toBeCloseTo(0.32, 1);
    expect(pace.status).toBe("on_track");
  });
});

describe("getPaceInsight", () => {
  it("asks for more data when the trend cannot be computed", () => {
    const insight = getPaceInsight(getBulkPace([], "bulk", NOW), "bulk");

    expect(insight.kcalDelta).toBe(0);
    expect(insight.message).toContain("Not enough weight data");
  });

  it("confirms an on-track pace with no adjustment", () => {
    const pace = getBulkPace([entry(7, 80), entry(0, 80.3)], "bulk", NOW);
    const insight = getPaceInsight(pace, "bulk");

    expect(insight.kcalDelta).toBe(0);
    expect(insight.message).toContain("progressing well");
  });

  it("proposes the pace's kcal delta when off track", () => {
    const pace = getBulkPace([entry(7, 80), entry(0, 81)], "bulk", NOW);
    const insight = getPaceInsight(pace, "bulk");

    expect(insight.kcalDelta).toBe(pace.suggestedDailyKcalDelta);
    expect(insight.kcalDelta).toBeLessThan(0);
    expect(insight.message).toContain("decreasing daily calories");
  });
});

describe("applyKcalDeltaToTargets", () => {
  const targets = { calories: 3000, protein: 180, carbs: 350, fat: 90 };

  it("shifts calories and lets carbs absorb the delta", () => {
    const next = applyKcalDeltaToTargets(targets, -200);

    expect(next.calories).toBe(2800);
    expect(next.carbs).toBe(300);
    expect(next.protein).toBe(180);
    expect(next.fat).toBe(90);
  });

  it("never goes below zero", () => {
    const next = applyKcalDeltaToTargets(
      { calories: 100, protein: 50, carbs: 10, fat: 5 },
      -500
    );

    expect(next.calories).toBe(0);
    expect(next.carbs).toBe(0);
  });

  it("does not mutate the source targets", () => {
    applyKcalDeltaToTargets(targets, 200);

    expect(targets.calories).toBe(3000);
    expect(targets.carbs).toBe(350);
  });
});
