import { describe, expect, it } from "vitest";

import { buildLeaderboard } from "./socialStore";
import type { PublicProfile } from "@/types/social";

function profile(uid: string, xp: number, name = uid): PublicProfile {
  return { uid, displayName: name, level: 1, xp, streak: 0, friendCode: uid };
}

describe("buildLeaderboard", () => {
  it("ranks me and friends by XP descending", () => {
    const me = profile("me", 500);
    const friends = [profile("a", 900), profile("b", 200)];

    const board = buildLeaderboard(me, friends);

    expect(board.map((e) => e.uid)).toEqual(["a", "me", "b"]);
    expect(board.find((e) => e.uid === "me")?.isMe).toBe(true);
    expect(board.find((e) => e.uid === "a")?.isMe).toBe(false);
  });

  it("handles a missing own profile", () => {
    const board = buildLeaderboard(null, [profile("a", 100)]);
    expect(board).toHaveLength(1);
    expect(board[0].uid).toBe("a");
  });
});
