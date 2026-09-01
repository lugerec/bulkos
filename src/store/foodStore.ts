import { create } from "zustand";
import type { FoodItem } from "../types/food";
import {
  getFoods,
  getUserFoods,
  saveUserFood,
  deleteUserFood,
  getFavoriteFoods,
  addFavoriteFood,
  removeFavoriteFood,
} from "../services/foodService";
import { mergeFoods } from "@/lib/mergeFoods";
import { STARTER_FOODS } from "@/data/starterFoods";
import { SLOVAK_FOODS } from "@/data/slovakFoods";
import { useAuthStore } from "./authStore";

type FoodState = {
  foods: FoodItem[];
  /** The user's own foods (customFoods) — the only ones that can be edited or
   * deleted. Kept separate so starter/shared entries aren't mistaken for own. */
  userFoods: FoodItem[];
  favorites: FoodItem[];
  loading: boolean;
  error: string | null;

  loadFoods: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  /** Persist a food to the signed-in user's own database and merge it in. */
  saveFood: (food: FoodItem) => Promise<void>;
  /** Delete one of the user's own foods (and unfavorite it if needed). */
  deleteFood: (id: string) => Promise<void>;
  /** Add/remove a food from favorites, updating local state optimistically. */
  toggleFavorite: (food: FoodItem) => Promise<void>;
  /** True once a food with this id is in the local list. */
  hasFood: (id: string) => boolean;
  /** True when the food is one of the user's own (editable/deletable). */
  isOwnFood: (id: string) => boolean;
  isFavorite: (id: string) => boolean;
};

function currentUid(): string | null {
  return useAuthStore.getState().user?.uid ?? null;
}

export const useFoodStore = create<FoodState>((set, get) => ({
  foods: [],
  userFoods: [],
  favorites: [],
  loading: false,
  error: null,

  loadFoods: async () => {
    set({ loading: true, error: null });

    const uid = currentUid();

    // Every source is best-effort layered on top of the built-in starter set,
    // so the database is never empty — even offline or if Firestore reads fail.
    let shared: FoodItem[] = [];
    try {
      shared = await getFoods();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load foods",
      });
    }

    let userFoods: FoodItem[] = [];
    if (uid) {
      try {
        userFoods = await getUserFoods(uid);
      } catch {
        userFoods = [];
      }
    }

    set({
      userFoods,
      foods: mergeFoods(
        mergeFoods(mergeFoods(STARTER_FOODS, SLOVAK_FOODS), shared),
        userFoods
      ),
      loading: false,
    });
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

    // Merge into both lists so it's searchable immediately and marked as own.
    set({
      foods: mergeFoods(get().foods, [food]),
      userFoods: mergeFoods(get().userFoods, [food]),
    });
  },

  deleteFood: async (id) => {
    const uid = currentUid();
    if (!uid) throw new Error("Not signed in");

    // Optimistic removal from every local list.
    set({
      foods: get().foods.filter((f) => f.id !== id),
      userFoods: get().userFoods.filter((f) => f.id !== id),
      favorites: get().favorites.filter((f) => f.id !== id),
    });

    try {
      await deleteUserFood(uid, id);
      if (get().favorites.every((f) => f.id !== id)) {
        // Also drop the favorite entry if it existed.
        await removeFavoriteFood(uid, id).catch(() => {});
      }
    } catch {
      // If the delete failed, reload to resync local state with the server.
      await get().loadFoods();
    }
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
  isOwnFood: (id) => get().userFoods.some((food) => food.id === id),
  isFavorite: (id) => get().favorites.some((food) => food.id === id),
}));
