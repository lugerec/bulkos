import type { ExerciseDefinition } from "@/types/workout";

export const absExercises: ExerciseDefinition[] = [
  {
    id: "cable-crunch",
    name: "Cable Crunch",
    aliases: ["Kneeling Cable Crunch"],
  
    primaryMuscle: "abs",
  
    equipment: "cable",
    category: "isolation",
    difficulty: "beginner",
  
    defaultRestSeconds: 60,
    defaultSets: 3,
    defaultReps: 15,
  
    media: {
      thumbnail: "/exercises/cable-crunch/thumbnail.webp",
    },
  
    progression: {
      minReps: 12,
      maxReps: 15,
      weightStep: 2.5,
    },
  
    activation: {
      abs: 100,
    },
  
    instructions: [
      "Kneel facing the cable stack.",
      "Hold the rope beside your head.",
      "Crunch your torso downward.",
      "Exhale while contracting your abs.",
      "Return slowly to the starting position.",
    ],
  
    tips: [
      "Move through your spine, not your hips.",
      "Keep constant abdominal tension.",
      "Control the eccentric phase.",
    ],
  
    mistakes: [
      "Pulling with the arms.",
      "Moving only at the hips.",
      "Using excessive weight.",
    ],
  
    tags: ["abs", "cable", "core"],
  }
];