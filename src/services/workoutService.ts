import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/services/db";

type SaveWorkoutInput = {
  uid: string;
  date: string;
  name: string;
  durationSeconds: number;
  completedSets: number;
  totalSets: number;
  volumeKg: number;
  templateId: string;
};

export async function saveWorkout(input: SaveWorkoutInput) {
  const {
    uid,
    date,
    name,
    durationSeconds,
    completedSets,
    totalSets,
    volumeKg,
  } = input;

  await addDoc(collection(db, "users", uid, "workoutLogs"), {
    date,
    name,
    durationSeconds,
    completedSets,
    totalSets,
    volumeKg,
    createdAt: serverTimestamp(),
    templateId,
  });
}