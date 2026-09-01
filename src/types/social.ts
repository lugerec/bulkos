/**
 * A small, publicly-readable mirror of a user's progression, kept in its own
 * top-level `publicProfiles/{uid}` collection so friends can see each other's
 * level/streak without exposing the private user document. The owner is the
 * only writer.
 */
export type PublicProfile = {
  uid: string;
  displayName: string;
  level: number;
  xp: number;
  streak: number;
  /** Short shareable code others use to add this user. */
  friendCode: string;
  /** True once the user chose their own nickname (blocks profile-name syncs). */
  nameLocked?: boolean;
  updatedAt?: number;
};

/** A friend entry stored under the current user (a one-way follow). */
export type Friend = {
  uid: string;
  since: number;
};

/** What kind of thing happened. */
export type ActivityKind = "workout" | "levelUp" | "streak";

/**
 * A public activity item, written by its owner under
 * publicProfiles/{uid}/activity and readable by friends.
 */
export type ActivityEvent = {
  id: string;
  uid: string;
  kind: ActivityKind;
  /** Short human summary, e.g. "Finished Push Day · 12 sets". */
  text: string;
  createdAt: number;
};

/** Feed item joined with its author's display name. */
export type FeedItem = ActivityEvent & { displayName: string };
