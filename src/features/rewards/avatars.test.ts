import { describe, expect, it } from "vitest";

import {
  AVATARS,
  DEFAULT_AVATAR,
  avatarsUnlockedBetween,
  findAvatar,
  isAvatarUnlocked,
  nextAvatar,
  unlockedAvatars,
} from "./avatars";

describe("AVATARS", () => {
  it("has unique ids", () => {
    const ids = AVATARS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("is ordered by unlock level, starting at level 1", () => {
    expect(AVATARS[0].unlocksAtLevel).toBe(1);

    const levels = AVATARS.map((a) => a.unlocksAtLevel);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
  });

  it("uses valid hex colours", () => {
    for (const avatar of AVATARS) {
      expect(avatar.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("unlockedAvatars", () => {
  it("gives a new user exactly one avatar", () => {
    const unlocked = unlockedAvatars(1);
    expect(unlocked).toHaveLength(1);
    expect(unlocked[0].id).toBe(DEFAULT_AVATAR.id);
  });

  it("unlocks more as the level rises", () => {
    expect(unlockedAvatars(5).length).toBeGreaterThan(unlockedAvatars(3).length);
    expect(unlockedAvatars(100)).toHaveLength(AVATARS.length);
  });
});

describe("isAvatarUnlocked", () => {
  it("compares against the required level", () => {
    const crown = findAvatar("crown");
    expect(isAvatarUnlocked(crown, 24)).toBe(false);
    expect(isAvatarUnlocked(crown, 25)).toBe(true);
  });
});

describe("avatarsUnlockedBetween", () => {
  it("reports what a level-up earned", () => {
    // Crossing 2 → 3 earns the level-3 avatar.
    const earned = avatarsUnlockedBetween(2, 3);
    expect(earned.map((a) => a.id)).toEqual(["flame"]);
  });

  it("reports everything crossed in a multi-level jump", () => {
    const earned = avatarsUnlockedBetween(1, 8);
    expect(earned.map((a) => a.id)).toEqual(["flame", "zap", "target"]);
  });

  it("returns nothing when the level didn't rise", () => {
    expect(avatarsUnlockedBetween(5, 5)).toEqual([]);
    expect(avatarsUnlockedBetween(5, 4)).toEqual([]);
  });

  it("returns nothing for a level-up that crosses no threshold", () => {
    // 3 → 4 crosses nothing (next is 5).
    expect(avatarsUnlockedBetween(3, 4)).toEqual([]);
  });
});

describe("nextAvatar", () => {
  it("points at the next one to earn", () => {
    expect(nextAvatar(1)?.id).toBe("flame");
    expect(nextAvatar(3)?.id).toBe("zap");
  });

  it("is null once everything is unlocked", () => {
    expect(nextAvatar(999)).toBeNull();
  });
});

describe("findAvatar", () => {
  it("falls back to the default for unknown ids", () => {
    expect(findAvatar("nope").id).toBe(DEFAULT_AVATAR.id);
    expect(findAvatar(undefined).id).toBe(DEFAULT_AVATAR.id);
  });
});
