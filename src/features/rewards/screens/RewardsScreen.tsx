import { useEffect } from "react";
import {
  ArrowLeft,
  Flame,
  Trophy,
  Lock,
  Dumbbell,
  Users,
} from "lucide-react";

import { C, type Screen } from "@/shared/ui";
import { useRewardsStore } from "@/store/rewardsStore";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";
import { useAuthStore } from "@/store/authStore";
import { ACHIEVEMENTS, levelFromXp } from "@/features/rewards/gamification";
import { getWeekDays } from "@/features/rewards/weeklyChallenge";
import {
  ACHIEVEMENT_ICONS,
  FALLBACK_ACHIEVEMENT_ICON,
} from "@/features/rewards/achievementIcons";
import { getFrequencyAdherence } from "@/features/workout/utils/frequencyAdherence";


export default function RewardsScreen({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}) {
  const stats = useRewardsStore((s) => s.stats);
  const loadStats = useRewardsStore((s) => s.loadStats);
  const recordWeeklyGoal = useRewardsStore((s) => s.recordWeeklyGoal);
  const workouts = useWorkoutHistoryStore((s) => s.workouts);
  const loadWorkouts = useWorkoutHistoryStore((s) => s.loadWorkouts);
  const user = useAuthStore((s) => s.user);
  const trainingFrequency =
    (useAuthStore((s) => s.profile) as { profile?: { trainingFrequency?: number } } | null)
      ?.profile?.trainingFrequency ?? 4;

  useEffect(() => {
    loadStats();
    if (user) loadWorkouts(user.uid);
  }, [loadStats, loadWorkouts, user]);

  const workoutDates = workouts.map((w) => w.date);
  const weekDays = getWeekDays(workoutDates);
  const adherence = getFrequencyAdherence(workoutDates, trainingFrequency);

  // Award the one-off weekly bonus once the weekly goal is met (store guards
  // against repeats across the week).
  useEffect(() => {
    if (
      trainingFrequency > 0 &&
      adherence.completedThisWeek >= trainingFrequency &&
      weekDays[0]
    ) {
      recordWeeklyGoal(weekDays[0].key);
    }
  }, [adherence.completedThisWeek, trainingFrequency, weekDays, recordWeeklyGoal]);

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

      {/* Weekly challenge */}
      <div
        className="rounded-[18px] p-4 mb-4"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold" style={{ color: C.fg }}>
            This week
          </p>
          <p className="text-[11px]" style={{ color: C.fg3 }}>
            {adherence.completedThisWeek}/{trainingFrequency} workouts
          </p>
        </div>

        <div className="flex justify-between gap-1.5">
          {weekDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className="w-full rounded-full flex items-center justify-center"
                style={{
                  height: 32,
                  background: day.trained ? C.accent : C.card2,
                  border: day.isToday ? `1.5px solid ${C.accent}` : `1px solid ${C.border}`,
                  opacity: day.isFuture ? 0.4 : 1,
                }}
              >
                {day.trained && (
                  <Dumbbell size={13} color={C.onAccent} />
                )}
              </div>
              <span className="text-[10px]" style={{ color: C.fg3 }}>
                {day.label}
              </span>
            </div>
          ))}
        </div>

        {adherence.remainingThisWeek > 0 ? (
          <p className="text-[11px] mt-3" style={{ color: C.fg3 }}>
            {adherence.remainingThisWeek} more to hit your weekly goal
          </p>
        ) : (
          <p className="text-[11px] mt-3 font-semibold" style={{ color: C.accentInk }}>
            Weekly goal complete — nice work!
          </p>
        )}
      </div>

      {/* Friends entry */}
      <button
        onClick={() => onNavigate("friends")}
        className="w-full flex items-center gap-3 rounded-[18px] px-4 py-3.5 mb-6"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: C.accentDim }}
        >
          <Users size={18} color={C.accent} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold" style={{ color: C.fg }}>
            Friends & leaderboard
          </p>
          <p className="text-[11px]" style={{ color: C.fg3 }}>
            Compare streaks and XP
          </p>
        </div>
      </button>

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
          const Icon = ACHIEVEMENT_ICONS[achievement.icon] ?? FALLBACK_ACHIEVEMENT_ICON;

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
