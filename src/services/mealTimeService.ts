import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "@/services/db";
import type { MealType } from "@/store/appStore";

/**
 * Per-day meal times, e.g. { breakfast: "09:15", lunch: "13:30" }, in 24h
 * "HH:MM" (matches the native <input type="time"> value format). Stored on
 * the dailyLogs/{date} document itself, which otherwise only exists
 * implicitly as a path prefix for the meals/items subcollections.
 */
export type MealTimes = Partial<Record<MealType, string>>;

function dailyLogRef(uid: string, date: string) {
  return doc(db, "users", uid, "dailyLogs", date);
}

export async function getMealTimes(
  uid: string,
  date: string
): Promise<MealTimes> {
  const snap = await getDoc(dailyLogRef(uid, date));
  const data = snap.data() as { mealTimes?: MealTimes } | undefined;
  return data?.mealTimes ?? {};
}

export async function setMealTime(
  uid: string,
  date: string,
  meal: MealType,
  time: string
): Promise<void> {
  await setDoc(
    dailyLogRef(uid, date),
    { mealTimes: { [meal]: time } },
    { merge: true }
  );
}
