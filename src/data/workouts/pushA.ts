import type { WorkoutTemplate } from "@/types/workout";

export const pushA: WorkoutTemplate = {
  id: "push-a",

  name: "Push Day A",

  description: "Chest • Shoulders • Triceps",

  exercises: [
    {
      id: "bench",
      name: "Barbell Bench Press",
      sets: [
        { reps: 5, weight: 100 },
        { reps: 5, weight: 100 },
        { reps: 5, weight: 100 },
        { reps: 3, weight: 100 },
      ],
    },

    {
      id: "incline",
      name: "Incline Dumbbell Press",
      sets: [
        { reps: 10, weight: 34 },
        { reps: 10, weight: 34 },
        { reps: 10, weight: 34 },
      ],
    },

    {
      id: "ohp",
      name: "Overhead Press",
      sets: [
        { reps: 8, weight: 65 },
        { reps: 8, weight: 65 },
        { reps: 6, weight: 65 },
      ],
    },

    {
      id: "laterals",
      name: "Lateral Raises",
      sets: [
        { reps: 15, weight: 12 },
        { reps: 15, weight: 12 },
        { reps: 12, weight: 12 },
      ],
    },

    {
      id: "pushdown",
      name: "Tricep Pushdown",
      sets: [
        { reps: 12, weight: 40 },
        { reps: 12, weight: 40 },
        { reps: 10, weight: 40 },
      ],
    },

    {
      id: "fly",
      name: "Cable Flyes",
      sets: [
        { reps: 15, weight: 15 },
        { reps: 15, weight: 15 },
      ],
    },
  ],
};