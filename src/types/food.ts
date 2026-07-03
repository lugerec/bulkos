export type FoodItem = {
    id: string;
    name: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    category: "protein" | "carbs" | "fat" | "fruit" | "vegetable" | "supplement" | "other";
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
    mealType: "breakfast" | "snack" | "lunch" | "preWorkout" | "postWorkout" | "dinner";
    createdAt: Date;
  };