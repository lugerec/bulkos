import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";

import { db } from "./db";
import type { FoodItem } from "../types/food";

/** Shared, app-wide food database (curated + verified entries). */
export async function getFoods(): Promise<FoodItem[]> {
  const q = query(collection(db, "foods"), orderBy("name"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<FoodItem, "id">),
  }));
}

/**
 * A user's own foods (scanned barcodes, manual entries) under
 * users/{uid}/customFoods. Kept private and merged on top of the shared
 * database so a lifter's own products are found even offline of Open Food
 * Facts.
 */
export async function getUserFoods(uid: string): Promise<FoodItem[]> {
  const q = query(
    collection(db, "users", uid, "customFoods"),
    orderBy("name")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<FoodItem, "id">),
  }));
}

/**
 * Save (or overwrite) a food in the user's own database. The food's id is the
 * doc id, so re-saving the same barcode (`off-<code>`) updates in place rather
 * than duplicating.
 */
export async function saveUserFood(
  uid: string,
  food: FoodItem
): Promise<void> {
  const { id, ...data } = food;

  await setDoc(doc(db, "users", uid, "customFoods", id), data);
}

export async function deleteUserFood(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "customFoods", id));
}

/** A user's favorite foods under users/{uid}/favoriteFoods for quick-add. */
export async function getFavoriteFoods(uid: string): Promise<FoodItem[]> {
  const q = query(
    collection(db, "users", uid, "favoriteFoods"),
    orderBy("name")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<FoodItem, "id">),
  }));
}

export async function addFavoriteFood(
  uid: string,
  food: FoodItem
): Promise<void> {
  const { id, ...data } = food;

  await setDoc(doc(db, "users", uid, "favoriteFoods", id), data);
}

export async function removeFavoriteFood(
  uid: string,
  foodId: string
): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "favoriteFoods", foodId));
}
