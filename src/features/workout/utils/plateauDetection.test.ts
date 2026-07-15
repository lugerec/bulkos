import { describe, expect, it } from "vitest";

import { detectPlateaus } from "./plateauDetection";
import type {
  RecommendationExercise,
  RecommendationWorkout,
} from "./workoutRecommendation";

const NOW = new Date("2026-07-14T12:00:00");

function daysAgo(days: number): string {
  const date = new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);

  return date.toISOString().slice(0, 10);
}

function benchSession(
  date: string,
  weight: number,
  reps = 8
): RecommendationWorkout {
  const exercise: RecommendationExercise = {
    id: "bench-press",
    exerciseId: "bench-press",
    name: "Bench Press",
    sets: [{ weight, reps, completed: true }],
  };

  return {
    id: `workout-${date}-${weight}`,
    date,
    name: "Push",
    volumeKg: weight * reps,
    exercises: [exercise],
  };
}

describe("detectPlateaus", () => {
  it("returns nothing with no training history", () => {
    expect(detectPlateaus([], NOW)).toHaveLength(0);
  });

  it("skips exercises with fewer than 4 sessions", () => {
    const workouts = [
      benchSession(daysAgo(20), 100),
      benchSession(daysAgo(10), 100),
      benchSession(daysAgo(3), 100),
    ];

    expect(detectPlateaus(workouts, NOW)).toHaveLength(0);
  });

  it("does not flag a lift that keeps improving", () => {
    const workouts = [
      benchSession(daysAgo(30), 100),
      benchSession(daysAgo(20), 102.5),
      benchSession(daysAgo(10), 105),
      benchSession(daysAgo(3), 107.5),
    ];

    expect(detectPlateaus(workouts, NOW)).toHaveLength(0);
  });

  it("flags a lift with no PR in the last 3 sessions", () => {
    const workouts = [
      benchSession(daysAgo(40), 100),
      benchSession(daysAgo(30), 110),
      benchSession(daysAgo(20), 105),
      benchSession(daysAgo(10), 107.5),
      benchSession(daysAgo(3), 105),
    ];

    const plateaus = detectPlateaus(workouts, NOW);

    expect(plateaus).toHaveLength(1);
    expect(plateaus[0].exerciseId).toBe("bench-press");
    expect(plateaus[0].sessionsSinceBest).toBe(3);
    expect(plateaus[0].bestEst1RM).toBeGreaterThan(
      plateaus[0].recentBestEst1RM
    );
  });

  it("treats matching the old best (no new PR) as a plateau", () => {
    const workouts = [
      benchSession(daysAgo(40), 110),
      benchSession(daysAgo(30), 110),
      benchSession(daysAgo(20), 110),
      benchSession(daysAgo(10), 110),
    ];

    expect(detectPlateaus(workouts, NOW)).toHaveLength(1);
  });

  it("ignores sessions older than 90 days", () => {
    const workouts = [
      benchSession(daysAgo(120), 120),
      benchSession(daysAgo(20), 100),
      benchSession(daysAgo(10), 102.5),
      benchSession(daysAgo(3), 105),
    ];

    // Only 3 sessions inside the window -> below MIN_SESSIONS.
    expect(detectPlateaus(workouts, NOW)).toHaveLength(0);
  });

  it("skips bodyweight sessions logged at 0 kg", () => {
    const workouts = [0, 1, 2, 3].map((week) =>
      benchSession(daysAgo(week * 7 + 1), 0)
    );

    expect(detectPlateaus(workouts, NOW)).toHaveLength(0);
  });

  it("sorts plateaus by sessions since PR, most stuck first", () => {
    const squat = (date: string, weight: number): RecommendationWorkout => ({
      id: `squat-${date}`,
      date,
      name: "Legs",
      volumeKg: weight * 8,
      exercises: [
        {
          id: "squat",
          exerciseId: "squat",
          name: "Squat",
          sets: [{ weight, reps: 8, completed: true }],
        },
      ],
    });

    const workouts = [
      // bench: best in session 1 of 5 -> 4 sessions since PR
      benchSession(daysAgo(50), 110),
      benchSession(daysAgo(40), 105),
      benchSession(daysAgo(30), 105),
      benchSession(daysAgo(20), 105),
      benchSession(daysAgo(10), 105),
      // squat: best in session 2 of 5 -> 3 sessions since PR
      squat(daysAgo(55), 140),
      squat(daysAgo(45), 150),
      squat(daysAgo(35), 145),
      squat(daysAgo(25), 145),
      squat(daysAgo(15), 145),
    ];

    const plateaus = detectPlateaus(workouts, NOW);

    expect(plateaus.map((p) => p.exerciseId)).toEqual([
      "bench-press",
      "squat",
    ]);
  });
});
