import { describe, expect, it } from "vitest";

import {
  DEFAULT_LEVEL,
  getFeatureFlags,
  getLevelConfig,
} from "./experienceLevel";

describe("experience level config", () => {
  it("hides all optional sections for beginners", () => {
    const flags = getFeatureFlags("beginner");

    expect(flags.charts).toBe(false);
    expect(flags.analytics).toBe(false);
    expect(flags.advancedDashboard).toBe(false);
    expect(flags.effortRating).toBe(false);
  });

  it("gives intermediates charts but not deep analytics", () => {
    const flags = getFeatureFlags("intermediate");

    expect(flags.charts).toBe(true);
    expect(flags.analytics).toBe(false);
  });

  it("unlocks everything for advanced", () => {
    const flags = getFeatureFlags("advanced");

    expect(flags.charts).toBe(true);
    expect(flags.analytics).toBe(true);
    expect(flags.advancedDashboard).toBe(true);
    expect(flags.effortRating).toBe(true);
  });

  it("falls back to the default level for undefined (legacy profiles)", () => {
    expect(getFeatureFlags(undefined)).toEqual(getFeatureFlags(DEFAULT_LEVEL));
  });

  it("scales training bias up with level", () => {
    expect(getLevelConfig("beginner").training.setBias).toBeLessThan(
      getLevelConfig("advanced").training.setBias
    );
    // Beginners leave more reps in reserve.
    expect(getLevelConfig("beginner").training.rirFloor).toBeGreaterThan(
      getLevelConfig("advanced").training.rirFloor
    );
  });
});
