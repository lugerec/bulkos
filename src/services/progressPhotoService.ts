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

/** Path inside Directory.Documents. Relative on purpose — see below. */
export function progressPhotoPath(
  uid: string,
  date: string,
  type: "front" | "side" | "back"
): string {
  return `progress-photos/${uid}/${date}/${type}.jpg`;
}

/**
 * Save a progress photo locally and return the reference to persist on the
 * check-in: a *relative* path on device, a temporary blob URL on web/dev.
 *
 * Deliberately not `writeFile()`'s returned absolute URI — that contains the
 * app container UUID, which iOS regenerates on every (re)install. Storing it
 * meant every photo silently 404'd after the next build was installed.
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
  // Documents is the directory Capacitor explicitly documents for user-
  // generated content, and (on iOS) is what gets included in the user's
  // own iCloud device backup — so a phone replaced via "Restore from iCloud
  // backup" brings progress photos back automatically.

  const base64 = await fileToBase64(file);
  const path = progressPhotoPath(uid, date, type);

  await Filesystem.writeFile({
    path,
    data: base64,
    directory: Directory.Documents,
    recursive: true,
  });

  return path;
}

/** Entries written before the fix stored a full file:// URI — recover the tail. */
function toRelativePath(stored: string): string {
  const marker = "/Documents/";
  const index = stored.indexOf(marker);

  if (index === -1) return stored;

  try {
    return decodeURI(stored.slice(index + marker.length));
  } catch {
    return stored.slice(index + marker.length);
  }
}

/**
 * Turn a stored photo reference into something an <img> can load. On device
 * the container path has to be re-derived at read time and run through
 * Capacitor's scheme conversion; http(s)/blob references (web fallback, or
 * any future cloud URL) are already directly usable.
 */
export async function resolvePhotoSrc(stored: string): Promise<string> {
  if (/^(https?:|blob:|data:)/.test(stored)) {
    return stored;
  }

  if (!Capacitor.isNativePlatform()) {
    return stored;
  }

  const { Filesystem, Directory } = await import("@capacitor/filesystem");

  const { uri } = await Filesystem.getUri({
    directory: Directory.Documents,
    path: toRelativePath(stored),
  });

  return Capacitor.convertFileSrc(uri);
}
