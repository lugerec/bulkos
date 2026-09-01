import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "@/services/db";
import type {
  ActivityEvent,
  ActivityKind,
  FeedItem,
  Friend,
  PublicProfile,
} from "@/types/social";

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
 * generates one the first time. A displayName the user set explicitly (via
 * setDisplayName) wins over the onboarding name passed by progression
 * updates, so routine XP syncs never clobber a chosen nickname.
 */
export async function upsertPublicProfile(
  uid: string,
  data: { displayName: string; level: number; xp: number; streak: number },
  options: { overrideName?: boolean } = {}
): Promise<void> {
  const existing = await getPublicProfile(uid);

  const displayName =
    !options.overrideName && existing?.nameLocked
      ? existing.displayName
      : data.displayName;

  const profile: PublicProfile = {
    uid,
    displayName,
    level: data.level,
    xp: data.xp,
    streak: data.streak,
    friendCode: existing?.friendCode ?? generateFriendCode(),
    ...(options.overrideName || existing?.nameLocked ? { nameLocked: true } : {}),
  };

  await setDoc(
    publicRef(uid),
    { ...profile, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/** Set a chosen public nickname; locks it against later profile-name syncs. */
export async function setDisplayName(
  uid: string,
  displayName: string
): Promise<void> {
  const existing = await getPublicProfile(uid);

  await upsertPublicProfile(
    uid,
    {
      displayName,
      level: existing?.level ?? 1,
      xp: existing?.xp ?? 0,
      streak: existing?.streak ?? 0,
    },
    { overrideName: true }
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

// MARK: - Activity feed

/** Keep only recent items so the public trail stays small. */
const FEED_PER_USER = 10;

/**
 * Publish an activity item to the owner's public trail. Best-effort: a failure
 * here must never block the action that produced it.
 */
export async function publishActivity(
  uid: string,
  kind: ActivityKind,
  text: string
): Promise<void> {
  await addDoc(collection(db, "publicProfiles", uid, "activity"), {
    uid,
    kind,
    text,
    createdAt: Date.now(),
  });
}

/** Most recent activity items for one user. */
async function getUserActivity(uid: string): Promise<ActivityEvent[]> {
  const q = query(
    collection(db, "publicProfiles", uid, "activity"),
    orderBy("createdAt", "desc"),
    limit(FEED_PER_USER)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<ActivityEvent, "id">),
  }));
}

/**
 * Combined, newest-first feed of the user's friends (and themselves), joined
 * with display names. Pass `profiles` when the caller already loaded them to
 * avoid re-reading every profile. Per-user failures are skipped rather than
 * failing the whole feed.
 */
export async function getFriendFeed(
  uid: string,
  options: { profiles?: PublicProfile[]; limitItems?: number } = {}
): Promise<FeedItem[]> {
  const { limitItems = 30 } = options;

  let all: PublicProfile[];
  if (options.profiles) {
    all = options.profiles;
  } else {
    const friends = await getFriendProfiles(uid);
    const mine = await getPublicProfile(uid);
    all = mine ? [mine, ...friends] : friends;
  }

  const perUser = await Promise.all(
    all.map(async (profile) => {
      try {
        const events = await getUserActivity(profile.uid);
        return events.map((event) => ({
          ...event,
          displayName: profile.displayName,
        }));
      } catch {
        return [] as FeedItem[];
      }
    })
  );

  return perUser
    .flat()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limitItems);
}
