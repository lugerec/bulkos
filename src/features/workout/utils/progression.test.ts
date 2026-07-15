import { describe, expect, it } from "vitest";

import { getProgressionSuggestion } from "./progression";
import type { ExerciseDefinition, WorkoutSet } from "@/types/workout";

const bench: ExerciseDefinition = {
  id: "bench-press",
  name: "Bench Press",
  primaryMuscle: "chest",
  equipment: "barbell",
  category: "compound",
  defaultRestSeconds: 120,
  defaultSets: 4,
  defaultReps: 8,
  progression: { minReps: 6, maxReps: 10, weightStep: 2.5 },
};

/** Exercise without an explicit progression block (uses the fallback). */
const curl: ExerciseDefinition = {
  id: "db-curl",
  name: "Dumbbell Curl",
  primaryMuscle: "biceps",
  equipment: "dumbbell",
  category: "isolation",
  defaultRestSeconds: 60,
  defaultSets: 3,
  defaultReps: 12,
};

function set(weight: number, reps: number, completed = true): WorkoutSet {
  return { weight, reps, completed };
}

describe("getProgressionSuggestion", () => {
  it("returns null with no previous sets", () => {
    expect(getProgressionSuggestion(bench, [])).toBeNull();
  });

  it("returns null when no previous set was completed", () => {
    expect(
      getProgressionSuggestion(bench, [set(100, 8, false)])
    ).toBeNull();
  });

  it("adds a rep when below the max rep target", () => {
    const suggestion = getProgressionSuggestion(bench, [set(100, 8)]);

    expect(suggestion).toEqual({
      weight: 100,
      reps: 9,
      reason: "increase_reps",
    });
  });

  it("bumps weight and resets to min reps once max reps is reached", () => {
    const suggestion = getProgressionSuggestion(bench, [set(100, 10)]);

    expect(suggestion).toEqual({
      weight: 102.5,
      reps: 6,
      reason: "increase_weight",
    });
  });

  it("progresses from the best set by estimated 1RM, not the last set", () => {
    // The heavier top set (100×10) drives progression over a lighter backoff.
    const suggestion = getProgressionSuggestion(bench, [
      set(100, 10),
      set(80, 10),
    ]);

    expect(suggestion?.weight).toBe(102.5);
    expect(suggestion?.reason).toBe("increase_weight");
  });

  it("ignores incomplete sets when picking the best", () => {
    const suggestion = getProgressionSuggestion(bench, [
      set(120, 10, false),
      set(100, 8, true),
    ]);

    expect(suggestion).toEqual({
      weight: 100,
      reps: 9,
      reason: "increase_reps",
    });
  });

  it("falls back to defaultReps..+2 and a 2.5 step without a progression block", () => {
    // curl defaultReps 12 -> fallback maxReps 14, step 2.5
    const addRep = getProgressionSuggestion(curl, [set(20, 12)]);
    expect(addRep).toEqual({ weight: 20, reps: 13, reason: "increase_reps" });

    const addWeight = getProgressionSuggestion(curl, [set(20, 14)]);
    expect(addWeight).toEqual({
      weight: 22.5,
      reps: 12,
      reason: "increase_weight",
    });
  });

  it("repeats the same load when the best set was just under min reps", () => {
    // bench minReps 6: 5 reps is one short -> repeat, aim for 6
    const suggestion = getProgressionSuggestion(bench, [set(100, 5)]);

    expect(suggestion).toEqual({
      weight: 100,
      reps: 6,
      reason: "maintain",
    });
  });

  it("backs the weight off when the best set fell well short of min reps", () => {
    // bench minReps 6: 4 reps is 2+ under -> deload one step
    const suggestion = getProgressionSuggestion(bench, [set(100, 4)]);

    expect(suggestion).toEqual({
      weight: 97.5,
      reps: 6,
      reason: "deload",
    });
  });

  it("does not deload below a single weight step (bodyweight/very light)", () => {
    // weight (2) not greater than the step (2.5): repeat instead of going negative
    const suggestion = getProgressionSuggestion(bench, [set(2, 3)]);

    expect(suggestion?.reason).toBe("maintain");
    expect(suggestion?.weight).toBe(2);
  });
});
