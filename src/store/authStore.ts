import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "../services/auth";
import { createUserProfile } from "../services/userService";
import { getUserProfile } from "../services/user";

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
};

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

        set({
          user,
          profile,
          loading: false,
          error: null,
        });
      } catch {
        // Profile fetch failed or timed out — still let the user into the
        // app; screens handle a missing profile gracefully.
        set({ user, profile: null, loading: false, error: null });
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

      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await createUserProfile(credentials.user.uid, email);

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
      set({
        error: error instanceof Error ? error.message : "Registration failed",
      });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const credentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
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
      set({
        error: error instanceof Error ? error.message : "Login failed",
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