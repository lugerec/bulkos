import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "./storage";

export async function uploadProgressPhoto({
  uid,
  date,
  type,
  file,
}: {
  uid: string;
  date: string;
  type: "front" | "side" | "back";
  file: File;
}) {
  const fileRef = ref(
    storage,
    `users/${uid}/progressPhotos/${date}/${type}-${file.name}`
  );

  await uploadBytes(fileRef, file);

  return getDownloadURL(fileRef);
}