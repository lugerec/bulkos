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

/** Weight drift (kg) from the profile before suggesting a target update. */
export const TARGET_UPDATE_WEIGHT_DRIFT_KG = 2;

/**
 * Macro targets recalculated for the lifter's current body weight (from
 * check-ins) instead of the weight captured at onboarding.
 */
export function getRecalibratedTargets(
  profile: UserProfile,
  currentWeightKg: number
): MacroTargets {
  return calculateMacroTargets({ ...profile, weight: currentWeightKg });
}

/**
 * True once the current body weight has drifted far enough from the weight
 * the targets were computed with to make an update worthwhile.
 */
export function shouldSuggestTargetUpdate(
  profileWeightKg: number,
  currentWeightKg: number
): boolean {
  if (profileWeightKg <= 0 || currentWeightKg <= 0) return false;

  return (
    Math.abs(currentWeightKg - profileWeightKg) >=
    TARGET_UPDATE_WEIGHT_DRIFT_KG
  );
}