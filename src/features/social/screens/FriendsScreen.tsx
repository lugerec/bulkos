import { useEffect, useState } from "react";
import { ArrowLeft, UserPlus, Flame, Trophy, X } from "lucide-react";

import { C } from "@/shared/ui";
import { useSocialStore, buildLeaderboard } from "@/store/socialStore";

export default function FriendsScreen({ onBack }: { onBack: () => void }) {
  const myProfile = useSocialStore((s) => s.myProfile);
  const friends = useSocialStore((s) => s.friends);
  const loading = useSocialStore((s) => s.loading);
  const addStatus = useSocialStore((s) => s.addStatus);
  const loadSocial = useSocialStore((s) => s.loadSocial);
  const addFriendByCode = useSocialStore((s) => s.addFriendByCode);
  const unfriend = useSocialStore((s) => s.unfriend);
  const clearAddStatus = useSocialStore((s) => s.clearAddStatus);

  const [code, setCode] = useState("");

  useEffect(() => {
    loadSocial();
  }, [loadSocial]);

  const leaderboard = buildLeaderboard(myProfile, friends);

  const handleAdd = async () => {
    const ok = await addFriendByCode(code);
    if (ok) setCode("");
  };

  return (
    <div className="px-5 pb-10" style={{ paddingTop: 8 }}>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-extrabold" style={{ color: C.fg }}>
          Friends
        </h1>
      </div>

      {/* My share code */}
      <div
        className="rounded-[20px] p-5 mb-4"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <p className="text-[11px] font-semibold mb-1" style={{ color: C.fg3 }}>
          YOUR FRIEND CODE
        </p>
        <p
          className="text-[30px] font-extrabold tracking-[0.2em] leading-none"
          style={{ color: C.accentInk }}
        >
          {myProfile?.friendCode ?? "······"}
        </p>
        <p className="text-[11px] mt-2" style={{ color: C.fg3 }}>
          Share this so friends can add you.
        </p>
      </div>

      {/* Add by code */}
      <div className="flex gap-2 mb-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (addStatus) clearAddStatus();
          }}
          placeholder="Enter friend code"
          maxLength={6}
          className="flex-1 bg-transparent outline-none text-sm px-4 py-3 rounded-[14px] tracking-widest"
          style={{ color: C.fg, border: `1px solid ${C.border}`, background: C.card }}
        />
        <button
          onClick={handleAdd}
          className="px-4 rounded-[14px] font-bold text-sm flex items-center gap-1.5"
          style={{ background: C.accent, color: C.onAccent }}
        >
          <UserPlus size={16} />
          Add
        </button>
      </div>
      {addStatus && (
        <p className="text-[11px] mb-4 px-1" style={{ color: C.fg2 }}>
          {addStatus}
        </p>
      )}

      {/* Leaderboard */}
      <div className="flex items-center gap-2 mt-6 mb-3">
        <Trophy size={16} color={C.accent} />
        <h2 className="text-sm font-bold" style={{ color: C.fg }}>
          Leaderboard
        </h2>
      </div>

      {leaderboard.length <= 1 && !loading && (
        <p className="text-sm px-1" style={{ color: C.fg3 }}>
          Add a friend by their code to see how you stack up.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {leaderboard.map((entry, rank) => (
          <div
            key={entry.uid}
            className="flex items-center gap-3 rounded-[16px] px-4 py-3"
            style={{
              background: entry.isMe ? C.accentDim : C.card,
              border: `1px solid ${entry.isMe ? C.accent : C.border}`,
            }}
          >
            <span
              className="text-sm font-extrabold w-6 text-center"
              style={{ color: rank === 0 ? C.accentInk : C.fg3 }}
            >
              {rank + 1}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: C.fg }}>
                {entry.displayName}
                {entry.isMe && (
                  <span style={{ color: C.fg3 }}> (you)</span>
                )}
              </p>
              <p className="text-[11px]" style={{ color: C.fg3 }}>
                Level {entry.level} · {entry.xp.toLocaleString()} XP
              </p>
            </div>

            {entry.streak > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Flame size={14} color={C.amber} />
                <span className="text-xs font-bold" style={{ color: C.fg2 }}>
                  {entry.streak}
                </span>
              </div>
            )}

            {!entry.isMe && (
              <button
                onClick={() => unfriend(entry.uid)}
                aria-label={`Remove ${entry.displayName}`}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: C.card2, color: C.fg3 }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
