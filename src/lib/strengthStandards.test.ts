import { describe, expect, it } from "vitest";

import {
  estimateOneRepMax,
  getStrengthStandard,
} from "./strengthStandards";

describe("estimateOneRepMax", () => {
  it("applies the Epley formula", () => {
    // 100 × (1 + 10/30) = 133.33
    expect(estimateOneRepMax(100, 10)).toBeCloseTo(133.33, 1);
  });

  it("returns the weight itself for a single rep", () => {
    expect(estimateOneRepMax(120, 1)).toBeCloseTo(124, 0);
  });

  it("returns 0 for invalid inputs", () => {
    expect(estimateOneRepMax(0, 10)).toBe(0);
    expect(estimateOneRepMax(100, 0)).toBe(0);
  });
});

describe("getStrengthStandard", () => {
  it("returns null for an exercise without a standard", () => {
    expect(getStrengthStandard("bicep-curl", 100, 80, "male")).toBeNull();
  });

  it("returns null for invalid body weight or 1RM", () => {
    expect(getStrengthStandard("bench-press", 0, 80, "male")).toBeNull();
    expect(getStrengthStandard("bench-press", 100, 0, "male")).toBeNull();
  });

  it("classifies a male bench press by bodyweight ratio", () => {
    // 80kg lifter, 120kg bench -> 1.5× -> advanced (male thresholds 0.75/1.0/1.5/2.0)
    const standard = getStrengthStandard("bench-press", 120, 80, "male");

    expect(standard?.level).toBe("advanced");
    expect(standard?.ratio).toBe(1.5);
    expect(standard?.nextLevel).toBe("elite");
    // elite needs 2.0× -> 160kg
    expect(standard?.nextLevelWeightKg).toBe(160);
  });

  it("classifies the same lift differently for female standards", () => {
    // 60kg lifter, 60kg bench -> 1.0× -> advanced for female (0.5/0.7/1.0/1.4)
    const standard = getStrengthStandard("bench-press", 60, 60, "female");

    expect(standard?.level).toBe("advanced");
    expect(standard?.nextLevelWeightKg).toBe(Math.round(1.4 * 60));
  });

  it("reports beginner below the first threshold with novice as next", () => {
    // 80kg lifter, 40kg bench -> 0.5× -> below 0.75 -> beginner
    const standard = getStrengthStandard("bench-press", 40, 80, "male");

    expect(standard?.level).toBe("beginner");
    expect(standard?.nextLevel).toBe("novice");
    expect(standard?.nextLevelWeightKg).toBe(Math.round(0.75 * 80));
  });

  it("caps at elite with no next level", () => {
    // 80kg lifter, 220kg deadlift -> 2.75× -> elite (male 1.25/1.5/2.0/2.75)
    const standard = getStrengthStandard("deadlift", 220, 80, "male");

    expect(standard?.level).toBe("elite");
    expect(standard?.nextLevel).toBeNull();
    expect(standard?.nextLevelWeightKg).toBeNull();
  });
});
