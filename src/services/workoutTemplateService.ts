import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
  } from "firebase/firestore";
  
  import { db } from "@/config/firebase";
  import type { WorkoutTemplate } from "@/types/workout";
  
  export async function loadWorkoutTemplates(uid: string) {
    const q = query(
      collection(db, "users", uid, "workoutTemplates"),
      orderBy("createdAt")
    );
  
    const snap = await getDocs(q);
  
    return snap.docs.map(
      (docSnap) =>
        ({
          id: docSnap.id,
          ...docSnap.data(),
        }) as WorkoutTemplate
    );
  }
  
  export async function saveWorkoutTemplate(
    uid: string,
    template: WorkoutTemplate
  ) {
    const ref = doc(db, "users", uid, "workoutTemplates", template.id);
  
    await setDoc(
      ref,
      {
        ...template,
        updatedAt: serverTimestamp(),
        createdAt: template.createdAt ?? serverTimestamp(),
      },
      { merge: true }
    );
  }
  
  export async function deleteWorkoutTemplate(uid: string, templateId: string) {
    await deleteDoc(doc(db, "users", uid, "workoutTemplates", templateId));
  }