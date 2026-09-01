import { describe, expect, it } from "vitest";

import { getWeekDays } from "./weeklyChallenge";

describe("getWeekDays", () => {
  // Wednesday 2026-08-05 (that week's Monday is 2026-08-03).
  const now = new Date(2026, 7, 5, 12, 0, 0);

  it("returns seven Monday-first days", () => {
    const days = getWeekDays([], now);
    expect(days).toHaveLength(7);
    expect(days[0].key).toBe("2026-08-03");
    expect(days[6].key).toBe("2026-08-09");
    expect(days.map((d) => d.label)).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
  });

  it("flags trained days, today and future days", () => {
    const days = getWeekDays(["2026-08-03", "2026-08-05"], now);

    expect(days[0].trained).toBe(true); // Mon
    expect(days[2].trained).toBe(true); // Wed (today)
    expect(days[2].isToday).toBe(true);
    expect(days[1].trained).toBe(false);

    expect(days[3].isFuture).toBe(true); // Thu
    expect(days[2].isFuture).toBe(false); // today isn't future
  });

  it("ignores dates outside the current week", () => {
    const days = getWeekDays(["2026-07-30"], now);
    expect(days.every((d) => !d.trained)).toBe(true);
  });
});
