import type { ExerciseDefinition } from "@/types/workout";

export const glutesExercises: ExerciseDefinition[] = [
  {
    id: "hip-thrust",
    name: "Hip Thrust",
    aliases: ["Barbell Hip Thrust"],
    primaryMuscle: "glutes",
    secondaryMuscles: ["legs"],
    equipment: "barbell",
    category: "compound",
    difficulty: "beginner",
    defaultRestSeconds: 150,
    defaultSets: 4,
    defaultReps: 8,
    media: {
      thumbnail: "/exercises/hip-thrust/thumbnail.webp",
    },
    progression: {
      minReps: 6,
      maxReps: 10,
      weightStep: 5,
    },
    activation: {
      glutes: 100,
      legs: 35,
    },
    instructions: [
      "Rest your upper back on the bench.",
      "Roll the bar over your hips.",
      "Drive through your heels.",
      "Extend your hips until fully locked out.",
      "Lower under control.",
    ],
    tips: [
      "Keep your chin tucked.",
      "Pause at the top.",
      "Avoid overextending the lower back.",
    ],
    mistakes: [
      "Pushing through the toes.",
      "Hyperextending the spine.",
      "Rushing the eccentric.",
    ],
    tags: ["glutes", "strength", "compound"],
  },

  {
    id: "glute-bridge",
    name: "Glute Bridge",
    primaryMuscle: "glutes",
    secondaryMuscles: ["legs"],
    equipment: "bodyweight",
    category: "compound",
    difficulty: "beginner",
    defaultRestSeconds: 60,
    defaultSets: 3,
    defaultReps: 15,
    media: {
      thumbnail: "/exercises/glute-bridge/thumbnail.webp",
    },
    progression: {
      minReps: 12,
      maxReps: 20,
      weightStep: 5,
    },
    activation: {
      glutes: 100,
      legs: 25,
    },
    instructions: [
      "Lie on your back with knees bent.",
      "Drive through your heels.",
      "Lift your hips until your body forms a straight line.",
      "Pause briefly.",
      "Lower slowly.",
    ],
    tips: [
      "Keep your ribs down.",
      "Squeeze the glutes hard.",
      "Don't arch your lower back.",
    ],
    mistakes: [
      "Pushing through the toes.",
      "Short range of motion.",
      "Hyperextending the spine.",
    ],
    tags: ["bodyweight", "glutes"],
  },

  {
    id: "cable-kickback",
    name: "Cable Kickback",
    primaryMuscle: "glutes",
    equipment: "cable",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 60,
    defaultSets: 3,
    defaultReps: 15,
    media: {
      thumbnail: "/exercises/cable-kickback/thumbnail.webp",
    },
    progression: {
      minReps: 12,
      maxReps: 18,
      weightStep: 2.5,
    },
    activation: {
      glutes: 100,
    },
    instructions: [
      "Attach the ankle strap.",
      "Keep your torso stable.",
      "Kick your leg backward.",
      "Squeeze the glute.",
      "Return slowly.",
    ],
    tips: [
      "Don't swing.",
      "Move only at the hip.",
      "Control every rep.",
    ],
    mistakes: [
      "Arching the back.",
      "Using momentum.",
      "Turning the movement into a leg swing.",
    ],
    tags: ["cable", "glutes"],
  },

  {
    id: "smith-hip-thrust",
    name: "Smith Hip Thrust",
    primaryMuscle: "glutes",
    secondaryMuscles: ["legs"],
    equipment: "smithMachine",
    category: "compound",
    difficulty: "beginner",
    defaultRestSeconds: 150,
    defaultSets: 4,
    defaultReps: 10,
    media: {
      thumbnail: "/exercises/smith-hip-thrust/thumbnail.webp",
    },
    progression: {
      minReps: 8,
      maxReps: 12,
      weightStep: 5,
    },
    activation: {
      glutes: 100,
      legs: 35,
    },
    instructions: [
      "Set the bench behind the Smith machine.",
      "Position the bar over your hips.",
      "Drive upward through the heels.",
      "Pause at lockout.",
      "Lower under control.",
    ],
    tips: [
      "Keep shins vertical.",
      "Pause at the top.",
      "Maintain a neutral spine.",
    ],
    mistakes: [
      "Bouncing the reps.",
      "Incomplete lockout.",
      "Using the lower back.",
    ],
    tags: ["smith", "compound"],
  },

  {
    id: "abductor-machine",
    name: "Abductor Machine",
    primaryMuscle: "glutes",
    equipment: "machine",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 60,
    defaultSets: 3,
    defaultReps: 15,
    media: {
      thumbnail: "/exercises/abductor-machine/thumbnail.webp",
    },
    progression: {
      minReps: 12,
      maxReps: 20,
      weightStep: 5,
    },
    activation: {
      glutes: 100,
    },
    instructions: [
      "Sit with knees inside the pads.",
      "Push outward against the resistance.",
      "Pause briefly.",
      "Return slowly.",
    ],
    tips: [
      "Control the eccentric.",
      "Stay upright.",
      "Don't bounce.",
    ],
    mistakes: [
      "Using momentum.",
      "Leaning excessively.",
      "Partial reps.",
    ],
    tags: ["machine", "glute medius"],
  },

  {
    id: "frog-pump",
    name: "Frog Pump",
    primaryMuscle: "glutes",
    equipment: "bodyweight",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 45,
    defaultSets: 3,
    defaultReps: 20,
    media: {
      thumbnail: "/exercises/frog-pump/thumbnail.webp",
    },
    progression: {
      minReps: 15,
      maxReps: 25,
      weightStep: 5,
    },
    activation: {
      glutes: 100,
    },
    instructions: [
      "Bring the soles of your feet together.",
      "Let your knees fall outward.",
      "Drive your hips upward.",
      "Pause and squeeze.",
      "Lower under control.",
    ],
    tips: [
      "Use a strong contraction.",
      "Small range is acceptable.",
      "Keep tension throughout.",
    ],
    mistakes: [
      "Relaxing at the bottom.",
      "Using momentum.",
      "Moving too quickly.",
    ],
    tags: ["burnout", "pump"],
  },

  {
    id: "reverse-hyper",
    name: "Reverse Hyperextension",
    primaryMuscle: "glutes",
    secondaryMuscles: ["back"],
    equipment: "machine",
    category: "isolation",
    difficulty: "intermediate",
    defaultRestSeconds: 75,
    defaultSets: 3,
    defaultReps: 15,
    media: {
      thumbnail: "/exercises/reverse-hyper/thumbnail.webp",
    },
    progression: {
      minReps: 12,
      maxReps: 15,
      weightStep: 5,
    },
    activation: {
      glutes: 100,
      back: 30,
    },
    instructions: [
      "Lie face down on the machine.",
      "Lift your legs using your glutes.",
      "Pause at the top.",
      "Lower under control.",
    ],
    tips: [
      "Don't swing.",
      "Focus on the glutes.",
      "Control the eccentric.",
    ],
    mistakes: [
      "Using momentum.",
      "Hyperextending the back.",
      "Moving too fast.",
    ],
    tags: ["posterior chain"],
  },
];