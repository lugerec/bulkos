import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
  } from "firebase/firestore";
  
  import { db } from "@/services/db";
  import type { MealType } from "@/store/appStore";
  import type { FoodItem, LoggedFood } from "@/types/food";
  
  type AddFoodToMealInput = {
    uid: string;
    date: string;
    meal: MealType;
    food: FoodItem;
    grams: number;
  };
  
  export async function addFoodToMeal(input: AddFoodToMealInput) {
    const { uid, date, meal, food, grams } = input;
  
    const multiplier = grams / food.serving;
  
    await addDoc(
      collection(db, "users", uid, "dailyLogs", date, "meals", meal, "items"),
      {
        foodId: food.id,
        name: food.name,
        grams,
        calories: Math.round(food.calories * multiplier),
        protein: Number((food.protein * multiplier).toFixed(1)),
        carbs: Number((food.carbs * multiplier).toFixed(1)),
        fat: Number((food.fat * multiplier).toFixed(1)),
        mealType: meal,
        createdAt: serverTimestamp(),
      }
    );
  }
  
  export async function getMealFoods(
    uid: string,
    date: string,
    meal: MealType
  ): Promise<LoggedFood[]> {
    const ref = collection(
      db,
      "users",
      uid,
      "dailyLogs",
      date,
      "meals",
      meal,
      "items"
    );
  
    const q = query(ref, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
  
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<LoggedFood, "id">),
      createdAt: new Date(),
    }));
  }
const ALL_MEAL_TYPES: readonly MealType[] = [
  "breakfast",
  "snack",
  "lunch",
  "preWorkout",
  "postWorkout",
  "dinner",
];

/** Total logged calories for one day across all meals. */
export async function getDailyCalories(
  uid: string,
  date: string
): Promise<number> {
  const meals = await Promise.all(
    ALL_MEAL_TYPES.map((meal) => getMealFoods(uid, date, meal))
  );

  return meals
    .flat()
    .reduce((sum, food) => sum + (food.calories ?? 0), 0);
}
