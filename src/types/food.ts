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