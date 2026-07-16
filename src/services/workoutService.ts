import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/services/db";
import type { WorkoutExercise, SetEffort } from "@/types/workout";

type LoggedWorkoutExercise = WorkoutExercise & {
  sets: {
    reps: number;
    weight: number;
    completed: boolean;
    effort?: SetEffort;
  }[];
};

type SaveWorkoutInput = {
  uid: string;
  date: string;
  templateId: string;
  name: string;
  durationSeconds: number;
  completedSets: number;
  totalSets: number;
  volumeKg: number;
  exercises: LoggedWorkoutExercise[];
};

export async function saveWorkout(input: SaveWorkoutInput) {
  const {
    uid,
    date,
    templateId,
    name,
    durationSeconds,
    completedSets,
    totalSets,
    volumeKg,
    exercises,
  } = input;

  await addDoc(collection(db, "users", uid, "workoutLogs"), {
    date,
    templateId,
    name,
    durationSeconds,
    completedSets,
    totalSets,
    volumeKg,
    exercises,
    createdAt: serverTimestamp(),
  });
}