import { useEffect, useState } from "react";
import { ArrowLeft, UserPlus, Flame, Trophy, X, Pencil, Activity, Dumbbell, Sparkles } from "lucide-react";

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
  const updateDisplayName = useSocialStore((s) => s.updateDisplayName);
  const feed = useSocialStore((s) => s.feed);
  const loadFeed = useSocialStore((s) => s.loadFeed);
  const clearAddStatus = useSocialStore((s) => s.clearAddStatus);

  const [code, setCode] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    loadSocial();
    loadFeed();
  }, [loadSocial, loadFeed]);

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
        <p className="text-[11px] mt-2 mb-4" style={{ color: C.fg3 }}>
          Share this so friends can add you.
        </p>

        <p className="text-[11px] font-semibold mb-1.5" style={{ color: C.fg3 }}>
          DISPLAY NAME
        </p>
        {editingName ? (
          <div className="flex gap-2">
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={20}
              placeholder="How friends see you"
              className="flex-1 bg-transparent outline-none text-sm px-3 py-2.5 rounded-[12px]"
              style={{ color: C.fg, border: `1px solid ${C.border}`, background: C.card2 }}
            />
            <button
              onClick={async () => {
                await updateDisplayName(nameDraft);
                setEditingName(false);
              }}
              disabled={!nameDraft.trim()}
              className="px-4 rounded-[12px] font-bold text-sm disabled:opacity-50"
              style={{ background: C.accent, color: C.onAccent }}
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setNameDraft(myProfile?.displayName ?? "");
              setEditingName(true);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-[12px]"
            style={{ background: C.card2, border: `1px solid ${C.border}` }}
          >
            <span className="text-sm font-semibold" style={{ color: C.fg }}>
              {myProfile?.displayName ?? "Athlete"}
            </span>
            <Pencil size={14} color={C.fg3} />
          </button>
        )}
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

      {/* Activity feed */}
      <div className="flex items-center gap-2 mt-8 mb-3">
        <Activity size={16} color={C.accent} />
        <h2 className="text-sm font-bold" style={{ color: C.fg }}>
          Recent activity
        </h2>
      </div>

      {feed.length === 0 ? (
        <p className="text-sm px-1" style={{ color: C.fg3 }}>
          Workouts and level-ups from you and your friends show up here.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {feed.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-[14px] px-4 py-3"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: C.accentDim }}
              >
                {item.kind === "levelUp" ? (
                  <Sparkles size={15} color={C.accent} />
                ) : item.kind === "streak" ? (
                  <Flame size={15} color={C.amber} />
                ) : (
                  <Dumbbell size={15} color={C.accent} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate" style={{ color: C.fg }}>
                  {item.displayName}
                </p>
                <p className="text-[11px]" style={{ color: C.fg3 }}>
                  {item.text}
                </p>
              </div>
              <span className="text-[10px] flex-shrink-0" style={{ color: C.fg3 }}>
                {timeAgo(item.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Compact relative time: "just now", "3h", "2d". */
function timeAgo(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
