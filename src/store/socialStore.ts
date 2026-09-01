import { create } from "zustand";

import type { PublicProfile } from "@/types/social";
import {
  addFriend,
  findProfileByCode,
  getFriendProfiles,
  getPublicProfile,
  removeFriend,
} from "@/services/socialService";
import { useAuthStore } from "./authStore";

export type LeaderboardEntry = PublicProfile & { isMe: boolean };

type SocialState = {
  myProfile: PublicProfile | null;
  friends: PublicProfile[];
  loading: boolean;
  /** Non-fatal status message for the last add attempt. */
  addStatus: string | null;

  loadSocial: () => Promise<void>;
  addFriendByCode: (code: string) => Promise<boolean>;
  unfriend: (friendUid: string) => Promise<void>;
  clearAddStatus: () => void;
};

function currentUid(): string | null {
  return useAuthStore.getState().user?.uid ?? null;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  myProfile: null,
  friends: [],
  loading: false,
  addStatus: null,

  loadSocial: async () => {
    const uid = currentUid();
    if (!uid) return;

    set({ loading: true });
    try {
      const [mine, friends] = await Promise.all([
        getPublicProfile(uid),
        getFriendProfiles(uid),
      ]);
      set({ myProfile: mine, friends, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addFriendByCode: async (code) => {
    const uid = currentUid();
    if (!uid) return false;

    const trimmed = code.toUpperCase().trim();
    if (trimmed.length < 4) {
      set({ addStatus: "Enter a valid code" });
      return false;
    }

    try {
      const match = await findProfileByCode(trimmed);

      if (!match) {
        set({ addStatus: "No one found with that code" });
        return false;
      }
      if (match.uid === uid) {
        set({ addStatus: "That's your own code" });
        return false;
      }
      if (get().friends.some((f) => f.uid === match.uid)) {
        set({ addStatus: `${match.displayName} is already on your list` });
        return false;
      }

      await addFriend(uid, match.uid);
      set({
        friends: [...get().friends, match],
        addStatus: `Added ${match.displayName}`,
      });
      return true;
    } catch {
      set({ addStatus: "Couldn't add friend — try again" });
      return false;
    }
  },

  unfriend: async (friendUid) => {
    const uid = currentUid();
    if (!uid) return;

    set({ friends: get().friends.filter((f) => f.uid !== friendUid) });
    try {
      await removeFriend(uid, friendUid);
    } catch {
      // Re-sync on next load if the delete failed.
    }
  },

  clearAddStatus: () => set({ addStatus: null }),
}));

/** You + friends, ranked by XP (desc). */
export function buildLeaderboard(
  me: PublicProfile | null,
  friends: PublicProfile[]
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [
    ...(me ? [{ ...me, isMe: true }] : []),
    ...friends.map((f) => ({ ...f, isMe: false })),
  ];

  return entries.sort((a, b) => b.xp - a.xp);
}
