import { create } from "zustand";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/config/firebase";
import { toDateKey } from "@/lib/date";

function todayKey() {
  return toDateKey(new Date());
}

type HydrationState = {
  waterMl: number;

  load: (uid: string) => Promise<void>;
  addWater: (uid: string, amount: number) => Promise<void>;
  setWater: (uid: string, amount: number) => Promise<void>;
};

export const useHydrationStore = create<HydrationState>((set, get) => ({
  waterMl: 0,

  async load(uid) {
    const ref = doc(db, "users", uid, "dailyLogs", todayKey());
    const snap = await getDoc(ref);

    set({
      waterMl: snap.exists() ? snap.data().waterMl ?? 0 : 0,
    });
  },

  async addWater(uid, amount) {
    const newValue = Math.max(0, get().waterMl + amount);

    const ref = doc(db, "users", uid, "dailyLogs", todayKey());

    await setDoc(
      ref,
      {
        waterMl: newValue,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    set({ waterMl: newValue });
  },

  async setWater(uid, amount) {
    const newValue = Math.max(0, amount);

    const ref = doc(db, "users", uid, "dailyLogs", todayKey());

    await setDoc(
      ref,
      {
        waterMl: newValue,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    set({ waterMl: newValue });
  },
}));