import { create } from "zustand";
import type { FoodItem } from "../types/food";
import { getFoods } from "../services/foodService";

type FoodState = {
  foods: FoodItem[];
  loading: boolean;
  error: string | null;

  loadFoods: () => Promise<void>;
};

export const useFoodStore = create<FoodState>((set) => ({
  foods: [],
  loading: false,
  error: null,

  loadFoods: async () => {
    try {
      set({ loading: true, error: null });

      const foods = await getFoods();

      set({
        foods,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load foods",
        loading: false,
      });
    }
  },
}));