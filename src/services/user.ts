import { db } from "./db";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function saveUserProfile(uid: string, profile: any) {
  await setDoc(
    doc(db, "users", uid),
    {
      ...profile,
      onboardingCompleted: true,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Merge a partial patch into the user document as-is (no root spreading),
 * e.g. { profile: {...updated} }. Use for targeted updates like changing
 * the experience level without rewriting the whole doc shape.
 */
export async function saveUserProfileDoc(
  uid: string,
  patch: Record<string, unknown>
) {
  await setDoc(
    doc(db, "users", uid),
    { ...patch, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));

  if (!snap.exists()) return null;

  return snap.data();
}