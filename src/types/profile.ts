export type Goal = "bulk" | "cut" | "maintain";
export type Sex = "male" | "female";
export type ActivityLevel = "low" | "moderate" | "high";
export type TrainingFrequency = 3 | 4 | 5 | 6;

export type UserProfile = {
  name: string;
  age: number;
  sex: Sex;
  height: number;
  weight: number;
  goalWeight: number;
  goal: Goal;
  activity: ActivityLevel;
  trainingFrequency: TrainingFrequency;
};

export type MacroTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};