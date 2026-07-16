import { describe, expect, it } from "vitest";

import { getTodayKey, toDateKey } from "./date";

describe("toDateKey", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(toDateKey(new Date(2026, 6, 16))).toBe("2026-07-16");
  });

  it("zero-pads month and day", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("uses local calendar fields, not UTC", () => {
    // Local midnight — toISOString() would roll this back a day in any
    // positive-offset zone; the local key must stay on the 16th.
    const localMidnight = new Date(2026, 6, 16, 0, 0, 0);

    expect(toDateKey(localMidnight)).toBe("2026-07-16");
    expect(toDateKey(localMidnight)).toBe(
      `${localMidnight.getFullYear()}-07-16`
    );
  });

  it("keeps late-evening times on the same local day", () => {
    const lateNight = new Date(2026, 6, 16, 23, 30, 0);

    expect(toDateKey(lateNight)).toBe("2026-07-16");
  });
});

describe("getTodayKey", () => {
  it("returns the key for a supplied date", () => {
    expect(getTodayKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("matches toDateKey for the current moment", () => {
    const now = new Date();

    expect(getTodayKey(now)).toBe(toDateKey(now));
  });
});
