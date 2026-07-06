import { create } from "zustand";

import type { BodyMetrics } from "@/types/bodyMetrics";
import {
  loadBodyMetrics,
  saveBodyMetrics,
} from "@/services/bodyMetricsService";

type BodyMetricsState = {
  entries: BodyMetrics[];
  loading: boolean;
  error: string | null;

  load: (uid: string) => Promise<void>;
  add: (
    uid: string,
    data: Omit<BodyMetrics, "id" | "createdAt">
  ) => Promise<void>;
};

export const useBodyMetricsStore = create<BodyMetricsState>((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  load: async (uid) => {
    try {
      set({ loading: true, error: null });

      const entries = await loadBodyMetrics(uid);

      set({ entries });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load body metrics",
      });
    } finally {
      set({ loading: false });
    }
  },

  add: async (uid, data) => {
    try {
      set({ loading: true, error: null });

      await saveBodyMetrics(uid, data);

      const entries = await loadBodyMetrics(uid);

      set({ entries });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to save body metrics",
      });
    } finally {
      set({ loading: false });
    }
  },
}));