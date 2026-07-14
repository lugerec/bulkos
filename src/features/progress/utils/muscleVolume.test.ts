import { describe, expect, it } from "vitest";

import { getEffectiveSetWeight } from "@/features/workout/utils/setVolume";
import { getMuscleVolume } from "./muscleVolume";
import type { WorkoutExercise } from "@/types/workout";

function exercise(
  exerciseId: string,
  name: string,
  sets: Array<{ weight: number; reps: number }>
): WorkoutExercise {
  return {
    id: exerciseId,
    exerciseId,
    name,
    sets: sets.map((set) => ({ ...set, completed: true })),
  };
}

describe("getEffectiveSetWeight", () => {
  it("adds body weight on top of logged weight for bodyweight equipment", () => {
    expect(getEffectiveSetWeight("bodyweight", 0, 80)).toBe(80);
    expect(getEffectiveSetWeight("bodyweight", 10, 80)).toBe(90);
  });

  it("uses only the logged weight for weighted equipment", () => {
    expect(getEffectiveSetWeight("barbell", 100, 80)).toBe(100);
    expect(getEffectiveSetWeight("dumbbell", 30, 80)).toBe(30);
  });

  it("falls back to the logged weight when body weight is unknown or invalid", () => {
    expect(getEffectiveSetWeight("bodyweight", 0)).toBe(0);
    expect(getEffectiveSetWeight("bodyweight", 0, 0)).toBe(0);
    expect(getEffectiveSetWeight(undefined, 50, 80)).toBe(50);
  });
});

describe("getMuscleVolume with body weight", () => {
  it("counts bodyweight exercises once a body weight is provided", () => {
    // pull-up is bodyweight equipment; with 0 kg logged it contributes
    // nothing without a body weight, and full volume with one.
    const workouts = [
      {
        exercises: [
          exercise("pull-up", "Pull-up", [
            { weight: 0, reps: 10 },
            { weight: 0, reps: 10 },
          ]),
        ],
      },
    ];

    const withoutBodyweight = getMuscleVolume(workouts);
    const withBodyweight = getMuscleVolume(workouts, 80);

    expect(withoutBodyweight).toHaveLength(0);

    const back = withBodyweight.find((item) => item.muscle === "back");
    // 2 sets × 10 reps × 80 kg × 100% back activation
    expect(back?.volume).toBe(1600);
  });

  it("does not change volume for barbell exercises", () => {
    const workouts = [
      {
        exercises: [
          exercise("bench-press", "Bench Press", [{ weight: 100, reps: 10 }]),
        ],
      },
    ];

    const withoutBodyweight = getMuscleVolume(workouts);
    const withBodyweight = getMuscleVolume(workouts, 80);

    expect(withBodyweight).toEqual(withoutBodyweight);
  });

  it("treats logged weight on bodyweight exercises as added load", () => {
    const workouts = [
      {
        exercises: [
          exercise("pull-up", "Pull-up", [{ weight: 20, reps: 5 }]),
        ],
      },
    ];

    const back = getMuscleVolume(workouts, 80).find(
      (item) => item.muscle === "back"
    );

    // (80 body + 20 added) × 5 reps × 100% back activation
    expect(back?.volume).toBe(500);
  });
});
