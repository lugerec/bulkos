import { create } from "zustand";
import type { FoodItem } from "../types/food";
import {
  getFoods,
  getUserFoods,
  saveUserFood,
  getFavoriteFoods,
  addFavoriteFood,
  removeFavoriteFood,
} from "../services/foodService";
import { mergeFoods } from "@/lib/mergeFoods";
import { useAuthStore } from "./authStore";

type FoodState = {
  foods: FoodItem[];
  favorites: FoodItem[];
  loading: boolean;
  error: string | null;

  loadFoods: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  /** Persist a food to the signed-in user's own database and merge it in. */
  saveFood: (food: FoodItem) => Promise<void>;
  /** Add/remove a food from favorites, updating local state optimistically. */
  toggleFavorite: (food: FoodItem) => Promise<void>;
  /** True once a food with this id is in the local list. */
  hasFood: (id: string) => boolean;
  isFavorite: (id: string) => boolean;
};

function currentUid(): string | null {
  return useAuthStore.getState().user?.uid ?? null;
}

export const useFoodStore = create<FoodState>((set, get) => ({
  foods: [],
  favorites: [],
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

  loadFavorites: async () => {
    const uid = currentUid();
    if (!uid) return;

    try {
      set({ favorites: await getFavoriteFoods(uid) });
    } catch {
      // Favorites are non-critical; leave the existing list on failure.
    }
  },

  saveFood: async (food) => {
    const uid = currentUid();
    if (!uid) throw new Error("Not signed in");

    await saveUserFood(uid, food);

    // Merge into the local list so it is searchable immediately, even offline.
    set({ foods: mergeFoods(get().foods, [food]) });
  },

  toggleFavorite: async (food) => {
    const uid = currentUid();
    if (!uid) throw new Error("Not signed in");

    const isFav = get().favorites.some((f) => f.id === food.id);

    // Optimistic update, then persist.
    if (isFav) {
      set({ favorites: get().favorites.filter((f) => f.id !== food.id) });
      await removeFavoriteFood(uid, food.id);
    } else {
      set({ favorites: mergeFoods(get().favorites, [food]) });
      await addFavoriteFood(uid, food);
    }
  },

  hasFood: (id) => get().foods.some((food) => food.id === id),
  isFavorite: (id) => get().favorites.some((food) => food.id === id),
}));
