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
};
