import { describe, expect, it } from "vitest";

import { EMPTY_STATS, type UserStats } from "@/types/rewards";
import {
  advanceStreak,
  applyStreakFreeze,
  earnedFreezes,
  canAwardDailyGoal,
  levelFromXp,
  newlyUnlocked,
  unlockedAchievementIds,
  xpToReachLevel,
} from "./gamification";

describe("xpToReachLevel", () => {
  it("starts at 0 for level 1 and grows by +50 per level", () => {
    expect(xpToReachLevel(1)).toBe(0);
    expect(xpToReachLevel(2)).toBe(100);
    expect(xpToReachLevel(3)).toBe(250);
    expect(xpToReachLevel(4)).toBe(450);
    expect(xpToReachLevel(5)).toBe(700);
  });
});

describe("levelFromXp", () => {
  it("maps XP to the right level", () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(249).level).toBe(2);
    expect(levelFromXp(250).level).toBe(3);
  });

  it("reports progress within a level", () => {
    const info = levelFromXp(175); // halfway through level 2 (100→250)
    expect(info.level).toBe(2);
    expect(info.xpIntoLevel).toBe(75);
    expect(info.xpForLevel).toBe(150);
    expect(info.progress).toBeCloseTo(0.5, 5);
    expect(info.nextLevelAtXp).toBe(250);
  });

  it("clamps negative XP", () => {
    expect(levelFromXp(-50).level).toBe(1);
  });
});

describe("advanceStreak", () => {
  it("increments when the last active day was yesterday", () => {
    const r = advanceStreak("2026-08-03", "2026-08-04", 4);
    expect(r.streak).toBe(5);
    expect(r.countsAsNewDay).toBe(true);
  });

  it("does not change when already counted today", () => {
    const r = advanceStreak("2026-08-04", "2026-08-04", 5);
    expect(r.streak).toBe(5);
    expect(r.countsAsNewDay).toBe(false);
  });

  it("resets to 1 after a gap", () => {
    const r = advanceStreak("2026-08-01", "2026-08-04", 9);
    expect(r.streak).toBe(1);
    expect(r.countsAsNewDay).toBe(true);
  });

  it("starts at 1 with no prior activity", () => {
    const r = advanceStreak(undefined, "2026-08-04", 0);
    expect(r.streak).toBe(1);
    expect(r.countsAsNewDay).toBe(true);
  });
});

describe("canAwardDailyGoal", () => {
  it("allows an award on a new day and blocks a repeat", () => {
    expect(canAwardDailyGoal(undefined, "2026-08-05")).toBe(true);
    expect(canAwardDailyGoal("2026-08-04", "2026-08-05")).toBe(true);
    expect(canAwardDailyGoal("2026-08-05", "2026-08-05")).toBe(false);
  });
});

describe("achievements", () => {
  function stats(overrides: Partial<UserStats>): UserStats {
    return {
      ...EMPTY_STATS,
      ...overrides,
      totals: { ...EMPTY_STATS.totals, ...(overrides.totals ?? {}) },
    };
  }

  it("unlocks by workouts, streak, volume and level thresholds", () => {
    const ids = unlockedAchievementIds(
      stats({
        xp: xpToReachLevel(10),
        longestStreak: 30,
        totals: { workouts: 50, volumeKg: 100_000, checkIns: 10 },
      })
    );

    expect(ids).toContain("first-workout");
    expect(ids).toContain("fifty-workouts");
    expect(ids).toContain("streak-30");
    expect(ids).toContain("volume-100k");
    expect(ids).toContain("level-10");
    expect(ids).toContain("check-in-10");
  });

  it("stays locked below thresholds", () => {
    const ids = unlockedAchievementIds(stats({ totals: { workouts: 1, volumeKg: 0, checkIns: 0 } }));
    expect(ids).toContain("first-workout");
    expect(ids).not.toContain("ten-workouts");
    expect(ids).not.toContain("streak-7");
  });

  it("newlyUnlocked excludes already-recorded achievements", () => {
    const s = stats({
      achievements: ["first-workout"],
      totals: { workouts: 10, volumeKg: 0, checkIns: 0 },
    });

    const fresh = newlyUnlocked(s);
    expect(fresh).toContain("ten-workouts");
    expect(fresh).not.toContain("first-workout");
  });
});

describe("streak freezes", () => {
  it("covers a single missed day and spends one freeze", () => {
    // Last active Mon 03rd, today Wed 05th → Tue 04th was missed.
    const r = applyStreakFreeze("2026-08-03", "2026-08-05", 9, 1);

    expect(r.used).toBe(true);
    expect(r.streak).toBe(10);
    expect(r.freezesLeft).toBe(0);
  });

  it("does nothing without a banked freeze", () => {
    const r = applyStreakFreeze("2026-08-03", "2026-08-05", 9, 0);

    expect(r.used).toBe(false);
    expect(r.streak).toBe(9);
  });

  it("does not cover a gap of two or more days", () => {
    // Last active 02nd, today 05th → two missed days.
    const r = applyStreakFreeze("2026-08-02", "2026-08-05", 9, 3);

    expect(r.used).toBe(false);
    expect(r.streak).toBe(9);
    expect(r.freezesLeft).toBe(3);
  });

  it("does nothing when yesterday was already active", () => {
    const r = applyStreakFreeze("2026-08-04", "2026-08-05", 9, 1);

    expect(r.used).toBe(false);
  });

  it("earns a freeze every 7 days, capped by tier", () => {
    expect(earnedFreezes(7, 0, false)).toBe(1);
    expect(earnedFreezes(14, 1, false)).toBe(1); // free cap reached
    expect(earnedFreezes(14, 1, true)).toBe(2); // pro allows more
    expect(earnedFreezes(21, 2, true)).toBe(3);
    expect(earnedFreezes(28, 3, true)).toBe(3); // pro cap reached
  });

  it("earns nothing on a non-milestone day", () => {
    expect(earnedFreezes(5, 0, false)).toBe(0);
    expect(earnedFreezes(0, 0, true)).toBe(0);
  });
});
