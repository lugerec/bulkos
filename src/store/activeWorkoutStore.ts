import { create } from "zustand";

import type { WorkoutExercise } from "@/types/workout";
import {
  elapsedSeconds,
  pauseTiming,
  resumeTiming,
} from "@/features/workout/utils/workoutTimer";

/**
 * The live workout session, kept outside the Workout screen so leaving the
 * tab (to check nutrition, look something up…) doesn't throw away logged
 * weights, ticked sets or the elapsed time. The screen restores from here on
 * mount, and the dashboard/FAB use `active` to offer "Resume workout".
 *
 * Time is wall-clock anchored (startedAt + accumulatedMs) rather than tick
 * counted, so the timer keeps running while off-screen and after the app is
 * backgrounded.
 */
type ActiveWorkoutState = {
  active: boolean;
  /** Template id when the session came from a saved template. */
  templateId?: string;
  name: string;
  exercises: WorkoutExercise[];
  /** Completed set keys, "exerciseIndex-setIndex". */
  completed: string[];

  // Wall-clock timing.
  startedAt: number | null;
  accumulatedMs: number;
  paused: boolean;

  begin: (params: {
    name: string;
    exercises: WorkoutExercise[];
    templateId?: string;
  }) => void;
  sync: (
    patch: Partial<
      Pick<ActiveWorkoutState, "exercises" | "completed">
    >
  ) => void;
  pause: () => void;
  resume: () => void;
  /** Current elapsed seconds, derived from the clock. */
  elapsedSeconds: () => number;
  clear: () => void;
};

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set, get) => ({
  active: false,
  templateId: undefined,
  name: "",
  exercises: [],
  completed: [],
  startedAt: null,
  accumulatedMs: 0,
  paused: false,

  begin: ({ name, exercises, templateId }) =>
    set({
      active: true,
      name,
      exercises,
      templateId,
      completed: [],
      startedAt: Date.now(),
      accumulatedMs: 0,
      paused: false,
    }),

  sync: (patch) => set(patch),

  pause: () => {
    const { startedAt, accumulatedMs } = get();
    const next = pauseTiming({ startedAt, accumulatedMs });
    set({ ...next, paused: true });
  },

  resume: () => {
    const { startedAt, accumulatedMs } = get();
    const next = resumeTiming({ startedAt, accumulatedMs });
    set({ ...next, paused: false });
  },

  elapsedSeconds: () => {
    const { startedAt, accumulatedMs } = get();
    return elapsedSeconds({ startedAt, accumulatedMs });
  },

  clear: () =>
    set({
      active: false,
      templateId: undefined,
      name: "",
      exercises: [],
      completed: [],
      startedAt: null,
      accumulatedMs: 0,
      paused: false,
    }),
}));
