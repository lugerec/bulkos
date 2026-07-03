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