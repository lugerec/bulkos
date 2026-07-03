import type { MacroTargets, UserProfile } from "../types/profile";

export function calculateMacroTargets(profile: UserProfile): MacroTargets {
  const bmr =
    profile.sex === "male"
      ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
      : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;

  const activityMultiplier =
    profile.activity === "low"
      ? 1.35
      : profile.activity === "moderate"
        ? 1.55
        : 1.75;

  const tdee = bmr * activityMultiplier;

  const calories =
    profile.goal === "bulk"
      ? tdee + 250
      : profile.goal === "cut"
        ? tdee - 400
        : tdee;

  const protein = Math.round(profile.weight * 2.1);
  const fat = Math.round(profile.weight * 0.9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return {
    calories: Math.round(calories),
    protein,
    carbs,
    fat,
  };
}