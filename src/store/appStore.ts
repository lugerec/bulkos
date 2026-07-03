import { create } from "zustand";
import type { Screen } from "@/shared/ui";

export type MealType =
  | "breakfast"
  | "snack"
  | "lunch"
  | "preWorkout"
  | "postWorkout"
  | "dinner";

type AppState = {
  userName: string;

  screen: Screen;
  prevScreen: Screen;
  navigate: (to: Screen) => void;
  goBack: () => void;

  selectedMeal: MealType;
  setSelectedMeal: (meal: MealType) => void;

  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };

  today: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
    weight: number;
    sleep: number;
    workoutCompleted: boolean;
    mealsCompleted: MealType[];
  };

  completeMeal: (mealId: MealType) => void;
  uncompleteMeal: (mealId: MealType) => void;
  addWater: (liters: number) => void;
  setWeight: (weight: number) => void;
  completeWorkout: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  userName: "Lukáš",

  screen: "dashboard",
  prevScreen: "settings",

  selectedMeal: "breakfast",

  navigate: (to) =>
    set((state) => ({
      prevScreen: state.screen,
      screen: to,
    })),

  goBack: () =>
    set((state) => ({
      screen: state.prevScreen,
    })),

  setSelectedMeal: (meal) =>
    set({
      selectedMeal: meal,
    }),

  targets: {
    calories: 3300,
    protein: 200,
    carbs: 400,
    fat: 90,
    water: 3.5,
  },

  today: {
    calories: 1840,
    protein: 142,
    carbs: 180,
    fat: 48,
    water: 1.8,
    weight: 94,
    sleep: 7,
    workoutCompleted: false,
    mealsCompleted: ["breakfast", "snack", "lunch"],
  },

  completeMeal: (mealId) =>
    set((state) => ({
      today: {
        ...state.today,
        mealsCompleted: state.today.mealsCompleted.includes(mealId)
          ? state.today.mealsCompleted
          : [...state.today.mealsCompleted, mealId],
      },
    })),

  uncompleteMeal: (mealId) =>
    set((state) => ({
      today: {
        ...state.today,
        mealsCompleted: state.today.mealsCompleted.filter((id) => id !== mealId),
      },
    })),

  addWater: (liters) =>
    set((state) => ({
      today: {
        ...state.today,
        water: Math.round((state.today.water + liters) * 10) / 10,
      },
    })),

  setWeight: (weight) =>
    set((state) => ({
      today: {
        ...state.today,
        weight,
      },
    })),

  completeWorkout: () =>
    set((state) => ({
      today: {
        ...state.today,
        workoutCompleted: true,
      },
    })),
}));