import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

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

export async function saveWorkout(input: SaveWorkoutInput): Promise<string> {
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

  const ref = await addDoc(collection(db, "users", uid, "workoutLogs"), {
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

  return ref.id;
}

/** Attach the user's post-workout "how did it feel" rating to a saved log. */
export async function updateWorkoutRating(
  uid: string,
  workoutId: string,
  sessionRating: SetEffort
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "workoutLogs", workoutId), {
    sessionRating,
  });
}