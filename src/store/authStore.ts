import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "../services/auth";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;

  initAuth: () => () => void;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({
        user,
        loading: false,
        error: null,
      });
    });

    return unsubscribe;
  },

  register: async (email, password) => {
    try {
      set({ loading: true, error: null });
      await createUserWithEmailAndPassword(auth, email, password);
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
      await signInWithEmailAndPassword(auth, email, password);
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
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Logout failed",
      });
    } finally {
      set({ loading: false });
    }
  },
}));