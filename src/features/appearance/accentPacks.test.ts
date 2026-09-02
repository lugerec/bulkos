import { describe, expect, it } from "vitest";

import {
  ACCENT_PACKS,
  DEFAULT_ACCENT_PACK,
  availablePacks,
  findAccentPack,
} from "./accentPacks";

describe("ACCENT_PACKS", () => {
  it("has unique ids", () => {
    const ids = ACCENT_PACKS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ships exactly one free pack as the default", () => {
    const free = ACCENT_PACKS.filter((p) => p.free);
    expect(free).toHaveLength(1);
    expect(DEFAULT_ACCENT_PACK.free).toBe(true);
    expect(DEFAULT_ACCENT_PACK.id).toBe("volt");
  });

  it("uses valid hex colours and rgb triplets", () => {
    for (const pack of ACCENT_PACKS) {
      expect(pack.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(pack.accent2).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(pack.inkDark).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(pack.inkLight).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(pack.rgb).toHaveLength(3);
      for (const channel of pack.rgb) {
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(255);
      }
    }
  });

  it("keeps the rgb triplet in sync with the accent hex", () => {
    for (const pack of ACCENT_PACKS) {
      const [r, g, b] = pack.rgb;
      const hex = `#${[r, g, b]
        .map((c) => c.toString(16).padStart(2, "0"))
        .join("")}`;
      expect(hex.toLowerCase()).toBe(pack.accent.toLowerCase());
    }
  });
});

describe("findAccentPack", () => {
  it("finds a pack by id", () => {
    expect(findAccentPack("ember").name).toBe("Ember");
  });

  it("falls back to the default for unknown or missing ids", () => {
    expect(findAccentPack("nope").id).toBe(DEFAULT_ACCENT_PACK.id);
    expect(findAccentPack(undefined).id).toBe(DEFAULT_ACCENT_PACK.id);
  });
});

describe("availablePacks", () => {
  it("offers only free packs without the unlock", () => {
    const packs = availablePacks(false);
    expect(packs).toHaveLength(1);
    expect(packs[0].free).toBe(true);
  });

  it("offers everything once unlocked", () => {
    expect(availablePacks(true)).toHaveLength(ACCENT_PACKS.length);
  });
});
