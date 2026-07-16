export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "legs"
  | "glutes"
  | "calves"
  | "abs"
  | "neck"
  | "cardio"
  | "fullBody";

export type Equipment =
  | "barbell"
  | "ezBar"
  | "dumbbell"
  | "machine"
  | "smithMachine"
  | "cable"
  | "bodyweight"
  | "kettlebell"
  | "resistanceBand"
  | "medicineBall"
  | "plate"
  | "landmine"
  | "other";

export type ExerciseCategory =
  | "compound"
  | "isolation"
  | "cardio"
  | "mobility";

export type ExerciseDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export type ExerciseMedia = {
  thumbnail?: string;
  start?: string;
  finish?: string;
  muscles?: string;
  video?: string;
  gif?: string;
};

export type ExerciseProgression = {
  minReps: number;
  maxReps: number;
  weightStep: number;
};

export type MuscleActivation = Partial<Record<MuscleGroup, number>>;

export type ExerciseDefinition = {
  id: string;
  name: string;
  aliases?: string[];

  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];

  equipment: Equipment;
  category: ExerciseCategory;
  difficulty?: ExerciseDifficulty;

  defaultRestSeconds: number;
  defaultSets: number;
  defaultReps: number;

  instructions?: string[];
  tips?: string[];
  mistakes?: string[];

  tags?: string[];

  media?: ExerciseMedia;
  progression?: ExerciseProgression;
  activation?: MuscleActivation;
};

export type SetEffort = "easy" | "moderate" | "hard";

export type WorkoutSet = {
  reps: number;
  weight: number;
  completed?: boolean;
  /** How the set felt — a simple 3-level effort rating. */
  effort?: SetEffort;
};

export type WorkoutExercise = {
  id: string;
  exerciseId?: string;
  name: string;
  sets: WorkoutSet[];
  notes?: string;
  restSeconds?: number;
  targetReps?: string;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type WorkoutLog = {
  id: string;
  templateId: string;
  name: string;
  completedSets: number;
  totalSets: number;
  volumeKg: number;
  durationSeconds: number;
  date: string;
  createdAt: Date;
  exercises?: WorkoutExercise[];
};