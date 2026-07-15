import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/services/db";

export type GroceryItemSource = "custom" | "off" | "meal";

export type GroceryItem = {
  id: string;
  name: string;
  checked: boolean;
  source: GroceryItemSource;
};

function itemsRef(uid: string) {
  return collection(db, "users", uid, "groceryItems");
}

export async function getGroceryItems(uid: string): Promise<GroceryItem[]> {
  const snapshot = await getDocs(
    query(itemsRef(uid), orderBy("createdAt", "asc"))
  );

  return snapshot.docs.map((document) => {
    const data = document.data();

    return {
      id: document.id,
      name: typeof data.name === "string" ? data.name : "",
      checked: data.checked === true,
      source:
        data.source === "off" || data.source === "meal"
          ? data.source
          : "custom",
    };
  });
}

export async function addGroceryItem(
  uid: string,
  name: string,
  source: GroceryItemSource
): Promise<GroceryItem> {
  const created = await addDoc(itemsRef(uid), {
    name,
    checked: false,
    source,
    createdAt: serverTimestamp(),
  });

  return { id: created.id, name, checked: false, source };
}

export async function setGroceryItemChecked(
  uid: string,
  itemId: string,
  checked: boolean
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "groceryItems", itemId), { checked });
}

export async function deleteGroceryItem(
  uid: string,
  itemId: string
): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "groceryItems", itemId));
}
