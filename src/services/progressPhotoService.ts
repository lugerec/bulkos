import { Capacitor } from "@capacitor/core";

/**
 * Progress photos are stored on-device only, not in the cloud.
 *
 * As of Feb 2026 Firebase Cloud Storage requires a linked billing account
 * (Blaze plan) just to create a bucket at all, even though actual usage for
 * a handful of check-in photos would stay within the free tier. Rather than
 * make the user attach a card for a feature this minor, photos are written
 * to the app's private local storage via Filesystem — genuinely free, one
 * fewer moving part (no Storage security rules to misconfigure), at the
 * cost of no cross-device sync/backup. Fine for a nice-to-have feature;
 * everything else (workouts, food, XP) still lives in Firestore.
 */

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Filesystem wants raw base64, not a data: URL.
      resolve(result.split(",")[1] ?? result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Save a progress photo locally and return a reference to store on the
 * check-in (a native URI on device, a temporary blob URL on web/dev — the
 * web path never persists across reloads, matching that native is the only
 * real target for this feature).
 */
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
}): Promise<string> {
  if (!Capacitor.isNativePlatform()) {
    return URL.createObjectURL(file);
  }

  const { Filesystem, Directory } = await import("@capacitor/filesystem");

  const base64 = await fileToBase64(file);
  const path = `progress-photos/${uid}/${date}/${type}.jpg`;

  const result = await Filesystem.writeFile({
    path,
    data: base64,
    directory: Directory.Data,
    recursive: true,
  });

  return result.uri;
}

/**
 * Turn a stored photo reference into something an <img> can load. Native
 * file URIs need Capacitor's scheme conversion to be loadable inside the
 * webview; http(s)/blob references (web fallback, or any future cloud URL)
 * are already directly usable.
 */
export function resolvePhotoSrc(pathOrUri: string): string {
  if (/^(https?:|blob:|data:)/.test(pathOrUri)) {
    return pathOrUri;
  }

  return Capacitor.convertFileSrc(pathOrUri);
}
