import type { FoodItem } from "@/types/food";

/**
 * Slovak and Central European staples, per 100 g (or 100 ml for liquids).
 *
 * Open Food Facts covers packaged goods reasonably well but is thin on local
 * dairy, bakery and home-cooked dishes — exactly what gets eaten daily here.
 * Names carry both the Slovak term and an English hint so search works either
 * way ("bryndza" and "sheep cheese" both hit).
 *
 * Values are typical reference figures for the common supermarket version;
 * fat content of dairy and meat varies by producer, so treat them as a solid
 * default rather than a lab measurement.
 */
function food(
  id: string,
  name: string,
  category: FoodItem["category"],
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  unit: FoodItem["unit"] = "g"
): FoodItem {
  return {
    id: `sk-${id}`,
    name,
    category,
    calories,
    protein,
    carbs,
    fat,
    serving: 100,
    unit,
    verified: true,
  };
}

/** A naturally-countable food (1 rožok, 1 tyčinka...) — macros per piece. */
function piece(
  id: string,
  name: string,
  category: FoodItem["category"],
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  unitLabel: string
): FoodItem {
  return {
    id: `sk-${id}`,
    name,
    category,
    calories,
    protein,
    carbs,
    fat,
    serving: 1,
    unit: "piece",
    unitLabel,
    verified: true,
  };
}

export const SLOVAK_FOODS: FoodItem[] = [
  // Dairy — the local staples OFF handles worst
  food("bryndza", "Bryndza (sheep cheese)", "protein", 230, 15, 2, 18),
  food("tvaroh-polotucny", "Tvaroh polotučný (quark)", "protein", 127, 17, 3.5, 5),
  food("tvaroh-nizkotucny", "Tvaroh nízkotučný (low-fat quark)", "protein", 70, 13, 3.5, 0.5),
  food("eidam-30", "Eidam 30% (edam cheese)", "protein", 274, 27, 1, 18),
  food("eidam-45", "Eidam 45% (edam cheese)", "protein", 329, 25, 1, 25),
  food("parenica", "Parenica / údený syr (smoked cheese)", "protein", 305, 24, 2, 22),
  food("lucina", "Lučina / cream cheese", "fat", 230, 8, 4, 20),
  food("kefir", "Kefír", "protein", 47, 3.3, 4, 2, "ml"),
  food("cintavy-jogurt", "Biely jogurt 3% (plain yoghurt)", "protein", 61, 3.5, 4.7, 3, "ml"),
  food("acidko", "Acidofilné mlieko", "protein", 50, 3.3, 4.5, 2, "ml"),

  // Meat & deli
  food("kuracia-sunka", "Kuracia šunka (chicken ham)", "protein", 112, 18, 1, 4),
  food("bravcova-panenka", "Bravčová panenka (pork tenderloin, cooked)", "protein", 143, 26, 0, 4),
  food("hovadzie-zadne", "Hovädzie zadné (beef round, cooked)", "protein", 180, 30, 0, 6),
  food("kuraci-rezen", "Kurací rezeň vyprážaný (breaded chicken)", "protein", 250, 20, 14, 13),

  // Bakery & carbs
  food("chlieb-razny", "Chlieb ražný (rye bread)", "carbs", 256, 8.5, 48, 3.3),
  piece("rozok", "Rožok / žemľa (bread roll)", "carbs", 144, 4.5, 28, 1.5, "roll"),
  food("knedla", "Knedľa (bread dumpling)", "carbs", 217, 7, 44, 1.5),
  food("halusky", "Bryndzové halušky", "carbs", 158, 6, 20, 6),
  food("zemiakova-kasa", "Zemiaková kaša (mashed potato)", "carbs", 105, 2, 15, 4),
  food("cestoviny-celozrnne", "Celozrnné cestoviny (wholegrain pasta, cooked)", "carbs", 124, 5, 25, 1),

  // Legumes & vegetables
  food("sosovica", "Šošovica (lentils, cooked)", "carbs", 120, 9, 20, 0.4),
  food("fazula", "Fazuľa (beans, cooked)", "carbs", 130, 8.7, 22.8, 0.5),
  food("hrach", "Hrach (peas, cooked)", "vegetable", 84, 5.4, 15, 0.4),
  food("kysla-kapusta", "Kyslá kapusta (sauerkraut)", "vegetable", 19, 0.9, 4, 0.1),
  food("uhorka", "Uhorka (cucumber)", "vegetable", 15, 0.7, 3.6, 0.1),
  food("paradajka", "Paradajka (tomato)", "vegetable", 18, 0.9, 3.9, 0.2),
  food("paprika", "Paprika (bell pepper)", "vegetable", 31, 1, 6, 0.3),
  food("mrkva", "Mrkva (carrot)", "vegetable", 41, 0.9, 10, 0.2),
  food("kapusta", "Kapusta (cabbage)", "vegetable", 25, 1.3, 6, 0.1),

  // Fats & extras
  food("maslo", "Maslo (butter)", "fat", 717, 0.9, 0.1, 81),
  food("slnecnicovy-olej", "Slnečnicový olej (sunflower oil)", "fat", 900, 0, 0, 100),
  food("med", "Med (honey)", "other", 304, 0.3, 82, 0),
  piece("horalky", "Horalky / oplátka (wafer bar)", "other", 260, 4, 27.5, 14.5, "wafer bar"),
];
