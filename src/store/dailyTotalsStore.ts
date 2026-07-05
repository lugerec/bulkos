import { create } from "zustand";

import { useDailyLogStore } from "@/store/dailyLogStore";
import type { MealType } from "@/store/appStore";

type Totals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type DailyTotalsState = {
  totals: Totals;
  mealTotals: Record<MealType, Totals>;
  recalculate: () => void;
};

const emptyTotals = (): Totals => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
});

export const useDailyTotalsStore = create<DailyTotalsState>((set) => ({
  totals: emptyTotals(),

  mealTotals: {
    breakfast: emptyTotals(),
    snack: emptyTotals(),
    lunch: emptyTotals(),
    preWorkout: emptyTotals(),
    postWorkout: emptyTotals(),
    dinner: emptyTotals(),
  },

  recalculate: () => {
    const foodsByMeal = useDailyLogStore.getState().foodsByMeal;

    const mealTotals = {} as Record<MealType, Totals>;

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    Object.entries(foodsByMeal).forEach(([meal, foods]) => {
      const total = foods.reduce(
        (acc, food) => ({
          calories: acc.calories + food.calories,
          protein: acc.protein + food.protein,
          carbs: acc.carbs + food.carbs,
          fat: acc.fat + food.fat,
        }),
        emptyTotals()
      );

      mealTotals[meal as MealType] = total;

      calories += total.calories;
      protein += total.protein;
      carbs += total.carbs;
      fat += total.fat;
    });

    set({
      totals: {
        calories,
        protein,
        carbs,
        fat,
      },
      mealTotals,
    });
  },
}));