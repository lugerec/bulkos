import { describe, expect, it } from "vitest";

import { foldForSearch, matchesSearch } from "./text";

describe("foldForSearch", () => {
  it("lowercases and strips Slovak diacritics", () => {
    expect(foldForSearch("Šošovica")).toBe("sosovica");
    expect(foldForSearch("Bryndzové halušky")).toBe("bryndzove halusky");
    expect(foldForSearch("Kurací rezeň")).toBe("kuraci rezen");
    expect(foldForSearch("Zemiaková kaša")).toBe("zemiakova kasa");
  });

  it("trims surrounding whitespace", () => {
    expect(foldForSearch("  Med  ")).toBe("med");
  });
});

describe("matchesSearch", () => {
  it("matches when the query omits diacritics", () => {
    expect(matchesSearch("Šošovica (lentils, cooked)", "sosovica")).toBe(true);
    expect(matchesSearch("Tvaroh polotučný (quark)", "polotucny")).toBe(true);
  });

  it("matches when the name omits diacritics but the query has them", () => {
    expect(matchesSearch("Kuraci rezen", "kurací")).toBe(true);
  });

  it("still matches the English hint", () => {
    expect(matchesSearch("Bryndza (sheep cheese)", "sheep")).toBe(true);
  });

  it("returns false for a genuine miss", () => {
    expect(matchesSearch("Bryndza (sheep cheese)", "banana")).toBe(false);
  });

  it("treats an empty query as matching everything", () => {
    expect(matchesSearch("anything", "   ")).toBe(true);
  });
});
