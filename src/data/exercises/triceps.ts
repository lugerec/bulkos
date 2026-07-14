import type { ExerciseDefinition } from "@/types/workout";

export const tricepsExercises: ExerciseDefinition[] = [
  {
    id: "triceps-pushdown",
    name: "Triceps Pushdown",
    aliases: ["Cable Pushdown", "Rope Pushdown"],
    primaryMuscle: "triceps",
    equipment: "cable",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 90,
    defaultSets: 3,
    defaultReps: 12,
    media: {
      thumbnail: "/exercises/triceps-pushdown/thumbnail.webp",
    },
    progression: {
      minReps: 10,
      maxReps: 15,
      weightStep: 2.5,
    },
    activation: {
      triceps: 100,
    },
    instructions: [
      "Stand facing the cable.",
      "Keep elbows tucked close to your body.",
      "Extend your elbows until your arms are straight.",
      "Pause briefly.",
      "Return slowly under control.",
    ],
    tips: [
      "Only your forearms should move.",
      "Keep shoulders relaxed.",
      "Control the eccentric.",
    ],
    mistakes: [
      "Moving the elbows.",
      "Leaning over excessively.",
      "Using momentum.",
    ],
    tags: ["triceps", "cable", "pushdown"],
  },

  {
    id: "overhead-triceps-extension",
    name: "Overhead Triceps Extension",
    aliases: ["Cable Overhead Extension"],
    primaryMuscle: "triceps",
    equipment: "cable",
    category: "isolation",
    difficulty: "intermediate",
    defaultRestSeconds: 90,
    defaultSets: 3,
    defaultReps: 12,
    media: {
      thumbnail: "/exercises/overhead-triceps-extension/thumbnail.webp",
    },
    progression: {
      minReps: 10,
      maxReps: 15,
      weightStep: 2.5,
    },
    activation: {
      triceps: 100,
    },
    instructions: [
      "Face away from the cable stack.",
      "Keep elbows pointing forward.",
      "Extend your arms fully overhead.",
      "Pause briefly.",
      "Lower slowly.",
    ],
    tips: [
      "Keep elbows fixed.",
      "Stretch fully at the bottom.",
      "Use a controlled tempo.",
    ],
    mistakes: [
      "Flaring elbows.",
      "Arching the lower back.",
      "Using body momentum.",
    ],
    tags: ["long head", "cable"],
  },

  {
    id: "skull-crusher",
    name: "Skull Crusher",
    aliases: ["Lying Triceps Extension", "EZ Bar Skull Crusher"],
    primaryMuscle: "triceps",
    equipment: "ezBar",
    category: "isolation",
    difficulty: "intermediate",
    defaultRestSeconds: 90,
    defaultSets: 3,
    defaultReps: 10,
    media: {
      thumbnail: "/exercises/skull-crusher/thumbnail.webp",
    },
    progression: {
      minReps: 8,
      maxReps: 12,
      weightStep: 2.5,
    },
    activation: {
      triceps: 100,
    },
    instructions: [
      "Lie on a flat bench.",
      "Hold the EZ bar above your chest.",
      "Lower the bar toward your forehead by bending the elbows.",
      "Extend back to the starting position.",
    ],
    tips: [
      "Keep upper arms still.",
      "Use full range of motion.",
      "Lower slowly.",
    ],
    mistakes: [
      "Moving shoulders too much.",
      "Using excessive weight.",
      "Partial reps.",
    ],
    tags: ["ez bar", "lying extension"],
  },

  {
    id: "dip",
    name: "Dip",
    aliases: ["Parallel Bar Dip"],
    primaryMuscle: "triceps",
    secondaryMuscles: ["chest", "shoulders"],
    equipment: "bodyweight",
    category: "compound",
    difficulty: "intermediate",
    defaultRestSeconds: 120,
    defaultSets: 3,
    defaultReps: 10,
    media: {
      thumbnail: "/exercises/dip/thumbnail.webp",
    },
    progression: {
      minReps: 8,
      maxReps: 12,
      weightStep: 5,
    },
    activation: {
      triceps: 100,
      chest: 40,
      shoulders: 30,
    },
    instructions: [
      "Support yourself on parallel bars.",
      "Lower until your upper arms are about parallel to the floor.",
      "Keep elbows close to your body.",
      "Press back up until arms are extended.",
    ],
    tips: [
      "Stay upright for more triceps.",
      "Control the descent.",
      "Use full range.",
    ],
    mistakes: [
      "Going too deep.",
      "Swinging the body.",
      "Flaring elbows excessively.",
    ],
    tags: ["compound", "bodyweight"],
  },

  {
    id: "close-grip-bench-press",
    name: "Close Grip Bench Press",
    primaryMuscle: "triceps",
    secondaryMuscles: ["chest", "shoulders"],
    equipment: "barbell",
    category: "compound",
    difficulty: "intermediate",
    defaultRestSeconds: 150,
    defaultSets: 4,
    defaultReps: 8,
    media: {
      thumbnail: "/exercises/close-grip-bench-press/thumbnail.webp",
    },
    progression: {
      minReps: 6,
      maxReps: 8,
      weightStep: 2.5,
    },
    activation: {
      triceps: 100,
      chest: 45,
      shoulders: 25,
    },
    instructions: [
      "Grip the bar just inside shoulder width.",
      "Lower the bar toward the lower chest.",
      "Keep elbows tucked.",
      "Press back to full extension.",
    ],
    tips: [
      "Don't grip too narrowly.",
      "Maintain upper back tightness.",
      "Drive through the feet.",
    ],
    mistakes: [
      "Grip too close.",
      "Flaring elbows.",
      "Bouncing the bar.",
    ],
    tags: ["barbell", "strength"],
  },

  {
    id: "single-arm-pushdown",
    name: "Single Arm Pushdown",
    primaryMuscle: "triceps",
    equipment: "cable",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 60,
    defaultSets: 3,
    defaultReps: 15,
    media: {
      thumbnail: "/exercises/single-arm-pushdown/thumbnail.webp",
    },
    progression: {
      minReps: 12,
      maxReps: 15,
      weightStep: 1.25,
    },
    activation: {
      triceps: 100,
    },
    instructions: [
      "Stand beside the cable.",
      "Keep your elbow fixed.",
      "Extend your arm downward.",
      "Pause briefly.",
      "Return slowly.",
    ],
    tips: [
      "Great for correcting imbalances.",
      "Move only the forearm.",
      "Control every rep.",
    ],
    mistakes: [
      "Rotating the torso.",
      "Using momentum.",
      "Moving the elbow.",
    ],
    tags: ["unilateral", "cable"],
  },
];