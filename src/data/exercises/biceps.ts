import type { ExerciseDefinition } from "@/types/workout";

export const bicepsExercises: ExerciseDefinition[] = [
  {
    id: "barbell-curl",
    name: "Barbell Curl",
    aliases: ["Standing Barbell Curl"],
    primaryMuscle: "biceps",
    secondaryMuscles: ["forearms"],
    equipment: "barbell",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 90,
    defaultSets: 3,
    defaultReps: 10,
    media: {
      thumbnail: "/exercises/barbell-curl/thumbnail.webp",
    },
    progression: {
      minReps: 8,
      maxReps: 12,
      weightStep: 2.5,
    },
    activation: {
      biceps: 100,
      forearms: 35,
    },
    instructions: [
      "Stand upright with the bar at hip level.",
      "Keep elbows close to your torso.",
      "Curl the bar without moving your shoulders.",
      "Squeeze your biceps at the top.",
      "Lower slowly under control.",
    ],
    tips: [
      "Keep wrists neutral.",
      "Use full range of motion.",
      "Control the eccentric.",
    ],
    mistakes: [
      "Swinging the body.",
      "Moving elbows forward.",
      "Using excessive weight.",
    ],
    tags: ["biceps", "barbell", "curl"],
  },

  {
    id: "db-curl",
    name: "DB Curl",
    aliases: ["Alternating Dumbbell Curl"],
    primaryMuscle: "biceps",
    secondaryMuscles: ["forearms"],
    equipment: "dumbbell",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 90,
    defaultSets: 3,
    defaultReps: 12,
    media: {
      thumbnail: "/exercises/db-curl/thumbnail.webp",
    },
    progression: {
      minReps: 10,
      maxReps: 15,
      weightStep: 2,
    },
    activation: {
      biceps: 100,
      forearms: 30,
    },
    instructions: [
      "Stand with dumbbells at your sides.",
      "Supinate while curling upward.",
      "Keep elbows fixed.",
      "Pause at the top.",
      "Lower slowly.",
    ],
    tips: [
      "Rotate your wrist during the curl.",
      "Avoid swinging.",
      "Control every rep.",
    ],
    mistakes: [
      "Using momentum.",
      "Partial reps.",
      "Shrugging shoulders.",
    ],
    tags: ["biceps", "dumbbell"],
  },

  {
    id: "hammer-curl",
    name: "Hammer Curl",
    primaryMuscle: "biceps",
    secondaryMuscles: ["forearms"],
    equipment: "dumbbell",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 90,
    defaultSets: 3,
    defaultReps: 12,
    media: {
      thumbnail: "/exercises/hammer-curl/thumbnail.webp",
    },
    progression: {
      minReps: 10,
      maxReps: 15,
      weightStep: 2,
    },
    activation: {
      biceps: 80,
      forearms: 75,
    },
    instructions: [
      "Hold dumbbells with a neutral grip.",
      "Curl while keeping palms facing each other.",
      "Pause briefly.",
      "Lower under control.",
    ],
    tips: [
      "Keep elbows still.",
      "Move only at the elbow.",
      "Control the lowering phase.",
    ],
    mistakes: [
      "Swinging.",
      "Leaning backward.",
      "Using too much weight.",
    ],
    tags: ["hammer", "brachialis", "forearms"],
  },

  {
    id: "preacher-curl",
    name: "Preacher Curl",
    primaryMuscle: "biceps",
    equipment: "machine",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 90,
    defaultSets: 3,
    defaultReps: 10,
    media: {
      thumbnail: "/exercises/preacher-curl/thumbnail.webp",
    },
    progression: {
      minReps: 8,
      maxReps: 12,
      weightStep: 2.5,
    },
    activation: {
      biceps: 100,
    },
    instructions: [
      "Rest your arms fully on the pad.",
      "Curl the weight without lifting your elbows.",
      "Squeeze at the top.",
      "Lower slowly.",
    ],
    tips: [
      "Use full extension.",
      "Control every rep.",
      "Avoid bouncing.",
    ],
    mistakes: [
      "Lifting elbows.",
      "Using momentum.",
      "Stopping short.",
    ],
    tags: ["machine", "preacher"],
  },

  {
    id: "incline-db-curl",
    name: "Incline DB Curl",
    primaryMuscle: "biceps",
    secondaryMuscles: ["forearms"],
    equipment: "dumbbell",
    category: "isolation",
    difficulty: "intermediate",
    defaultRestSeconds: 90,
    defaultSets: 3,
    defaultReps: 12,
    media: {
      thumbnail: "/exercises/incline-db-curl/thumbnail.webp",
    },
    progression: {
      minReps: 10,
      maxReps: 15,
      weightStep: 2,
    },
    activation: {
      biceps: 100,
      forearms: 30,
    },
    instructions: [
      "Sit on an incline bench.",
      "Let your arms hang fully.",
      "Curl while supinating.",
      "Lower slowly.",
    ],
    tips: [
      "Great stretch at the bottom.",
      "Don't swing.",
      "Keep elbows behind the torso.",
    ],
    mistakes: [
      "Moving shoulders.",
      "Partial reps.",
      "Using momentum.",
    ],
    tags: ["stretch", "dumbbell"],
  },

  {
    id: "cable-curl",
    name: "Cable Curl",
    primaryMuscle: "biceps",
    secondaryMuscles: ["forearms"],
    equipment: "cable",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 75,
    defaultSets: 3,
    defaultReps: 12,
    media: {
      thumbnail: "/exercises/cable-curl/thumbnail.webp",
    },
    progression: {
      minReps: 10,
      maxReps: 15,
      weightStep: 2.5,
    },
    activation: {
      biceps: 100,
      forearms: 25,
    },
    instructions: [
      "Stand facing the cable.",
      "Keep elbows at your sides.",
      "Curl toward your shoulders.",
      "Lower slowly.",
    ],
    tips: [
      "Constant tension.",
      "Keep upper arms still.",
      "Don't lean back.",
    ],
    mistakes: [
      "Body swing.",
      "Moving elbows.",
      "Too much weight.",
    ],
    tags: ["cable", "constant tension"],
  },
];