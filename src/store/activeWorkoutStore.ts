import { create } from "zustand";

import type { WorkoutExercise } from "@/types/workout";

/**
 * The live workout session, kept outside the Workout screen so leaving the
 * tab (to check nutrition, look something up…) doesn't throw away logged
 * weights, ticked sets or the elapsed time. The screen restores from here on
 * mount, and the dashboard uses `active` to offer "Resume workout".
 */
type ActiveWorkoutState = {
  active: boolean;
  /** Template id when the session came from a saved template. */
  templateId?: string;
  name: string;
  exercises: WorkoutExercise[];
  /** Completed set keys, "exerciseIndex-setIndex". */
  completed: string[];
  elapsed: number;
  paused: boolean;

  begin: (params: {
    name: string;
    exercises: WorkoutExercise[];
    templateId?: string;
  }) => void;
  sync: (patch: Partial<Omit<ActiveWorkoutState, "begin" | "sync" | "clear">>) => void;
  clear: () => void;
};

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set) => ({
  active: false,
  templateId: undefined,
  name: "",
  exercises: [],
  completed: [],
  elapsed: 0,
  paused: false,

  begin: ({ name, exercises, templateId }) =>
    set({
      active: true,
      name,
      exercises,
      templateId,
      completed: [],
      elapsed: 0,
      paused: false,
    }),

  sync: (patch) => set(patch),

  clear: () =>
    set({
      active: false,
      templateId: undefined,
      name: "",
      exercises: [],
      completed: [],
      elapsed: 0,
      paused: false,
    }),
}));
