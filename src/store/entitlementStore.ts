import { create } from "zustand";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "@/services/db";
import { useAuthStore } from "./authStore";

/**
 * Pro entitlement.
 *
 * The source of truth for a real purchase is the store receipt (via
 * RevenueCat), but we mirror the resulting status to Firestore so the app
 * knows the tier immediately on launch, offline, and on a second device,
 * without blocking the UI on a billing round-trip.
 *
 * Deliberately *not* a security boundary: everything gated here is a
 * convenience feature, never data the user already owns. Losing Pro must
 * never lock someone out of their own logs.
 */
type EntitlementState = {
  isPro: boolean;
  loaded: boolean;

  loadEntitlement: () => Promise<void>;
  /** Persist the tier after a purchase/restore resolves. */
  setPro: (isPro: boolean) => Promise<void>;
};

function currentUid(): string | null {
  return useAuthStore.getState().user?.uid ?? null;
}

function entitlementRef(uid: string) {
  return doc(db, "users", uid, "meta", "entitlement");
}

export const useEntitlementStore = create<EntitlementState>((set) => ({
  isPro: false,
  loaded: false,

  loadEntitlement: async () => {
    const uid = currentUid();
    if (!uid) return;

    try {
      const snap = await getDoc(entitlementRef(uid));
      const data = snap.data() as { isPro?: boolean } | undefined;
      set({ isPro: data?.isPro === true, loaded: true });
    } catch {
      // Fail closed on the flag but never block the app — free tier is fully
      // usable, so a failed read just means no Pro extras this session.
      set({ loaded: true });
    }
  },

  setPro: async (isPro) => {
    const uid = currentUid();
    set({ isPro });

    if (!uid) return;

    try {
      await setDoc(
        entitlementRef(uid),
        { isPro, updatedAt: Date.now() },
        { merge: true }
      );
    } catch {
      // Local state already reflects it; a later load will resync.
    }
  },
}));
