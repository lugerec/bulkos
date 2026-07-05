import { create } from "zustand";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/services/db";

export type WorkoutLog = {
  id: string;
  date: string;
  name: string;
  durationSeconds: number;
  completedSets: number;
  totalSets: number;
  volumeKg: number;
  templateId: string;
};

type WorkoutHistoryState = {
  workouts: WorkoutLog[];
  loading: boolean;

  loadWorkouts: (uid: string) => Promise<void>;
};

export const useWorkoutHistoryStore = create<WorkoutHistoryState>((set) => ({
  workouts: [],
  loading: false,

  loadWorkouts: async (uid) => {
    set({ loading: true });

    const q = query(
      collection(db, "users", uid, "workoutLogs"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    set({
      workouts: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<WorkoutLog, "id">),
      })),
      loading: false,
    });
  },
}));