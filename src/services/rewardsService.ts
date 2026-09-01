import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "@/services/db";
import { EMPTY_STATS, type UserStats } from "@/types/rewards";

/**
 * Rewards live in their own per-user doc (users/{uid}/meta/stats) rather than
 * on the profile, so progression writes stay small and independent of the
 * onboarding profile. Covered by the users/{uid}/** security rule.
 */
function statsRef(uid: string) {
  return doc(db, "users", uid, "meta", "stats");
}

export async function getUserStats(uid: string): Promise<UserStats> {
  const snap = await getDoc(statsRef(uid));
  if (!snap.exists()) return { ...EMPTY_STATS };

  const data = snap.data() as Partial<UserStats>;

  // Merge over defaults so older/partial docs stay valid.
  return {
    ...EMPTY_STATS,
    ...data,
    totals: { ...EMPTY_STATS.totals, ...(data.totals ?? {}) },
    achievements: data.achievements ?? [],
  };
}

export async function saveUserStats(
  uid: string,
  stats: UserStats
): Promise<void> {
  await setDoc(statsRef(uid), stats, { merge: true });
}
