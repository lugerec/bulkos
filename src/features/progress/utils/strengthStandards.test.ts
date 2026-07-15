import { describe, expect, it } from "vitest";

import {
  getBestOneRepMaxes,
  getStrengthStandards,
} from "./strengthStandards";
import type {
  RecommendationExercise,
  RecommendationWorkout,
} from "@/features/workout/utils/workoutRecommendation";

function exercise(
  exerciseId: string,
  name: string,
  sets: Array<{ weight: number; reps: number; completed?: boolean }>
): RecommendationExercise {
  return {
    id: exerciseId,
    exerciseId,
    name,
    sets: sets.map((set) => ({
      weight: set.weight,
      reps: set.reps,
      completed: set.completed ?? true,
    })),
  };
}

function workout(exercises: RecommendationExercise[]): RecommendationWorkout {
  return {
    id: `w-${Math.random()}`,
    date: "2026-07-10",
    name: "Session",
    volumeKg: 0,
    exercises,
  };
}

describe("getBestOneRepMaxes", () => {
  it("keeps the best est. 1RM per standard lift across sessions", () => {
    const workouts = [
      workout([exercise("bench-press", "Bench Press", [{ weight: 100, reps: 5 }])]),
      workout([exercise("bench-press", "Bench Press", [{ weight: 110, reps: 3 }])]),
    ];

    const best = getBestOneRepMaxes(workouts);

    // 110 × (1 + 3/30) = 121 beats 100 × (1+5/30) = 116.7
    expect(Math.round(best.get("bench-press") ?? 0)).toBe(121);
  });

  it("ignores non-standard lifts and incomplete or empty sets", () => {
    const workouts = [
      workout([
        exercise("bicep-curl", "Curl", [{ weight: 20, reps: 10 }]),
        exercise("squat", "Squat", [
          { weight: 200, reps: 5, completed: false },
          { weight: 0, reps: 5 },
        ]),
      ]),
    ];

    const best = getBestOneRepMaxes(workouts);

    expect(best.has("bicep-curl")).toBe(false);
    expect(best.has("squat")).toBe(false);
  });
});

describe("getStrengthStandards", () => {
  it("returns a standard per trained standard lift", () => {
    const workouts = [
      workout([
        exercise("squat", "Squat", [{ weight: 140, reps: 5 }]),
        exercise("bench-press", "Bench Press", [{ weight: 100, reps: 5 }]),
      ]),
    ];

    const standards = getStrengthStandards(workouts, 80, "male");

    expect(standards.map((s) => s.exerciseId).sort()).toEqual([
      "bench-press",
      "squat",
    ]);
  });

  it("returns nothing when no standard lift has been trained", () => {
    const workouts = [
      workout([exercise("bicep-curl", "Curl", [{ weight: 20, reps: 10 }])]),
    ];

    expect(getStrengthStandards(workouts, 80, "male")).toHaveLength(0);
  });
});
