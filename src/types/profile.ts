export type Goal = "bulk" | "cut" | "maintain";
export type Sex = "male" | "female";
export type ActivityLevel = "low" | "moderate" | "high";
export type TrainingFrequency = 3 | 4 | 5 | 6;

/**
 * How much detail and analysis the app surfaces. Beginners get a simple
 * "what to do today" experience; advanced users unlock full analytics.
 * `custom` lets the user toggle sections themselves.
 */
export type ExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "custom";

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
  /** Optional for back-compat with profiles created before this existed. */
  experienceLevel?: ExperienceLevel;
  /** Per-section overrides, used when experienceLevel === "custom". */
  customFlags?: {
    charts?: boolean;
    analytics?: boolean;
    effortRating?: boolean;
    advancedDashboard?: boolean;
  };
};

export type MacroTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};