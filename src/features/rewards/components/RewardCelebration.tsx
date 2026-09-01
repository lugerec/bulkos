import { useMemo } from "react";
import { Trophy, Sparkles, Award } from "lucide-react";

import { C } from "@/shared/ui";
import { useRewardsStore } from "@/store/rewardsStore";
import { ACHIEVEMENTS } from "@/features/rewards/gamification";

/**
 * App-level overlay that celebrates a level-up and/or newly unlocked
 * achievements after an activity. Purely local — reads the transient
 * celebration state from the rewards store and clears it on dismiss.
 */
export default function RewardCelebration() {
  const justLeveledUp = useRewardsStore((s) => s.justLeveledUp);
  const justUnlocked = useRewardsStore((s) => s.justUnlocked);
  const clearCelebration = useRewardsStore((s) => s.clearCelebration);

  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => justUnlocked.includes(a.id)),
    [justUnlocked]
  );

  const hasSomething = justLeveledUp !== null || unlockedAchievements.length > 0;
  if (!hasSomething) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-8"
      style={{ background: "rgba(0,0,0,0.72)" }}
      onClick={clearCelebration}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[24px] p-6 text-center"
        style={{ background: C.card, border: `1px solid ${C.accent}` }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            background: C.accentDim,
            boxShadow: `0 0 40px rgba(204,242,50,0.25)`,
          }}
        >
          {justLeveledUp !== null ? (
            <Sparkles size={38} color={C.accent} />
          ) : (
            <Trophy size={38} color={C.accent} />
          )}
        </div>

        {justLeveledUp !== null && (
          <>
            <p className="text-[13px] font-semibold" style={{ color: C.fg3 }}>
              LEVEL UP
            </p>
            <p
              className="text-[40px] font-extrabold leading-none mb-2"
              style={{ color: C.accentInk }}
            >
              Level {justLeveledUp}
            </p>
          </>
        )}

        {unlockedAchievements.length > 0 && (
          <div className={justLeveledUp !== null ? "mt-4" : ""}>
            {justLeveledUp === null && (
              <p
                className="text-lg font-extrabold mb-3"
                style={{ color: C.fg }}
              >
                Achievement unlocked!
              </p>
            )}
            <div className="flex flex-col gap-2">
              {unlockedAchievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-left"
                  style={{ background: C.card2, border: `1px solid ${C.border}` }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: C.accentDim }}
                  >
                    <Award size={18} color={C.accent} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold" style={{ color: C.fg }}>
                      {a.title}
                    </p>
                    <p className="text-[11px]" style={{ color: C.fg3 }}>
                      {a.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={clearCelebration}
          className="w-full py-3.5 rounded-[16px] font-bold text-sm mt-5"
          style={{ background: C.accent, color: C.onAccent }}
        >
          Nice!
        </button>
      </div>
    </div>
  );
}
