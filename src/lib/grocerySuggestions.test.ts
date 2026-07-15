import { describe, expect, it } from "vitest";

import { buildGrocerySuggestions } from "./grocerySuggestions";

describe("buildGrocerySuggestions", () => {
  it("orders suggestions by how often the food was logged", () => {
    const suggestions = buildGrocerySuggestions(
      [
        { name: "Rice", count: 2 },
        { name: "Chicken Breast", count: 5 },
        { name: "Skyr", count: 3 },
      ],
      []
    );

    expect(suggestions).toEqual(["Chicken Breast", "Skyr", "Rice"]);
  });

  it("excludes items already on the list, case-insensitively", () => {
    const suggestions = buildGrocerySuggestions(
      [
        { name: "Chicken Breast", count: 5 },
        { name: "Skyr", count: 3 },
      ],
      ["chicken breast"]
    );

    expect(suggestions).toEqual(["Skyr"]);
  });

  it("dedupes foods differing only by case or whitespace", () => {
    const suggestions = buildGrocerySuggestions(
      [
        { name: "Skyr", count: 2 },
        { name: " skyr ", count: 1 },
      ],
      []
    );

    expect(suggestions).toEqual(["Skyr"]);
  });

  it("caps at 8 suggestions", () => {
    const many = Array.from({ length: 12 }, (_, index) => ({
      name: `Food ${index}`,
      count: 12 - index,
    }));

    expect(buildGrocerySuggestions(many, [])).toHaveLength(8);
  });

  it("skips empty names", () => {
    expect(
      buildGrocerySuggestions([{ name: "  ", count: 3 }], [])
    ).toHaveLength(0);
  });
});
