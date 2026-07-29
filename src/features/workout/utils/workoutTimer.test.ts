import { describe, expect, it } from "vitest";

import {
  elapsedSeconds,
  pauseTiming,
  resumeTiming,
  type WorkoutTiming,
} from "./workoutTimer";

describe("workoutTimer", () => {
  it("derives elapsed from the clock while running", () => {
    const timing: WorkoutTiming = { startedAt: 1_000, accumulatedMs: 0 };

    expect(elapsedSeconds(timing, 1_000)).toBe(0);
    expect(elapsedSeconds(timing, 6_000)).toBe(5);
    // Keeps counting across a long gap (e.g. app was backgrounded).
    expect(elapsedSeconds(timing, 301_000)).toBe(300);
  });

  it("freezes elapsed while paused", () => {
    const timing: WorkoutTiming = { startedAt: null, accumulatedMs: 42_000 };

    expect(elapsedSeconds(timing, 1_000)).toBe(42);
    expect(elapsedSeconds(timing, 999_000)).toBe(42);
  });

  it("banks time on pause and continues from there on resume", () => {
    let t: WorkoutTiming = { startedAt: 0, accumulatedMs: 0 };

    t = pauseTiming(t, 10_000); // 10s banked
    expect(t.accumulatedMs).toBe(10_000);
    expect(t.startedAt).toBe(null);

    t = resumeTiming(t, 100_000); // resume much later
    expect(elapsedSeconds(t, 105_000)).toBe(15); // 10 banked + 5 running
  });

  it("is a no-op to pause when already paused or resume when running", () => {
    const paused: WorkoutTiming = { startedAt: null, accumulatedMs: 5_000 };
    expect(pauseTiming(paused, 9_999)).toBe(paused);

    const running: WorkoutTiming = { startedAt: 1_000, accumulatedMs: 0 };
    expect(resumeTiming(running, 9_999)).toBe(running);
  });
});
