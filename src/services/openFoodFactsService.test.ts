import { afterEach, describe, expect, it, vi } from "vitest";

import { lookupOffBarcode, mapOffProductToFoodItem } from "./openFoodFactsService";

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

describe("lookupOffBarcode", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const okProduct = {
    status: 1,
    product: {
      code: "5900000000000",
      product_name: "Skyr Natural",
      brands: "MilkCo",
      nutriments: {
        "energy-kcal_100g": 63,
        proteins_100g: 10.5,
        carbohydrates_100g: 4,
        fat_100g: 0.2,
      },
    },
  };

  function mockFetch(response: unknown, ok = true) {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok,
        json: async () => response,
      }))
    );
  }

  it("maps a found product to a FoodItem", async () => {
    mockFetch(okProduct);

    const item = await lookupOffBarcode("5900000000000");

    expect(item?.id).toBe("off-5900000000000");
    expect(item?.calories).toBe(63);
    expect(item?.protein).toBe(10.5);
  });

  it("returns null for an unknown barcode (status 0)", async () => {
    mockFetch({ status: 0 });

    expect(await lookupOffBarcode("0000000000000")).toBe(null);
  });

  it("returns null on a non-ok response", async () => {
    mockFetch({}, false);

    expect(await lookupOffBarcode("5900000000000")).toBe(null);
  });

  it("returns null on a network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      })
    );

    expect(await lookupOffBarcode("5900000000000")).toBe(null);
  });

  it("returns null for a blank barcode without fetching", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    expect(await lookupOffBarcode("   ")).toBe(null);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("mapOffProductToFoodItem serving size", () => {
  const base = {
    code: "1",
    product_name: "Bar",
    nutriments: { "energy-kcal_100g": 400, proteins_100g: 20 },
  };

  it("prefills defaultServing from serving_quantity", () => {
    const item = mapOffProductToFoodItem({ ...base, serving_quantity: 30 });
    expect(item?.defaultServing).toBe(30);
  });

  it("parses a string serving_quantity", () => {
    const item = mapOffProductToFoodItem({ ...base, serving_quantity: "45" });
    expect(item?.defaultServing).toBe(45);
  });

  it("omits defaultServing when serving_quantity is missing or invalid", () => {
    expect(mapOffProductToFoodItem(base)).not.toHaveProperty("defaultServing");
    expect(
      mapOffProductToFoodItem({ ...base, serving_quantity: 0 })
    ).not.toHaveProperty("defaultServing");
  });
});
