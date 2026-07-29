import { create } from "zustand";
import type { FoodItem } from "../types/food";
import { getFoods, getUserFoods, saveUserFood } from "../services/foodService";
import { mergeFoods } from "@/lib/mergeFoods";
import { useAuthStore } from "./authStore";

type FoodState = {
  foods: FoodItem[];
  loading: boolean;
  error: string | null;

  loadFoods: () => Promise<void>;
  /** Persist a food to the signed-in user's own database and merge it in. */
  saveFood: (food: FoodItem) => Promise<void>;
  /** True once a food with this id is in the local list. */
  hasFood: (id: string) => boolean;
};

function currentUid(): string | null {
  return useAuthStore.getState().user?.uid ?? null;
}

export const useFoodStore = create<FoodState>((set, get) => ({
  foods: [],
  loading: false,
  error: null,

  loadFoods: async () => {
    try {
      set({ loading: true, error: null });

      const uid = currentUid();

      const [shared, userFoods] = await Promise.all([
        getFoods(),
        uid ? getUserFoods(uid) : Promise.resolve<FoodItem[]>([]),
      ]);

      set({ foods: mergeFoods(shared, userFoods), loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load foods",
        loading: false,
      });
    }
  },

  saveFood: async (food) => {
    const uid = currentUid();
    if (!uid) throw new Error("Not signed in");

    await saveUserFood(uid, food);

    // Merge into the local list so it is searchable immediately, even offline.
    set({ foods: mergeFoods(get().foods, [food]) });
  },

  hasFood: (id) => get().foods.some((food) => food.id === id),
}));
