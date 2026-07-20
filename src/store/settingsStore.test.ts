import { describe, expect, it } from "vitest";

import {
  formatWeight,
  fromDisplayWeight,
  toDisplayWeight,
  weightUnit,
} from "./settingsStore";

describe("weight unit conversion", () => {
  it("leaves metric untouched", () => {
    expect(toDisplayWeight(100, "metric")).toBe(100);
    expect(fromDisplayWeight(100, "metric")).toBe(100);
    expect(weightUnit("metric")).toBe("kg");
  });

  it("converts kg to lb for display", () => {
    // 100 kg ≈ 220.46 lb
    expect(toDisplayWeight(100, "imperial")).toBeCloseTo(220.46, 1);
    expect(weightUnit("imperial")).toBe("lb");
  });

  it("round-trips through kg without drift", () => {
    const kg = 87.5;
    const shown = toDisplayWeight(kg, "imperial");
    expect(fromDisplayWeight(shown, "imperial")).toBeCloseTo(kg, 6);
  });

  it("formats with unit label and sensible rounding", () => {
    expect(formatWeight(100, "metric")).toBe("100 kg");
    expect(formatWeight(100, "imperial")).toBe("220.5 lb");
    expect(formatWeight(60, "imperial")).toBe("132.3 lb");
  });
});
