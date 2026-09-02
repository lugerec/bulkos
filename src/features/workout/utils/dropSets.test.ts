import { describe, expect, it } from "vitest";

import {
  DEFAULT_DROP_PERCENT,
  suggestDropWeight,
  skipsFullRest,
} from "./dropSets";

describe("suggestDropWeight", () => {
  it("reduces by the default 20% and rounds to the nearest 2.5", () => {
    expect(suggestDropWeight(100)).toBe(80);
    expect(suggestDropWeight(60)).toBe(47.5); // 48 -> rounds to 47.5
  });

  it("accepts a custom drop percent", () => {
    expect(suggestDropWeight(100, 0.5)).toBe(50);
    expect(suggestDropWeight(100, DEFAULT_DROP_PERCENT)).toBe(80);
  });

  it("never goes below zero", () => {
    expect(suggestDropWeight(0)).toBe(0);
    expect(suggestDropWeight(-10)).toBe(0);
  });

  it("rounds a small weight sensibly", () => {
    expect(suggestDropWeight(10)).toBe(7.5); // 8 -> rounds to 7.5
  });
});

describe("skipsFullRest", () => {
  it("skips the full rest when the next set is a drop set", () => {
    const sets = [{ isDropSet: false }, { isDropSet: true }];
    expect(skipsFullRest(sets, 0)).toBe(true);
  });

  it("does not skip when the next set is a normal set", () => {
    const sets = [{ isDropSet: false }, { isDropSet: false }];
    expect(skipsFullRest(sets, 0)).toBe(false);
  });

  it("does not skip for the last set", () => {
    const sets = [{ isDropSet: false }];
    expect(skipsFullRest(sets, 0)).toBe(false);
  });
});
