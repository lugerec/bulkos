import { useAuthStore } from "@/store/authStore";
import {
  getFeatureFlags,
  type FeatureFlags,
} from "@/features/settings/experienceLevel";

/**
 * Resolves which optional UI sections to show for the current user, based on
 * their experience level. Legacy profiles (no level set) fall back to the
 * default via getFeatureFlags. Use this to gate charts/analytics/etc.
 */
export function useFeatureFlags(): FeatureFlags {
  const userDoc = useAuthStore((s) => s.profile);

  // The store holds the whole Firestore doc: { profile: {...}, nutrition, ... }
  // so the level lives at profile.profile.experienceLevel.
  const level = userDoc?.profile?.experienceLevel;
  const base = getFeatureFlags(level);

  // In custom mode, apply the user's per-section overrides on top of the base.
  if (level === "custom" && userDoc?.profile?.customFlags) {
    const overrides = userDoc.profile.customFlags;

    return {
      charts: overrides.charts ?? base.charts,
      analytics: overrides.analytics ?? base.analytics,
      effortRating: overrides.effortRating ?? base.effortRating,
      advancedDashboard:
        overrides.advancedDashboard ?? base.advancedDashboard,
    };
  }

  return base;
}
