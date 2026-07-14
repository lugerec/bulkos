import type { ExerciseDefinition } from "@/types/workout";

export const calvesExercises: ExerciseDefinition[] = [
  {
    id: "standing-calf-raise",
    name: "Standing Calf Raise",
    aliases: ["Machine Standing Calf Raise"],
    primaryMuscle: "calves",
    equipment: "machine",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 60,
    defaultSets: 4,
    defaultReps: 12,
    media: {
      thumbnail: "/exercises/standing-calf-raise/thumbnail.webp",
    },
    progression: {
      minReps: 10,
      maxReps: 15,
      weightStep: 5,
    },
    activation: {
      calves: 100,
    },
    instructions: [
      "Place the balls of your feet on the platform.",
      "Keep your knees nearly straight.",
      "Lower your heels until you feel a stretch.",
      "Push through your toes to raise your heels.",
      "Pause briefly at the top before lowering.",
    ],
    tips: [
      "Use a full range of motion.",
      "Pause at the stretched position.",
      "Control every repetition.",
    ],
    mistakes: [
      "Bouncing at the bottom.",
      "Using only partial reps.",
      "Rushing the movement.",
    ],
    tags: ["calves", "machine", "standing"],
  },

  {
    id: "seated-calf-raise",
    name: "Seated Calf Raise",
    primaryMuscle: "calves",
    equipment: "machine",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 60,
    defaultSets: 4,
    defaultReps: 15,
    media: {
      thumbnail: "/exercises/seated-calf-raise/thumbnail.webp",
    },
    progression: {
      minReps: 12,
      maxReps: 18,
      weightStep: 5,
    },
    activation: {
      calves: 100,
    },
    instructions: [
      "Sit with the pads resting on your thighs.",
      "Place the balls of your feet on the platform.",
      "Lower your heels under control.",
      "Press through your toes until fully contracted.",
      "Pause briefly before lowering again.",
    ],
    tips: [
      "Do not bounce.",
      "Use a controlled tempo.",
      "Fully stretch the calves every rep.",
    ],
    mistakes: [
      "Stopping halfway.",
      "Moving too quickly.",
      "Using excessive weight.",
    ],
    tags: ["calves", "machine", "soleus"],
  },

  {
    id: "single-leg-calf-raise",
    name: "Single Leg Calf Raise",
    primaryMuscle: "calves",
    equipment: "bodyweight",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 45,
    defaultSets: 3,
    defaultReps: 15,
    media: {
      thumbnail: "/exercises/single-leg-calf-raise/thumbnail.webp",
    },
    progression: {
      minReps: 12,
      maxReps: 20,
      weightStep: 2.5,
    },
    activation: {
      calves: 100,
    },
    instructions: [
      "Stand on one foot on the edge of a step.",
      "Lower your heel below the step.",
      "Rise as high as possible onto your toes.",
      "Lower slowly and repeat.",
    ],
    tips: [
      "Use support only for balance.",
      "Pause at the top.",
      "Move through full range.",
    ],
    mistakes: [
      "Using momentum.",
      "Cutting the range short.",
      "Leaning excessively.",
    ],
    tags: ["bodyweight", "unilateral", "balance"],
  },

  {
    id: "smith-calf-raise",
    name: "Smith Machine Calf Raise",
    primaryMuscle: "calves",
    equipment: "smithMachine",
    category: "isolation",
    difficulty: "intermediate",
    defaultRestSeconds: 60,
    defaultSets: 4,
    defaultReps: 12,
    media: {
      thumbnail: "/exercises/smith-calf-raise/thumbnail.webp",
    },
    progression: {
      minReps: 10,
      maxReps: 15,
      weightStep: 5,
    },
    activation: {
      calves: 100,
    },
    instructions: [
      "Stand on a platform under the Smith bar.",
      "Lower your heels slowly.",
      "Drive upward onto your toes.",
      "Pause at full contraction.",
    ],
    tips: [
      "Keep knees almost straight.",
      "Use a controlled tempo.",
      "Focus on squeezing the calves.",
    ],
    mistakes: [
      "Bouncing.",
      "Locking knees aggressively.",
      "Partial reps.",
    ],
    tags: ["smith", "standing", "strength"],
  },

  {
    id: "donkey-calf-raise",
    name: "Donkey Calf Raise",
    primaryMuscle: "calves",
    equipment: "machine",
    category: "isolation",
    difficulty: "intermediate",
    defaultRestSeconds: 60,
    defaultSets: 3,
    defaultReps: 15,
    media: {
      thumbnail: "/exercises/donkey-calf-raise/thumbnail.webp",
    },
    progression: {
      minReps: 12,
      maxReps: 18,
      weightStep: 5,
    },
    activation: {
      calves: 100,
    },
    instructions: [
      "Position yourself in the donkey calf machine.",
      "Stretch your calves fully.",
      "Push onto your toes as high as possible.",
      "Lower under control.",
    ],
    tips: [
      "Hold the peak contraction.",
      "Use a slow eccentric.",
      "Stay controlled.",
    ],
    mistakes: [
      "Short range of motion.",
      "Using momentum.",
      "Rushing the set.",
    ],
    tags: ["donkey", "stretch", "machine"],
  },

  {
    id: "leg-press-calf-raise",
    name: "Leg Press Calf Raise",
    primaryMuscle: "calves",
    equipment: "machine",
    category: "isolation",
    difficulty: "beginner",
    defaultRestSeconds: 60,
    defaultSets: 4,
    defaultReps: 15,
    media: {
      thumbnail: "/exercises/leg-press-calf-raise/thumbnail.webp",
    },
    progression: {
      minReps: 12,
      maxReps: 18,
      weightStep: 10,
    },
    activation: {
      calves: 100,
    },
    instructions: [
      "Place the balls of your feet on the bottom edge of the platform.",
      "Keep your knees nearly locked.",
      "Lower your heels until stretched.",
      "Press through your toes to full contraction.",
    ],
    tips: [
      "Do not bend your knees.",
      "Use full range.",
      "Control every rep.",
    ],
    mistakes: [
      "Turning it into a leg press.",
      "Using momentum.",
      "Partial reps.",
    ],
    tags: ["leg press", "machine", "calves"],
  },
];