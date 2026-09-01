import { useEffect } from "react";
import {
  ArrowLeft,
  Flame,
  Trophy,
  Lock,
  Dumbbell,
  CalendarCheck,
  Medal,
  Zap,
  Mountain,
  Star,
  LineChart,
  Award,
} from "lucide-react";

import { C } from "@/shared/ui";
import { useRewardsStore } from "@/store/rewardsStore";
import { ACHIEVEMENTS, levelFromXp } from "@/features/rewards/gamification";

/** Resolve an achievement's icon name to a lucide component (Award fallback). */
const ICONS: Record<string, typeof Award> = {
  Dumbbell,
  CalendarCheck,
  Medal,
  Flame,
  Zap,
  Mountain,
  Star,
  LineChart,
  Anvil: Dumbbell,
};

export default function RewardsScreen({ onBack }: { onBack: () => void }) {
  const stats = useRewardsStore((s) => s.stats);
  const loadStats = useRewardsStore((s) => s.loadStats);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const level = levelFromXp(stats.xp);
  const unlocked = new Set(stats.achievements);
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;

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
          Rewards
        </h1>
      </div>

      {/* Level + XP */}
      <div
        className="rounded-[20px] p-5 mb-4 card-lit"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[11px] font-semibold" style={{ color: C.fg3 }}>
              LEVEL
            </p>
            <p className="text-[40px] font-extrabold leading-none" style={{ color: C.accentInk }}>
              {level.level}
            </p>
          </div>
          <p className="text-sm font-semibold" style={{ color: C.fg2 }}>
            {stats.xp.toLocaleString()} XP
          </p>
        </div>

        <div
          className="h-2.5 rounded-full overflow-hidden"
          style={{ background: C.card2 }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.round(level.progress * 100)}%`,
              background: C.accent,
            }}
          />
        </div>
        <p className="text-[11px] mt-2" style={{ color: C.fg3 }}>
          {level.xpForLevel - level.xpIntoLevel} XP to level {level.level + 1}
        </p>
      </div>

      {/* Streak */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div
          className="rounded-[18px] p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <Flame size={20} color={C.amber} />
          <p className="text-[26px] font-extrabold mt-2 leading-none" style={{ color: C.fg }}>
            {stats.streak}
          </p>
          <p className="text-[11px] mt-1" style={{ color: C.fg3 }}>
            Day streak
          </p>
        </div>
        <div
          className="rounded-[18px] p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <Trophy size={20} color={C.accent} />
          <p className="text-[26px] font-extrabold mt-2 leading-none" style={{ color: C.fg }}>
            {stats.longestStreak}
          </p>
          <p className="text-[11px] mt-1" style={{ color: C.fg3 }}>
            Longest streak
          </p>
        </div>
      </div>

      {/* Achievements */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold" style={{ color: C.fg }}>
          Achievements
        </h2>
        <span className="text-[11px]" style={{ color: C.fg3 }}>
          {unlockedCount}/{ACHIEVEMENTS.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlocked.has(achievement.id);
          const Icon = ICONS[achievement.icon] ?? Award;

          return (
            <div
              key={achievement.id}
              className="rounded-[16px] p-4"
              style={{
                background: C.card,
                border: `1px solid ${isUnlocked ? C.accent : C.border}`,
                opacity: isUnlocked ? 1 : 0.55,
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                style={{ background: isUnlocked ? C.accentDim : C.card2 }}
              >
                {isUnlocked ? (
                  <Icon size={20} color={C.accent} />
                ) : (
                  <Lock size={16} color={C.fg3} />
                )}
              </div>
              <p className="text-sm font-bold" style={{ color: C.fg }}>
                {achievement.title}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: C.fg3 }}>
                {achievement.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
