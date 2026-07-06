import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
  } from "firebase/firestore";
  
  import { db } from "@/services/db";
  import type { BodyMetrics } from "@/types/bodyMetrics";
  
  export async function saveBodyMetrics(
    uid: string,
    data: Omit<BodyMetrics, "id" | "createdAt">
  ) {
    await addDoc(collection(db, "users", uid, "bodyMetrics"), {
      ...data,
      createdAt: serverTimestamp(),
    });
  }
  
  export async function loadBodyMetrics(uid: string) {
    const q = query(
      collection(db, "users", uid, "bodyMetrics"),
      orderBy("date")
    );
  
    const snap = await getDocs(q);
  
    return snap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as BodyMetrics
    );
  }