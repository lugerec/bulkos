import type { FoodItem } from "@/types/food";

/**
 * Minimal shape of an Open Food Facts product — only the fields we read.
 * https://world.openfoodfacts.org/ (community database, no API key)
 */
export type OffProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
};

type OffSearchResponse = {
  products?: OffProduct[];
};

const SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";
const PRODUCT_URL = "https://world.openfoodfacts.org/api/v2/product";
const PAGE_SIZE = 15;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Map an OFF product to the app's FoodItem (per 100 g). Returns null when
 * the product is unusable: no name, no barcode, or missing calories.
 */
export function mapOffProductToFoodItem(
  product: OffProduct
): FoodItem | null {
  const name = product.product_name?.trim();
  const code = product.code?.trim();
  const kcal = product.nutriments?.["energy-kcal_100g"];

  if (!name || !code || typeof kcal !== "number" || kcal < 0) return null;

  const brand = product.brands?.split(",")[0]?.trim();

  return {
    id: `off-${code}`,
    name: brand && !name.includes(brand) ? `${name} (${brand})` : name,
    category: "other",
    calories: Math.round(kcal),
    protein: round1(product.nutriments?.proteins_100g ?? 0),
    carbs: round1(product.nutriments?.carbohydrates_100g ?? 0),
    fat: round1(product.nutriments?.fat_100g ?? 0),
    serving: 100,
    unit: "g",
    verified: false,
  };
}

/**
 * Text search against Open Food Facts, mapped to FoodItems. Failures and
 * unusable products degrade to an empty list — the local database keeps
 * working regardless.
 */
export async function searchOpenFoodFacts(
  query: string
): Promise<FoodItem[]> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: String(PAGE_SIZE),
    fields: "code,product_name,brands,nutriments",
  });

  try {
    const response = await fetch(`${SEARCH_URL}?${params.toString()}`);

    if (!response.ok) return [];

    const data: OffSearchResponse = await response.json();

    const q = query.trim().toLowerCase();

    return (data.products ?? [])
      .map(mapOffProductToFoodItem)
      .filter((item): item is FoodItem => item !== null)
      // OFF's own ranking is loose ("chick" → hummus); prefer names that
      // actually start with or contain the query, then shorter names.
      .sort((a, b) => {
        const an = a.name.toLowerCase();
        const bn = b.name.toLowerCase();

        const score = (n: string) =>
          n.startsWith(q) ? 0 : n.includes(q) ? 1 : 2;

        return score(an) - score(bn) || an.length - bn.length;
      })
      .slice(0, 8);
  } catch {
    return [];
  }
}

type OffProductResponse = {
  status?: number;
  product?: OffProduct;
};

/**
 * Look up a single Open Food Facts product by barcode (EAN/UPC), mapped to a
 * FoodItem. Returns null when the product is unknown, incomplete, or the
 * request fails — the caller decides how to surface "not found".
 */
export async function lookupOffBarcode(
  barcode: string
): Promise<FoodItem | null> {
  const code = barcode.trim();
  if (!code) return null;

  const params = new URLSearchParams({
    fields: "code,product_name,brands,nutriments",
  });

  try {
    const response = await fetch(
      `${PRODUCT_URL}/${encodeURIComponent(code)}.json?${params.toString()}`
    );

    if (!response.ok) return null;

    const data: OffProductResponse = await response.json();

    // OFF returns status 0 with no product for unknown barcodes.
    if (data.status !== 1 || !data.product) return null;

    return mapOffProductToFoodItem(data.product);
  } catch {
    return null;
  }
}
