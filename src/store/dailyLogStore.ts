import { create } from "zustand";

import type { MealType } from "@/store/appStore";
import type { LoggedFood } from "@/types/food";
import { getMealFoods } from "@/services/logService";

const meals: MealType[] = [
  "breakfast",
  "snack",
  "lunch",
  "preWorkout",
  "postWorkout",
  "dinner",
];

type DailyLogState = {
  foodsByMeal: Record<MealType, LoggedFood[]>;
  loading: boolean;
  error: string | null;

  loadDailyLog: (uid: string, date: string) => Promise<void>;
};

const emptyFoodsByMeal: Record<MealType, LoggedFood[]> = {
  breakfast: [],
  snack: [],
  lunch: [],
  preWorkout: [],
  postWorkout: [],
  dinner: [],
};

export const useDailyLogStore = create<DailyLogState>((set) => ({
  foodsByMeal: emptyFoodsByMeal,
  loading: false,
  error: null,

  loadDailyLog: async (uid, date) => {
    try {
      set({ loading: true, error: null });

      const entries = await Promise.all(
        meals.map(async (meal) => {
          const foods = await getMealFoods(uid, date, meal);
          return [meal, foods] as const;
        })
      );

      set({
        foodsByMeal: Object.fromEntries(entries) as Record<MealType, LoggedFood[]>,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load daily log",
        loading: false,
      });
    }
  },
}));