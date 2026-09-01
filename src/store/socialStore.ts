import { create } from "zustand";

import type { PublicProfile } from "@/types/social";
import {
  addFriend,
  findProfileByCode,
  getFriendProfiles,
  getPublicProfile,
  removeFriend,
  upsertPublicProfile,
  setDisplayName as setDisplayNameService,
} from "@/services/socialService";
import { levelFromXp } from "@/features/rewards/gamification";
import { useRewardsStore } from "./rewardsStore";
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
  /** Set the public nickname shown to friends on the leaderboard. */
  updateDisplayName: (name: string) => Promise<void>;
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
      let mine = await getPublicProfile(uid);

      // First time here? Create the public mirror so the user gets a code.
      if (!mine) {
        const stats = useRewardsStore.getState().stats;
        const authProfile = useAuthStore.getState().profile as
          | { profile?: { name?: string } }
          | null;
        await upsertPublicProfile(uid, {
          displayName: authProfile?.profile?.name?.trim() || "Athlete",
          level: levelFromXp(stats.xp).level,
          xp: stats.xp,
          streak: stats.streak,
        });
        mine = await getPublicProfile(uid);
      }

      const friends = await getFriendProfiles(uid);
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

  updateDisplayName: async (name) => {
    const uid = currentUid();
    const trimmed = name.trim().slice(0, 20);
    if (!uid || !trimmed) return;

    const current = get().myProfile;
    // Optimistic local update, then persist.
    if (current) {
      set({ myProfile: { ...current, displayName: trimmed, nameLocked: true } });
    }

    try {
      await setDisplayNameService(uid, trimmed);
    } catch {
      // Revert on failure so the UI doesn't lie.
      if (current) set({ myProfile: current });
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
