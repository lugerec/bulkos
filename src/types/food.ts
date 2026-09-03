export type FoodCategory =
  | "protein"
  | "carbs"
  | "fat"
  | "fruit"
  | "vegetable"
  | "supplement"
  | "other";

export type FoodItem = {
  id: string;
  name: string;
  category: FoodCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: number;
  unit: "g" | "ml" | "piece";
  verified: boolean;
  /** Package serving size (in `unit`), used to prefill the portion input. */
  defaultServing?: number;
  /** Singular label for one `piece`, e.g. "egg", "slice" — used to show
   * "4 eggs" instead of a generic "4 pieces". Only relevant when unit is
   * "piece". */
  unitLabel?: string;
};

export type LoggedFood = {
  id: string;
  foodId: string;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  unit?: FoodItem["unit"];
  unitLabel?: string;
  mealType:
    | "breakfast"
    | "snack"
    | "lunch"
    | "preWorkout"
    | "postWorkout"
    | "dinner";
  createdAt: Date;
};
/** A previously logged portion, surfaced for one-tap re-logging. */
export type RecentFood = {
  foodId: string;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Portion unit at the time this was logged; defaults to "g" for older
   * entries that predate this field. */
  unit?: FoodItem["unit"];
  unitLabel?: string;
};
