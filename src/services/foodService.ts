import {
    collection,
    getDocs,
    query,
    orderBy,
  } from "firebase/firestore";
  
  import { db } from "./db";
  import type { FoodItem } from "../types/food";
  
  export async function getFoods(): Promise<FoodItem[]> {
    const q = query(
      collection(db, "foods"),
      orderBy("name")
    );
  
    const snapshot = await getDocs(q);
  
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<FoodItem, "id">),
    }));
  }