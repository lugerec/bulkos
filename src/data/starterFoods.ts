import type { FoodItem } from "@/types/food";

/**
 * A small, curated set of common whole foods with per-100g macros, so the food
 * database is useful out of the box (and offline) even before the shared
 * Firestore collection is populated. Values are per 100 g (or 100 ml for
 * liquids) and rounded to typical reference figures. User and shared foods
 * with the same id override these.
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
    id: `starter-${id}`,
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

/**
 * A naturally-countable food (1 egg, 1 banana...) — macros are per single
 * piece rather than per 100 g, so logging feels like "2 eggs" instead of
 * eyeballing a gram amount for something you'd never weigh in real life.
 */
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
    id: `starter-${id}`,
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

export const STARTER_FOODS: FoodItem[] = [
  // Protein
  food("chicken-breast", "Chicken Breast (cooked)", "protein", 165, 31, 0, 3.6),
  food("chicken-thigh", "Chicken Thigh (cooked)", "protein", 209, 26, 0, 11),
  food("turkey-breast", "Turkey Breast (cooked)", "protein", 135, 30, 0, 1),
  food("lean-beef", "Lean Beef Mince 5% (cooked)", "protein", 214, 27, 0, 12),
  food("pork-loin", "Pork Loin (cooked)", "protein", 145, 26, 0, 4),
  food("salmon", "Salmon (cooked)", "protein", 208, 20, 0, 13),
  food("tuna-canned", "Tuna, canned in water", "protein", 116, 26, 0, 1),
  food("shrimp", "Shrimp (cooked)", "protein", 99, 24, 0.2, 0.3),
  piece("eggs", "Egg, whole", "protein", 78, 6.5, 0.6, 5.5, "egg"),
  food("egg-whites", "Egg Whites", "protein", 52, 11, 0.7, 0.2),
  food("greek-yogurt", "Greek Yogurt 0%", "protein", 59, 10, 3.6, 0.4),
  food("skyr", "Skyr", "protein", 63, 11, 4, 0.2),
  food("cottage-cheese", "Cottage Cheese", "protein", 98, 11, 3.4, 4.3),
  food("tofu", "Tofu, firm", "protein", 144, 15, 3, 9),

  // Carbs
  food("white-rice", "White Rice (cooked)", "carbs", 130, 2.7, 28, 0.3),
  food("brown-rice", "Brown Rice (cooked)", "carbs", 123, 2.7, 26, 1),
  food("oats", "Oats, dry", "carbs", 389, 17, 66, 7),
  food("pasta", "Pasta (cooked)", "carbs", 158, 6, 31, 0.9),
  food("potato", "Potato (boiled)", "carbs", 87, 2, 20, 0.1),
  food("sweet-potato", "Sweet Potato (cooked)", "carbs", 90, 2, 21, 0.1),
  piece("white-bread", "White Bread", "carbs", 80, 2.7, 14.7, 1, "slice"),
  piece("wholewheat-bread", "Wholewheat Bread", "carbs", 74, 3.9, 12.3, 1, "slice"),
  food("quinoa", "Quinoa (cooked)", "carbs", 120, 4.4, 21, 1.9),
  piece("rice-cakes", "Rice Cakes", "carbs", 35, 0.7, 7.4, 0.3, "rice cake"),

  // Fat
  food("almonds", "Almonds", "fat", 579, 21, 22, 50),
  food("walnuts", "Walnuts", "fat", 654, 15, 14, 65),
  food("peanut-butter", "Peanut Butter", "fat", 588, 25, 20, 50),
  food("olive-oil", "Olive Oil", "fat", 884, 0, 0, 100),
  food("avocado", "Avocado", "fat", 160, 2, 9, 15),

  // Fruit
  piece("banana", "Banana", "fruit", 105, 1.3, 27.1, 0.4, "banana"),
  piece("apple", "Apple", "fruit", 95, 0.5, 25.5, 0.4, "apple"),
  food("blueberries", "Blueberries", "fruit", 57, 0.7, 14, 0.3),
  food("strawberries", "Strawberries", "fruit", 32, 0.7, 8, 0.3),

  // Vegetable
  food("broccoli", "Broccoli", "vegetable", 34, 2.8, 7, 0.4),
  food("spinach", "Spinach", "vegetable", 23, 2.9, 3.6, 0.4),
  food("green-beans", "Green Beans", "vegetable", 31, 1.8, 7, 0.2),

  // Supplement / dairy
  food("whey", "Whey Protein Powder", "supplement", 400, 80, 8, 6),
  food("whole-milk", "Whole Milk", "other", 61, 3.2, 4.8, 3.3, "ml"),
  food("skimmed-milk", "Skimmed Milk", "other", 34, 3.4, 5, 0.1, "ml"),
];
