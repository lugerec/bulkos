import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "@/services/db";
import type { Friend, PublicProfile } from "@/types/social";

/**
 * Social graph is intentionally simple: a one-way "follow" so no accept flow
 * and no cross-user writes are needed (each user only writes their own
 * friends subcollection). Progression comparison reads friends' publicProfiles.
 *
 * Firestore rules required (see notes): publicProfiles readable by any signed-in
 * user, writable only by its owner; the friends list is under
 * users/{uid}/** which the existing per-user rule already covers.
 */

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

export function generateFriendCode(): string {
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

function publicRef(uid: string) {
  return doc(db, "publicProfiles", uid);
}

export async function getPublicProfile(
  uid: string
): Promise<PublicProfile | null> {
  const snap = await getDoc(publicRef(uid));
  return snap.exists() ? (snap.data() as PublicProfile) : null;
}

/**
 * Create/update the public mirror. Preserves an existing friendCode; only
 * generates one the first time.
 */
export async function upsertPublicProfile(
  uid: string,
  data: { displayName: string; level: number; xp: number; streak: number }
): Promise<void> {
  const existing = await getPublicProfile(uid);

  const profile: PublicProfile = {
    uid,
    displayName: data.displayName,
    level: data.level,
    xp: data.xp,
    streak: data.streak,
    friendCode: existing?.friendCode ?? generateFriendCode(),
  };

  await setDoc(
    publicRef(uid),
    { ...profile, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/** Look up a public profile by its shareable friend code. */
export async function findProfileByCode(
  code: string
): Promise<PublicProfile | null> {
  const q = query(
    collection(db, "publicProfiles"),
    where("friendCode", "==", code.toUpperCase().trim()),
    limit(1)
  );

  const snap = await getDocs(q);
  return snap.empty ? null : (snap.docs[0].data() as PublicProfile);
}

// MARK: - Friends (one-way follow)

function friendRef(uid: string, friendUid: string) {
  return doc(db, "users", uid, "friends", friendUid);
}

export async function addFriend(uid: string, friendUid: string): Promise<void> {
  await setDoc(friendRef(uid, friendUid), {
    uid: friendUid,
    since: Date.now(),
  } satisfies Friend);
}

export async function removeFriend(
  uid: string,
  friendUid: string
): Promise<void> {
  await deleteDoc(friendRef(uid, friendUid));
}

export async function getFriendUids(uid: string): Promise<string[]> {
  const snap = await getDocs(collection(db, "users", uid, "friends"));
  return snap.docs.map((d) => d.id);
}

/** Fetch the public profiles of everyone the user follows. */
export async function getFriendProfiles(
  uid: string
): Promise<PublicProfile[]> {
  const uids = await getFriendUids(uid);

  const profiles = await Promise.all(
    uids.map((friendUid) => getPublicProfile(friendUid).catch(() => null))
  );

  return profiles.filter((p): p is PublicProfile => p !== null);
}
