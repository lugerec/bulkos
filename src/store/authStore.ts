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
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  initAuth: () => {
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

      const profile = await getUserProfile(user.uid);

      set({
        user,
        profile,
        loading: false,
        error: null,
      });
    });

    return unsubscribe;
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

      const profile = await getUserProfile(credentials.user.uid);

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

      const profile = await getUserProfile(credentials.user.uid);

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