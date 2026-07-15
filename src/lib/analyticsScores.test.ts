import { describe, expect, it } from "vitest";

import {
  getAnalyticsScores,
  getConsistencyScore,
  getPaceScore,
  getRecoveryScore,
  getVolumeScore,
} from "./analyticsScores";
import type { BulkPace } from "./bulkPace";
import type { FrequencyAdherence } from "@/features/workout/utils/frequencyAdherence";
import type {
  MuscleRecoveryInfo,
  MuscleSetTargetInfo,
} from "@/features/workout/utils/workoutRecommendation";

const onTrackPace: BulkPace = {
  status: "on_track",
  weeklyChangeKg: 0.3,
  weeklyChangePercent: 0.37,
  targetMinPercent: 0.25,
  targetMaxPercent: 0.5,
  suggestedDailyKcalDelta: 0,
};

const adherence: FrequencyAdherence = {
  targetPerWeek: 4,
  completedThisWeek: 2,
  remainingThisWeek: 2,
  daysAvailable: 4,
  onPace: true,
  recentWeeks: [
    { weekStart: "2026-06-15", completed: 4, hit: true },
    { weekStart: "2026-06-22", completed: 4, hit: true },
    { weekStart: "2026-06-29", completed: 2, hit: false },
    { weekStart: "2026-07-06", completed: 4, hit: true },
  ],
};

function recovery(percent: number): MuscleRecoveryInfo {
  return {
    muscle: "chest",
    recoveryPercent: percent,
    hoursSinceTrained: 24,
    weeklyVolumeKg: 1000,
  };
}

function setTarget(
  status: MuscleSetTargetInfo["status"],
  weeklySets: number
): MuscleSetTargetInfo {
  return { muscle: "chest", weeklySets, mev: 8, mav: 20, status };
}

describe("getPaceScore", () => {
  it("returns null without enough weight data", () => {
    expect(
      getPaceScore({ ...onTrackPace, status: "insufficient_data" })
    ).toBeNull();
  });

  it("scores 95 when on track", () => {
    expect(getPaceScore(onTrackPace)).toBe(95);
  });

  it("penalizes by distance outside the band", () => {
    const tooFast: BulkPace = {
      ...onTrackPace,
      status: "too_fast",
      weeklyChangePercent: 1.0,
    };

    // 0.5 over the max -> 95 - 50 = 45
    expect(getPaceScore(tooFast)).toBe(45);
  });
});

describe("getConsistencyScore", () => {
  it("combines the 4-week hit rate with this week's progress", () => {
    // hit rate 3/4 = 0.75 -> 52.5; current 2/4 = 0.5 -> 15; total 68
    expect(getConsistencyScore(adherence)).toBe(68);
  });

  it("scores 100 with a perfect history and a finished week", () => {
    const perfect: FrequencyAdherence = {
      ...adherence,
      completedThisWeek: 4,
      remainingThisWeek: 0,
      recentWeeks: adherence.recentWeeks.map((week) => ({
        ...week,
        hit: true,
      })),
    };

    expect(getConsistencyScore(perfect)).toBe(100);
  });
});

describe("getRecoveryScore", () => {
  it("averages recovery across muscles", () => {
    expect(getRecoveryScore([recovery(80), recovery(60)])).toBe(70);
  });

  it("defaults to 100 with no data", () => {
    expect(getRecoveryScore([])).toBe(100);
  });
});

describe("getVolumeScore", () => {
  it("returns null with no tracked muscles", () => {
    expect(getVolumeScore([])).toBeNull();
  });

  it("gives full credit to optimal, scaled credit to under, partial to high", () => {
    const score = getVolumeScore([
      setTarget("optimal", 12),
      setTarget("under", 4), // 4/8 mev = 0.5
      setTarget("high", 25), // 0.7
    ]);

    // (1 + 0.5 + 0.7) / 3 = 0.733 -> 73
    expect(score).toBe(73);
  });
});

describe("getAnalyticsScores", () => {
  it("labels the pace score by goal and describes each value", () => {
    const scores = getAnalyticsScores({
      pace: onTrackPace,
      goal: "bulk",
      adherence,
      muscleRecovery: [recovery(90)],
      setTargets: [setTarget("optimal", 12)],
    });

    expect(scores.map((score) => score.label)).toEqual([
      "Lean Bulk Score",
      "Training Consistency",
      "Recovery Score",
      "Volume Score",
    ]);
    expect(scores[0].description).toBe("Excellent");
  });

  it("uses the cut label and a null-safe description on a cut without data", () => {
    const scores = getAnalyticsScores({
      pace: { ...onTrackPace, status: "insufficient_data" },
      goal: "cut",
      adherence,
      muscleRecovery: [],
      setTargets: [],
    });

    expect(scores[0].label).toBe("Cut Score");
    expect(scores[0].value).toBeNull();
    expect(scores[0].description).toBe("Not enough data");
    expect(scores[3].value).toBeNull();
  });
});
