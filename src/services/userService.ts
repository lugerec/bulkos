import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./db";

export async function createUserProfile(uid: string, email: string) {
  const ref = doc(db, "users", uid);

  const existing = await getDoc(ref);

  if (existing.exists()) return;

  await setDoc(ref, {
    email,
    createdAt: new Date(),

    profile: {
      name: "",
      age: null,
      sex: "",
      height: null,
      weight: null,
      goalWeight: null,
      activity: "",
      goal: "bulk",
    },

    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  });
}

import type { MacroTargets, UserProfile } from "../types/profile";

export async function updateUserOnboarding(
  uid: string,
  profile: UserProfile,
  nutrition: MacroTargets
) {
  const ref = doc(db, "users", uid);

  await setDoc(
    ref,
    {
      profile,
      nutrition,
      onboardingCompleted: true,
      updatedAt: new Date(),
    },
    { merge: true }
  );
}

/**
 * Persist recalibrated macro targets together with the body weight they
 * were computed from, so future drift is measured against it.
 */
export async function updateNutritionTargets(
  uid: string,
  weightKg: number,
  nutrition: MacroTargets
) {
  const ref = doc(db, "users", uid);

  await setDoc(
    ref,
    {
      profile: { weight: weightKg },
      nutrition,
      updatedAt: new Date(),
    },
    { merge: true }
  );
}