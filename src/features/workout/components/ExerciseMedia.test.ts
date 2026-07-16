import { describe, expect, it } from "vitest";

import { collectSources, canAnimate } from "./ExerciseMedia";

describe("collectSources", () => {
  it("returns nothing without media", () => {
    expect(collectSources(undefined)).toEqual([]);
    expect(collectSources({})).toEqual([]);
  });

  it("prefers a gif and lists it first", () => {
    const sources = collectSources({
      gif: "/x/motion.gif",
      start: "/x/start.webp",
    });

    expect(sources[0]).toEqual({
      kind: "gif",
      src: "/x/motion.gif",
      label: "Motion",
    });
  });

  it("includes start and finish stills when present", () => {
    const sources = collectSources({
      start: "/x/start.webp",
      finish: "/x/finish.webp",
    });

    expect(sources.map((s) => s.label)).toEqual(["Start", "Finish"]);
    expect(sources.every((s) => s.kind === "image")).toBe(true);
  });

  it("falls back to the thumbnail only when there are no other sources", () => {
    expect(collectSources({ thumbnail: "/x/thumb.webp" })).toEqual([
      { kind: "image", src: "/x/thumb.webp", label: "Preview" },
    ]);

    // thumbnail ignored once a better source exists
    const withStart = collectSources({
      thumbnail: "/x/thumb.webp",
      start: "/x/start.webp",
    });

    expect(withStart.map((s) => s.label)).toEqual(["Start"]);
  });
});

describe("canAnimate", () => {
  it("is true with both start and finish stills", () => {
    const sources = collectSources({
      start: "/x/start.png",
      finish: "/x/finish.png",
    });

    expect(canAnimate(sources)).toBe(true);
  });

  it("is false with only a start still", () => {
    expect(canAnimate(collectSources({ start: "/x/start.png" }))).toBe(false);
  });

  it("is false when a real gif is present (it animates itself)", () => {
    const sources = collectSources({
      gif: "/x/motion.gif",
      start: "/x/start.png",
      finish: "/x/finish.png",
    });

    expect(canAnimate(sources)).toBe(false);
  });

  it("is false with no media", () => {
    expect(canAnimate(collectSources(undefined))).toBe(false);
  });
});
