import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
  } from "firebase/firestore";
  
  import { db } from "@/services/db";
  import { toDateKey } from "@/lib/date";
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

/**
 * Names of foods logged in the last `days` days with how often each was
 * logged — the basis for grocery-list suggestions.
 */
export async function getRecentFoodNames(
  uid: string,
  days: number
): Promise<Array<{ name: string; count: number }>> {
  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date();

    date.setDate(date.getDate() - index);

    return toDateKey(date);
  });

  const meals = await Promise.all(
    dates.flatMap((date) =>
      ALL_MEAL_TYPES.map((meal) => getMealFoods(uid, date, meal))
    )
  );

  const counts = new Map<string, { name: string; count: number }>();

  for (const food of meals.flat()) {
    const key = food.name.trim().toLowerCase();

    if (!key) continue;

    const existing = counts.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { name: food.name.trim(), count: 1 });
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count);
}

export type DailyMacros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

/** Total logged macros for one day across all meals. */
export async function getDailyMacros(
  uid: string,
  date: string
): Promise<DailyMacros> {
  const meals = await Promise.all(
    ALL_MEAL_TYPES.map((meal) => getMealFoods(uid, date, meal))
  );

  return meals.flat().reduce<DailyMacros>(
    (sum, food) => ({
      calories: sum.calories + (food.calories ?? 0),
      protein: sum.protein + (food.protein ?? 0),
      carbs: sum.carbs + (food.carbs ?? 0),
      fat: sum.fat + (food.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
