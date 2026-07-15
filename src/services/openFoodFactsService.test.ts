import { describe, expect, it } from "vitest";

import { mapOffProductToFoodItem } from "./openFoodFactsService";

describe("mapOffProductToFoodItem", () => {
  const product = {
    code: "5900000000000",
    product_name: "Skyr Natural",
    brands: "MilkCo, OtherBrand",
    nutriments: {
      "energy-kcal_100g": 63.4,
      proteins_100g: 10.56,
      carbohydrates_100g: 4.02,
      fat_100g: 0.2,
    },
  };

  it("maps a complete product to a per-100g FoodItem", () => {
    const item = mapOffProductToFoodItem(product);

    expect(item).toEqual({
      id: "off-5900000000000",
      name: "Skyr Natural (MilkCo)",
      category: "other",
      calories: 63,
      protein: 10.6,
      carbs: 4,
      fat: 0.2,
      serving: 100,
      unit: "g",
      verified: false,
    });
  });

  it("does not duplicate the brand when the name already contains it", () => {
    const item = mapOffProductToFoodItem({
      ...product,
      product_name: "MilkCo Skyr Natural",
    });

    expect(item?.name).toBe("MilkCo Skyr Natural");
  });

  it("returns null without a name, barcode, or calories", () => {
    expect(mapOffProductToFoodItem({ ...product, product_name: "" })).toBe(
      null
    );
    expect(mapOffProductToFoodItem({ ...product, code: undefined })).toBe(
      null
    );
    expect(
      mapOffProductToFoodItem({ ...product, nutriments: {} })
    ).toBe(null);
  });

  it("defaults missing macros to zero", () => {
    const item = mapOffProductToFoodItem({
      code: "123",
      product_name: "Mystery Snack",
      nutriments: { "energy-kcal_100g": 200 },
    });

    expect(item?.protein).toBe(0);
    expect(item?.carbs).toBe(0);
    expect(item?.fat).toBe(0);
  });
});
