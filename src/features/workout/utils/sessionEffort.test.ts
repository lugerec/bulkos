import { describe, expect, it } from "vitest";

import { getSessionEffort } from "./sessionEffort";
import type { SetEffort } from "@/types/workout";

function set(completed: boolean, effort?: SetEffort) {
  return { completed, effort };
}

describe("getSessionEffort", () => {
  it("reports nothing when no sets are rated", () => {
    const result = getSessionEffort([
      { sets: [set(true), set(true)] },
    ]);

    expect(result.rated).toBe(0);
    expect(result.overall).toBeNull();
  });

  it("counts only completed, rated sets", () => {
    const result = getSessionEffort([
      {
        sets: [
          set(true, "hard"),
          set(false, "easy"), // not completed — ignored
          set(true, "moderate"),
          set(true), // no rating — ignored
        ],
      },
    ]);

    expect(result.rated).toBe(2);
    expect(result.counts).toEqual({ easy: 0, moderate: 1, hard: 1 });
  });

  it("picks the most frequent rating as overall", () => {
    const result = getSessionEffort([
      {
        sets: [
          set(true, "easy"),
          set(true, "easy"),
          set(true, "moderate"),
        ],
      },
    ]);

    expect(result.overall).toBe("easy");
  });

  it("breaks ties toward the harder rating", () => {
    // one easy, one hard — tie should resolve to hard
    const result = getSessionEffort([
      { sets: [set(true, "easy"), set(true, "hard")] },
    ]);

    expect(result.overall).toBe("hard");
  });

  it("aggregates across multiple exercises", () => {
    const result = getSessionEffort([
      { sets: [set(true, "hard"), set(true, "hard")] },
      { sets: [set(true, "moderate")] },
    ]);

    expect(result.rated).toBe(3);
    expect(result.overall).toBe("hard");
  });
});
