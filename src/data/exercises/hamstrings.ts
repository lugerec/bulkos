import type { ExerciseDefinition } from "@/types/workout";

export const hamstringsExercises: ExerciseDefinition[] = [
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    aliases: ["RDL"],
    primaryMuscle: "legs",
    secondaryMuscles: ["glutes", "back"],
    equipment: "barbell",
    category: "compound",
    difficulty: "intermediate",
    defaultRestSeconds: 180,
    defaultSets: 4,
    defaultReps: 8,
    media: {
      thumbnail: "/exercises/romanian-deadlift/thumbnail.webp",
    },
    progression: {
      minReps: 6,
      maxReps: 10,
      weightStep: 5,
    },
    activation: {
      legs: 100,
      glutes: 75,
      back: 30,
    },
    instructions: [
      "Stand with the bar at hip level.",
      "Keep a slight bend in your knees.",
      "Push your hips backward while keeping the bar close.",
      "Lower until you feel a strong hamstring stretch.",
      "Drive your hips forward to return.",
    ],
    tips: [
      "Maintain a neutral spine.",
      "Keep the bar close to your legs.",
      "Move through the hips, not the knees.",
    ],
    mistakes: [
      "Rounding the lower back.",
      "Turning it into a squat.",
      "Letting the bar drift away.",
    ],
    tags: ["hamstrings", "hinge", "strength"],
  },

  {
    id: "lying-leg-curl",
    name: "Lying Leg Curl",
    primaryMuscle: "legs",
    equipment: "machine",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 75,
    defaultSets: 3,
    defaultReps: 12,
    media: {
      thumbnail: "/exercises/lying-leg-curl/thumbnail.webp",
    },
    progression: {
      minReps: 10,
      maxReps: 15,
      weightStep: 5,
    },
    activation: {
      legs: 100,
    },
    instructions: [
      "Adjust the pad above your ankles.",
      "Curl your heels toward your glutes.",
      "Pause at full contraction.",
      "Lower slowly.",
    ],
    tips: [
      "Control the eccentric.",
      "Keep hips on the pad.",
      "Use full range of motion.",
    ],
    mistakes: [
      "Lifting the hips.",
      "Using momentum.",
      "Partial reps.",
    ],
    tags: ["hamstrings", "machine"],
  },

  {
    id: "seated-leg-curl",
    name: "Seated Leg Curl",
    primaryMuscle: "legs",
    equipment: "machine",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 75,
    defaultSets: 3,
    defaultReps: 12,
    media: {
      thumbnail: "/exercises/seated-leg-curl/thumbnail.webp",
    },
    progression: {
      minReps: 10,
      maxReps: 15,
      weightStep: 5,
    },
    activation: {
      legs: 100,
    },
    instructions: [
      "Adjust the backrest and ankle pad.",
      "Curl the pad downward.",
      "Pause briefly.",
      "Return under control.",
    ],
    tips: [
      "Stay seated firmly.",
      "Don't bounce the weight.",
      "Use a controlled tempo.",
    ],
    mistakes: [
      "Using momentum.",
      "Partial reps.",
      "Lifting your hips.",
    ],
    tags: ["hamstrings", "machine"],
  },

  {
    id: "single-leg-curl",
    name: "Single Leg Curl",
    primaryMuscle: "legs",
    equipment: "machine",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 60,
    defaultSets: 3,
    defaultReps: 12,
    media: {
      thumbnail: "/exercises/single-leg-curl/thumbnail.webp",
    },
    progression: {
      minReps: 10,
      maxReps: 15,
      weightStep: 2.5,
    },
    activation: {
      legs: 100,
    },
    instructions: [
      "Perform the curl one leg at a time.",
      "Pause at peak contraction.",
      "Lower slowly.",
    ],
    tips: [
      "Helps fix imbalances.",
      "Use full range.",
      "Control every rep.",
    ],
    mistakes: [
      "Using momentum.",
      "Rushing the eccentric.",
      "Short reps.",
    ],
    tags: ["unilateral", "hamstrings"],
  },

  {
    id: "good-morning",
    name: "Good Morning",
    primaryMuscle: "legs",
    secondaryMuscles: ["glutes", "back"],
    equipment: "barbell",
    category: "compound",
    difficulty: "advanced",
    defaultRestSeconds: 150,
    defaultSets: 3,
    defaultReps: 8,
    media: {
      thumbnail: "/exercises/good-morning/thumbnail.webp",
    },
    progression: {
      minReps: 6,
      maxReps: 10,
      weightStep: 5,
    },
    activation: {
      legs: 100,
      glutes: 70,
      back: 40,
    },
    instructions: [
      "Rest the bar on your upper back.",
      "Keep knees slightly bent.",
      "Hinge your hips backward.",
      "Lower until you feel a hamstring stretch.",
      "Return by driving the hips forward.",
    ],
    tips: [
      "Brace your core.",
      "Move slowly.",
      "Keep a neutral spine.",
    ],
    mistakes: [
      "Rounding the back.",
      "Squatting instead of hinging.",
      "Using excessive weight.",
    ],
    tags: ["posterior chain", "hinge"],
  },

  {
    id: "glute-ham-raise",
    name: "Glute Ham Raise",
    primaryMuscle: "legs",
    secondaryMuscles: ["glutes"],
    equipment: "bodyweight",
    category: "compound",
    difficulty: "advanced",
    defaultRestSeconds: 120,
    defaultSets: 3,
    defaultReps: 8,
    media: {
      thumbnail: "/exercises/glute-ham-raise/thumbnail.webp",
    },
    progression: {
      minReps: 6,
      maxReps: 10,
      weightStep: 2.5,
    },
    activation: {
      legs: 100,
      glutes: 40,
    },
    instructions: [
      "Secure your feet in the machine.",
      "Lower your body slowly.",
      "Pull yourself back using your hamstrings.",
    ],
    tips: [
      "Keep your hips extended.",
      "Control the eccentric.",
      "Use assistance if needed.",
    ],
    mistakes: [
      "Breaking at the hips.",
      "Dropping too quickly.",
      "Incomplete reps.",
    ],
    tags: ["bodyweight", "strength"],
  },

  {
    id: "nordic-curl",
    name: "Nordic Curl",
    aliases: ["Nordic Hamstring Curl"],
    primaryMuscle: "legs",
    equipment: "bodyweight",
    category: "compound",
    difficulty: "advanced",
    defaultRestSeconds: 120,
    defaultSets: 3,
    defaultReps: 6,
    media: {
      thumbnail: "/exercises/nordic-curl/thumbnail.webp",
    },
    progression: {
      minReps: 5,
      maxReps: 8,
      weightStep: 0,
    },
    activation: {
      legs: 100,
    },
    instructions: [
      "Anchor your feet securely.",
      "Lower your body slowly.",
      "Catch yourself with your hands if needed.",
      "Push lightly and return.",
    ],
    tips: [
      "Focus on the lowering phase.",
      "Keep hips extended.",
      "Stay controlled.",
    ],
    mistakes: [
      "Breaking at the hips.",
      "Dropping too fast.",
      "Using momentum.",
    ],
    tags: ["eccentric", "bodyweight"],
  },
];