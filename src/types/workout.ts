export type WorkoutSet = {
    reps: number;
    weight: number;
  };
  
  export type WorkoutExercise = {
    id: string;
    name: string;
    sets: WorkoutSet[];
    notes?: string;
  };
  
  export type WorkoutTemplate = {
    id: string;
    name: string;
    description: string;
    exercises: WorkoutExercise[];
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
  };