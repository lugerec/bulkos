import { describe, expect, it } from "vitest";

import { getRestSeconds } from "./restTime";

describe("getRestSeconds", () => {
  it("prefers an explicit defaultRestSeconds over any heuristic", () => {
    expect(
      getRestSeconds({ category: "isolation", name: "Bicep Curl" }, 200)
    ).toBe(200);
  });

  it("ignores a non-positive explicit rest and falls back to context", () => {
    expect(
      getRestSeconds({ equipment: "barbell", category: "compound" }, 0)
    ).toBe(180);
  });

  it("rests longest for barbell compounds", () => {
    expect(
      getRestSeconds({ equipment: "barbell", category: "compound" })
    ).toBe(180);
    expect(
      getRestSeconds({ equipment: "smithMachine", category: "compound" })
    ).toBe(180);
  });

  it("rests a bit less for dumbbell/machine compounds", () => {
    expect(
      getRestSeconds({ equipment: "dumbbell", category: "compound" })
    ).toBe(150);
    expect(
      getRestSeconds({ equipment: "machine", category: "compound" })
    ).toBe(150);
  });

  it("rests short for isolation work regardless of equipment", () => {
    expect(
      getRestSeconds({ equipment: "cable", category: "isolation" })
    ).toBe(75);
    expect(
      getRestSeconds({ equipment: "dumbbell", category: "isolation" })
    ).toBe(75);
  });

  it("falls back to the name heuristic without category info", () => {
    expect(getRestSeconds({ name: "Conventional Deadlift" })).toBe(240);
    expect(getRestSeconds({ name: "Barbell Row" })).toBe(150);
    expect(getRestSeconds({ name: "Triceps Pushdown" })).toBe(90);
    expect(getRestSeconds({ name: "Lateral Raise" })).toBe(60);
  });

  it("defaults to 90s when nothing matches", () => {
    expect(getRestSeconds({})).toBe(90);
    expect(getRestSeconds({ name: "Mystery Movement" })).toBe(90);
  });
});
