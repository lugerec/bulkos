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
  const profile = useAuthStore((s) => s.profile);

  return getFeatureFlags(profile?.experienceLevel);
}
