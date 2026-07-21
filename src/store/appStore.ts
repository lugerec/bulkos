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

  /** True only while a workout session is actively in progress. Cleared on
   * every navigation so returning to the Workout tab always shows the
   * template picker, never a phantom running session. */
  sessionActive: boolean;
  startSession: () => void;
  endSession: () => void;

  /** Set by the dashboard's Smart Coach "Start" so the Workout screen opens
   * straight into the preview of the already-selected template instead of
   * the picker. Consumed (cleared) once on the Workout screen's mount. */
  pendingWorkoutPreview: boolean;
  requestWorkoutPreview: () => void;
  consumeWorkoutPreview: () => boolean;

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

  sessionActive: false,

  pendingWorkoutPreview: false,
  requestWorkoutPreview: () => set({ pendingWorkoutPreview: true }),
  consumeWorkoutPreview: () => {
    const pending = useAppStore.getState().pendingWorkoutPreview;
    if (pending) set({ pendingWorkoutPreview: false });
    return pending;
  },

  navigate: (to) =>
    set((state) => ({
      prevScreen: state.screen,
      screen: to,
      sessionActive: false,
    })),

  startSession: () => set({ sessionActive: true }),
  endSession: () => set({ sessionActive: false }),

  goBack: () =>
    set((state) => ({
      screen: state.prevScreen,
      sessionActive: false,
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