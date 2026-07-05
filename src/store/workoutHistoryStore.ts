import { create } from "zustand";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/services/db";

export type LoggedWorkoutSet = {
  reps: number;
  weight: number;
  completed: boolean;
};

export type LoggedWorkoutExercise = {
  id: string;
  name: string;
  notes?: string;
  sets: LoggedWorkoutSet[];
};

export type WorkoutLog = {
  id: string;
  templateId?: string;
  date: string;
  name: string;
  durationSeconds: number;
  completedSets: number;
  totalSets: number;
  volumeKg: number;
  exercises?: LoggedWorkoutExercise[];
};

type WorkoutHistoryState = {
  workouts: WorkoutLog[];
  selectedWorkout?: WorkoutLog;
  selectedExerciseId?: string;
  selectedExerciseName?: string;
  loading: boolean;

  loadWorkouts: (uid: string) => Promise<void>;
  selectWorkout: (id: string) => void;
  clearSelectedWorkout: () => void;
  selectExercise: (exerciseId: string, exerciseName: string) => void;
  clearSelectedExercise: () => void;
};

export const useWorkoutHistoryStore = create<WorkoutHistoryState>((set, get) => ({
  workouts: [],
  selectedWorkout: undefined,
  selectedExerciseId: undefined,
  selectedExerciseName: undefined,
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

  selectWorkout: (id) => {
    const workout = get().workouts.find((w) => w.id === id);

    if (workout) {
      set({ selectedWorkout: workout });
    }
  },

  clearSelectedWorkout: () => {
    set({ selectedWorkout: undefined });
  },

  selectExercise: (exerciseId, exerciseName) => {
    set({
      selectedExerciseId: exerciseId,
      selectedExerciseName: exerciseName,
    });
  },

  clearSelectedExercise: () => {
    set({
      selectedExerciseId: undefined,
      selectedExerciseName: undefined,
    });
  },
}));