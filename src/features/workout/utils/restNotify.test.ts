import { describe, expect, it } from "vitest";

import { adjustRest } from "./restNotify";

describe("adjustRest", () => {
  it("adds time", () => {
    expect(adjustRest(60, 15)).toBe(75);
  });

  it("subtracts time", () => {
    expect(adjustRest(60, -15)).toBe(45);
  });

  it("never goes below zero", () => {
    expect(adjustRest(10, -15)).toBe(0);
    expect(adjustRest(0, -15)).toBe(0);
  });
});
