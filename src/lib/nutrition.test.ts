import { describe, expect, it } from "vitest";

import {
  calculateMacroTargets,
  getRecalibratedTargets,
  shouldSuggestTargetUpdate,
} from "./nutrition";
import type { UserProfile } from "@/types/profile";

const profile: UserProfile = {
  name: "Test",
  age: 28,
  sex: "male",
  height: 180,
  weight: 80,
  goalWeight: 90,
  goal: "bulk",
  activity: "moderate",
  trainingFrequency: 4,
};

describe("shouldSuggestTargetUpdate", () => {
  it("suggests an update once weight drifts 2 kg or more in either direction", () => {
    expect(shouldSuggestTargetUpdate(80, 82)).toBe(true);
    expect(shouldSuggestTargetUpdate(80, 78)).toBe(true);
    expect(shouldSuggestTargetUpdate(80, 86)).toBe(true);
  });

  it("stays quiet for drift under 2 kg", () => {
    expect(shouldSuggestTargetUpdate(80, 80)).toBe(false);
    expect(shouldSuggestTargetUpdate(80, 81.5)).toBe(false);
    expect(shouldSuggestTargetUpdate(80, 78.5)).toBe(false);
  });

  it("never suggests with invalid weights", () => {
    expect(shouldSuggestTargetUpdate(0, 80)).toBe(false);
    expect(shouldSuggestTargetUpdate(80, 0)).toBe(false);
    expect(shouldSuggestTargetUpdate(-5, 80)).toBe(false);
  });
});

describe("getRecalibratedTargets", () => {
  it("matches calculateMacroTargets computed at the new weight", () => {
    const recalibrated = getRecalibratedTargets(profile, 86);
    const direct = calculateMacroTargets({ ...profile, weight: 86 });

    expect(recalibrated).toEqual(direct);
  });

  it("scales protein with body weight (2.1 g/kg)", () => {
    expect(getRecalibratedTargets(profile, 86).protein).toBe(
      Math.round(86 * 2.1)
    );
    expect(getRecalibratedTargets(profile, 80).protein).toBe(
      Math.round(80 * 2.1)
    );
  });

  it("raises calories when weight goes up on a bulk", () => {
    const before = getRecalibratedTargets(profile, 80);
    const after = getRecalibratedTargets(profile, 86);

    expect(after.calories).toBeGreaterThan(before.calories);
  });

  it("does not mutate the source profile", () => {
    getRecalibratedTargets(profile, 90);

    expect(profile.weight).toBe(80);
  });
});
