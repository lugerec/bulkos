import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "../services/auth";
import { createUserProfile, updateUserOnboarding } from "../services/userService";
import { getUserProfile, saveUserProfileDoc } from "../services/user";
import type { ExperienceLevel, MacroTargets, UserProfile } from "@/types/profile";

type AuthState = {
  user: User | null;
  profile: any | null;
  loading: boolean;
  error: string | null;

  initAuth: () => () => void;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-fetch the user document (e.g. after targets were updated). */
  refreshProfile: () => Promise<void>;
  /** Persist onboarding and move past it immediately (optimistic). */
  completeOnboarding: (
    profile: UserProfile,
    nutrition: MacroTargets
  ) => Promise<void>;
  updateExperienceLevel: (level: ExperienceLevel) => Promise<void>;
  updateCustomFlag: (
    key: "charts" | "analytics" | "effortRating" | "advancedDashboard",
    value: boolean
  ) => Promise<void>;
};

/** Reject a hanging network call after `ms` so the UI can show a real error. */
async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

/**
 * Firestore reads never time out on their own — a cold or dead connection
 * can hang forever. Every profile fetch goes through this race so the UI
 * is never blocked more than a few seconds.
 */
async function getProfileWithTimeout(uid: string, ms = 6000) {
  return Promise.race([
    getUserProfile(uid),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("profile timeout")), ms)
    ),
  ]);
}

const PROFILE_CACHE_KEY = "bulkos:profile";

/**
 * Persist the last-known profile locally so a slow or failed Firestore read on
 * launch doesn't drop us back into onboarding. Survives app restarts in the
 * Capacitor webview.
 */
function saveCachedProfile(uid: string, profile: unknown) {
  try {
    if (typeof localStorage === "undefined" || !profile) return;
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ uid, profile }));
  } catch {
    // Ignore storage failures — the cache is a best-effort convenience.
  }
}

function loadCachedProfile(uid: string): unknown | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { uid?: string; profile?: unknown };
    return parsed?.uid === uid ? (parsed.profile ?? null) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  refreshProfile: async () => {
    const { user } = get();

    if (!user) return;

    const profile = await getUserProfile(user.uid);

    set({ profile });
  },

  completeOnboarding: async (profileData, nutrition) => {
    const { user, profile } = get();
    if (!user) return;

    // Optimistically mark onboarding done so the app leaves the flow at once,
    // even if the Firestore write is slow or the connection is flaky. Same
    // resilient pattern as updateExperienceLevel below.
    const nextProfile = {
      ...((profile as Record<string, unknown>) ?? {}),
      profile: profileData,
      nutrition,
      onboardingCompleted: true,
    };
    set({ profile: nextProfile });
    saveCachedProfile(user.uid, nextProfile);

    try {
      await updateUserOnboarding(user.uid, profileData, nutrition);
    } catch {
      // Non-fatal — local state already reflects completion and Firestore
      // will retry the queued write when possible.
    }
  },

  updateExperienceLevel: async (level) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    const nextInner = { ...profile.profile, experienceLevel: level };
    set({ profile: { ...profile, profile: nextInner } });

    try {
      await saveUserProfileDoc(user.uid, { profile: nextInner });
    } catch {
      // Non-fatal — local state already reflects the choice.
    }
  },

  updateCustomFlag: async (key, value) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    const nextInner = {
      ...profile.profile,
      customFlags: { ...profile.profile.customFlags, [key]: value },
    };
    set({ profile: { ...profile, profile: nextInner } });

    try {
      await saveUserProfileDoc(user.uid, { profile: nextInner });
    } catch {
      // Non-fatal
    }
  },

  initAuth: () => {
    // Safety net: if anything below never resolves (flaky network, native
    // webview quirks, Firestore waiting forever for a connection), stop
    // blocking the UI after a few seconds. Deliberately NOT cleared when the
    // auth callback starts — only on unmount — because the callback itself
    // can hang on the profile fetch; if everything resolves normally this
    // fires as a harmless no-op.
    const failSafe = setTimeout(() => {
      if (get().loading) set({ loading: false });
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        set({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });

        return;
      }

      try {
        const profile = await getProfileWithTimeout(user.uid);

        saveCachedProfile(user.uid, profile);

        set({
          user,
          profile,
          loading: false,
          error: null,
        });
      } catch {
        // Profile fetch failed or timed out — fall back to the last-known
        // cached profile so a flaky read doesn't re-trigger onboarding. Only
        // null if we've genuinely never loaded it.
        set({
          user,
          profile: loadCachedProfile(user.uid),
          loading: false,
          error: null,
        });
      }
    });

    return () => {
      clearTimeout(failSafe);
      unsubscribe();
    };
  },

  register: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const credentials = await withTimeout(
        createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password),
        12000,
        "Can't reach the sign-up server — check your connection and try again."
      );

      await createUserProfile(credentials.user.uid, email.trim().toLowerCase());

      let profile = null;

      try {
        profile = await getProfileWithTimeout(credentials.user.uid);
      } catch {
        // Slow read right after create — proceed; screens handle it.
      }

      set({
        user: credentials.user,
        profile,
      });
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? ` [${(error as { code: string }).code}]`
          : "";

      set({
        error:
          (error instanceof Error
            ? error.message
            : "Registration failed") + code,
      });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const credentials = await withTimeout(
        // iOS keyboards love to append a space or capitalize the email —
        // normalise so a stray autocorrect can't fail the login.
        signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password),
        12000,
        "Can't reach the sign-in server — check your connection and try again."
      );

      let profile = null;

      try {
        profile = await getProfileWithTimeout(credentials.user.uid);
      } catch {
        // Slow/absent profile shouldn't block getting into the app.
      }

      set({
        user: credentials.user,
        profile,
      });
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? ` [${(error as { code: string }).code}]`
          : "";

      set({
        error:
          (error instanceof Error ? error.message : "Login failed") + code,
      });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });

      await signOut(auth);

      set({
        user: null,
        profile: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Logout failed",
      });
    } finally {
      set({ loading: false });
    }
  },
}));