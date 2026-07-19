import WorkoutSection from "@/features/dashboard/components/WorkoutSection";
import WeightSection from "@/features/dashboard/components/WeightSection";
import WeeklyProgressCard from "@/features/dashboard/components/WeeklyProgressCard";
import QuickActions from "@/features/dashboard/components/QuickActions";
import TodayGoalCard from "@/features/dashboard/components/TodayGoalCard";
import GreetingCard from "@/features/dashboard/components/GreetingCard";
import NextTargetCard from "@/features/dashboard/components/NextTargetCard";
import SmartCoachCard from "@/features/dashboard/components/SmartCoachCard";
import TargetUpdateCard from "@/features/dashboard/components/TargetUpdateCard";
import BulkPaceCard from "@/features/dashboard/components/BulkPaceCard";
import FrequencyCard from "@/features/dashboard/components/FrequencyCard";
import StreakCard from "@/features/dashboard/components/StreakCard";
import { getBulkPace } from "@/lib/bulkPace";
import { getFrequencyAdherence } from "@/features/workout/utils/frequencyAdherence";
import { getWorkoutStreak } from "@/features/workout/utils/workoutStreak";
import { getWaterGoalLiters } from "@/lib/hydration";

import { useHydrationStore } from "@/store/hydrationStore";
import type { ReactNode } from "react";
import { useBodyMetricsStore } from "@/store/bodyMetricsStore";
import { useEffect, useMemo } from "react";
import {
  ArrowUpRight,
  Target,
  Play,
  Check,
  Droplets,
  Dumbbell,
  Utensils,
  Scale,
  TrendingUp,
} from "lucide-react";

import { C, T, type Screen } from "@/shared/ui";
import { ProgressRing, Badge, SectionHeader } from "@/shared/components";
import { useAuthStore } from "@/store/authStore";
import { useDailyLogStore } from "@/store/dailyLogStore";
import { useDailyTotalsStore } from "@/store/dailyTotalsStore";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";
import { useWorkoutTemplateStore } from "@/store/workoutTemplateStore";
import {
  applyDeloadToTemplate,
  getWorkoutRecommendation,
} from "@/features/workout/utils/workoutRecommendation";
import { useAppStore, type MealType } from "@/store/appStore";
import { toDateKey } from "@/lib/date";

function getTodayKey() {
  return toDateKey(new Date());
}

function getWeekStartKey() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return toDateKey(monday);
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest > 0 ? `${minutes}m ${rest}s` : `${minutes}m`;
}

export default function DashboardScreen({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const userDoc = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  const foodsByMeal = useDailyLogStore((s) => s.foodsByMeal);
  const loadDailyLog = useDailyLogStore((s) => s.loadDailyLog);
  const totals = useDailyTotalsStore((s) => s.totals);

  const workouts = useWorkoutHistoryStore((s) => s.workouts);
  const loadWorkouts = useWorkoutHistoryStore((s) => s.loadWorkouts);

  const templates = useWorkoutTemplateStore((s) => s.templates);
  const loadTemplates = useWorkoutTemplateStore((s) => s.load);
  const selectTemplate = useWorkoutTemplateStore((s) => s.selectTemplate);
  const selectGenerated = useWorkoutTemplateStore((s) => s.selectGenerated);

  const bodyEntries = useBodyMetricsStore((s) => s.entries);
  const loadBodyMetrics = useBodyMetricsStore((s) => s.load);

  const waterMl = useHydrationStore((s) => s.waterMl);
  const loadHydration = useHydrationStore((s) => s.load);
  const addWater = useHydrationStore((s) => s.addWater);
  const setWater = useHydrationStore((s) => s.setWater);

  useEffect(() => {
    if (!user) return;
    loadDailyLog(user.uid, getTodayKey());
    loadWorkouts(user.uid);
    loadBodyMetrics(user.uid);
    loadHydration(user.uid);
    loadTemplates(user.uid);
  }, [user, loadDailyLog, loadWorkouts, loadBodyMetrics, loadHydration, loadTemplates]);

  const recommendation = useMemo(
    () =>
      getWorkoutRecommendation({
        workouts,
        templates,
        bodyMetrics: bodyEntries,
      }),
    [workouts, templates, bodyEntries]
  );

  if (!userDoc) return null;

  const userProfile = userDoc.profile;
  const nutrition = userDoc.nutrition;

  const sortedBodyEntries = [...bodyEntries].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const latestBodyEntry =
    sortedBodyEntries.length > 0
      ? sortedBodyEntries[sortedBodyEntries.length - 1]
      : undefined;

  const firstBodyEntry = sortedBodyEntries[0];

  const currentWeight = latestBodyEntry?.weightKg ?? userProfile?.weight ?? 0;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoKey = toDateKey(sevenDaysAgo);

  const weekAgoEntry =
    sortedBodyEntries.find((entry) => entry.date >= sevenDaysAgoKey) ??
    firstBodyEntry;

  const weeklyWeightChange =
    latestBodyEntry && weekAgoEntry
      ? latestBodyEntry.weightKg - weekAgoEntry.weightKg
      : 0;

  const goalWeight = userProfile?.goalWeight ?? 0;
  const remainingWeight = Math.max(goalWeight - currentWeight, 0);

  const macros = {
    cal: Math.round(totals.calories),
    calGoal: nutrition?.calories ?? 3100,
    protein: totals.protein,
    proteinGoal: nutrition?.protein ?? 220,
    carbs: totals.carbs,
    carbsGoal: nutrition?.carbs ?? 310,
    fat: totals.fat,
    fatGoal: nutrition?.fat ?? 85,
  };

  const safePct = (current: number, goal: number) =>
    goal > 0 ? current / goal : 0;

  const proteinProgress = safePct(macros.protein, macros.proteinGoal);
  const proteinRemaining = Math.max(macros.proteinGoal - macros.protein, 0);

  const heroMessage =
    proteinProgress >= 1
      ? "Protein target completed."
      : proteinProgress >= 0.8
      ? "Almost there."
      : proteinProgress >= 0.5
      ? "Great progress."
      : "Let's get more protein today.";

    const water = waterMl / 1000;
    const todayKey = toDateKey(new Date());
    const trainedToday = workouts.some((w) => w.date === todayKey);
    const waterGoal = getWaterGoalLiters(
      latestBodyEntry?.weightKg ?? userProfile?.weight,
      trainedToday
    );

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const latestWorkout = workouts[0];
  const weekStart = getWeekStartKey();
  const workoutsThisWeek = workouts.filter((w) => w.date >= weekStart).length;
  const workoutsThisWeekList = workouts.filter((w) => w.date >= weekStart);

  const volumeThisWeek = workoutsThisWeekList.reduce(
    (sum, w) => sum + w.volumeKg,
    0
  );

  const trainingTimeThisWeek = workoutsThisWeekList.reduce(
    (sum, w) => sum + w.durationSeconds,
    0
  );

  const weeklyWorkoutGoal = 5;
  const weeklyProgress =
    weeklyWorkoutGoal > 0 ? workoutsThisWeek / weeklyWorkoutGoal : 0;

  const totalVolume = workouts.reduce((sum, w) => sum + w.volumeKg, 0);

  const totalTrainingTime = workouts.reduce(
    (sum, w) => sum + w.durationSeconds,
    0
  );

  const bestWorkout = workouts.reduce(
    (best, w) => (!best || w.volumeKg > best.volumeKg ? w : best),
    undefined as typeof latestWorkout | undefined
  );

  const mealStatus: { name: string; done: boolean; meal: MealType }[] = [
    { name: "Breakfast", meal: "breakfast", done: foodsByMeal.breakfast.length > 0 },
    { name: "Morning Snack", meal: "snack", done: foodsByMeal.snack.length > 0 },
    { name: "Lunch", meal: "lunch", done: foodsByMeal.lunch.length > 0 },
    { name: "Pre-Workout", meal: "preWorkout", done: foodsByMeal.preWorkout.length > 0 },
    { name: "Post-Workout", meal: "postWorkout", done: foodsByMeal.postWorkout.length > 0 },
    { name: "Dinner", meal: "dinner", done: foodsByMeal.dinner.length > 0 },
  ];

  return (
    <div className="px-5 pb-8 pt-3">
      <GreetingCard
      name={userProfile?.name || "Lukáš"}
      date={dateStr}
    />

      <NextTargetCard />

      {user && userProfile && latestBodyEntry && (
        <TargetUpdateCard
          uid={user.uid}
          profile={userProfile}
          currentNutrition={nutrition}
          currentWeightKg={latestBodyEntry.weightKg}
          onUpdated={refreshProfile}
        />
      )}

      {userProfile && (
        <BulkPaceCard
          pace={getBulkPace(bodyEntries, userProfile.goal)}
          goal={userProfile.goal}
        />
      )}

      {userProfile && (
        <FrequencyCard
          adherence={getFrequencyAdherence(
            workouts.map((w) => w.date),
            userProfile.trainingFrequency
          )}
        />
      )}

      {userProfile && (
        <StreakCard
          streak={getWorkoutStreak(
            workouts.map((w) => w.date),
            userProfile.trainingFrequency
          )}
        />
      )}

      <SmartCoachCard
        recommendation={recommendation}
        onStart={() => {
          if (recommendation.template) {
            if (recommendation.isDeloadWeek) {
              // Never mutate the user's saved template — start an adjusted
              // copy that isn't persisted.
              selectGenerated(applyDeloadToTemplate(recommendation.template));
            } else if (recommendation.isGenerated) {
              selectGenerated(recommendation.template);
            } else {
              selectTemplate(recommendation.template.id);
            }
          }
          onNavigate("workout");
        }}
      />

      <div
        className="rounded-[20px] p-5 mb-4 card-lit"
        style={{
          background:
            "linear-gradient(135deg, rgba(163,230,53,0.16), rgba(96,165,250,0.08))",
          border: "1px solid rgba(163,230,53,0.22)",
          boxShadow:
            "0 0 60px rgba(163,230,53,0.07), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
       <TodayGoalCard
        proteinRemaining={proteinRemaining}
        proteinProgress={proteinProgress}
        heroMessage={heroMessage}
      />

        <p className="mb-1" style={{ ...T.eyebrow, color: C.fg3 }}>
          Protein remaining
        </p>

        <p
          className="mb-4"
          style={{ ...T.display, color: C.fg }}
        >
          {Math.round(proteinRemaining)}
          <span className="ml-1" style={{ ...T.body, color: C.fg3 }}>
            g
          </span>
        </p>

        <div
          style={{
            height: 6,
            background: C.border,
            borderRadius: 99,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: "100%",
              transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)", width: `${Math.min(proteinProgress * 100, 100)}%`,
              background: C.accent,
              borderRadius: 99,
            }}
          />
        </div>

        <p className="text-sm font-semibold" style={{ color: C.fg }}>
          {heroMessage}
        </p>
      </div>

      <QuickActions onNavigate={onNavigate} />

      <WeeklyProgressCard
        workoutsThisWeek={workoutsThisWeek}
        weeklyWorkoutGoal={weeklyWorkoutGoal}
        weeklyProgress={weeklyProgress}
        volumeThisWeek={volumeThisWeek}
        trainingTimeThisWeek={formatDuration(trainingTimeThisWeek)}
      />

      <WeightSection
        currentWeight={currentWeight}
        goalWeight={goalWeight}
        weeklyWeightChange={weeklyWeightChange}
        remainingWeight={remainingWeight}
      />

      <SectionHeader title="Remaining Today" />

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          {
            label: "Calories",
            remaining: Math.max(macros.calGoal - macros.cal, 0),
            unit: "kcal",
            color: C.amber,
            pct: safePct(macros.cal, macros.calGoal),
          },
          {
            label: "Protein",
            remaining: Math.max(macros.proteinGoal - macros.protein, 0),
            unit: "g",
            color: C.accent,
            pct: safePct(macros.protein, macros.proteinGoal),
          },
          {
            label: "Carbs",
            remaining: Math.max(macros.carbsGoal - macros.carbs, 0),
            unit: "g",
            color: C.blue,
            pct: safePct(macros.carbs, macros.carbsGoal),
          },
          {
            label: "Fat",
            remaining: Math.max(macros.fatGoal - macros.fat, 0),
            unit: "g",
            color: C.purple,
            pct: safePct(macros.fat, macros.fatGoal),
          },
        ].map(({ label, remaining, unit, color, pct }) => (
          <div
            key={label}
            className="rounded-[20px] p-4 card-lit"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px]" style={{ color: C.fg2 }}>
                {label}
              </span>
              <ProgressRing
                value={pct * 100}
                max={100}
                size={28}
                stroke={3}
                color={color}
                trackColor={C.border}
              />
            </div>
            <p className="text-[22px] font-bold leading-none" style={{ color: C.fg }}>
              {Math.round(remaining)}
            </p>
            <p className="text-[11px] mt-1.5" style={{ color: C.fg3 }}>
              {unit} left
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-[20px] p-4 mb-4 flex items-center gap-5 card-lit"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <ProgressRing
          value={macros.cal}
          max={macros.calGoal}
          size={76}
          stroke={6}
          color={C.accent}
        >
          <div className="text-center">
            <p className="text-[15px] font-bold" style={{ color: C.fg }}>
              {Math.round(safePct(macros.cal, macros.calGoal) * 100)}%
            </p>
          </div>
        </ProgressRing>

        <div className="flex-1">
          <p className="text-xs font-semibold mb-1" style={{ color: C.fg }}>
            Daily Goal Progress
          </p>
          <p className="text-[11px] mb-2.5" style={{ color: C.fg3 }}>
            {macros.cal.toLocaleString()} of{" "}
            {macros.calGoal.toLocaleString()} kcal consumed
          </p>

          <div className="flex flex-col gap-1.5">
            {[
              {
                label: "Protein",
                pct: safePct(macros.protein, macros.proteinGoal),
                color: C.accent,
              },
              {
                label: "Carbs",
                pct: safePct(macros.carbs, macros.carbsGoal),
                color: C.blue,
              },
              {
                label: "Fat",
                pct: safePct(macros.fat, macros.fatGoal),
                color: C.purple,
              },
            ].map(({ label, pct, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[11px] w-10" style={{ color: C.fg3 }}>
                  {label}
                </span>
                <div
                  className="flex-1"
                  style={{ height: 3, background: C.border, borderRadius: 99 }}
                >
                  <div
                    style={{
                      height: "100%",
                      transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)", width: `${Math.min(pct * 100, 100)}%`,
                      background: color,
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <WorkoutSection
        latestWorkout={latestWorkout}
        onNavigate={onNavigate}
        formatDuration={formatDuration}
      />

      <div className="grid grid-cols-2 gap-3 mb-5">
        <MetricCard label="Workouts this week" value={`${workoutsThisWeek}`} />
        <MetricCard label="Total workouts" value={`${workouts.length}`} />
        <MetricCard label="Total volume" value={`${totalVolume.toLocaleString()} kg`} />
        <MetricCard label="Training time" value={formatDuration(totalTrainingTime)} />
      </div>

      <div
        className="rounded-[20px] p-4 mb-4 card-lit"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <p className="text-[11px] mb-1.5" style={{ color: C.fg2 }}>
          Best workout
        </p>
        <p className="text-base font-bold" style={{ color: C.fg }}>
          {bestWorkout?.name ?? "No workout yet"}
        </p>
        <p className="text-xs mt-1" style={{ color: C.fg3 }}>
          {bestWorkout
            ? `${bestWorkout.volumeKg.toLocaleString()} kg · ${formatDuration(
                bestWorkout.durationSeconds
              )}`
            : "Complete a workout to unlock stats"}
        </p>
      </div>

      <SectionHeader
        title="Meals"
        action="Log food"
        onAction={() => onNavigate("nutrition")}
      />

      <div
        className="rounded-[20px] mb-4 overflow-hidden card-lit"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        {mealStatus.map(({ name, done }, i) => (
          <div
            key={name}
            className="flex items-center gap-3 px-4 py-3"
            style={{
              borderBottom:
                i < mealStatus.length - 1 ? `1px solid ${C.border}` : "none",
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: done ? C.accentDim : "transparent",
                border: done ? "none" : `1.5px solid ${C.fg3}`,
              }}
            >
              {done && <Check size={11} color={C.accent} strokeWidth={2.5} />}
            </div>
            <span
              className="text-sm flex-1"
              style={{ color: done ? C.fg : C.fg3 }}
            >
              {name}
            </span>
            <span className="text-[11px]" style={{ color: C.fg3 }}>
              {done ? "Logged" : "Pending"}
            </span>
          </div>
        ))}
      </div>

      <SectionHeader title="Hydration" />

      <div
        className="rounded-[20px] p-4 mb-4 card-lit"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Droplets size={17} color={C.blue} />
            <span className="text-sm font-semibold" style={{ color: C.fg }}>
              {water}L
              <span className="font-normal text-sm ml-1" style={{ color: C.fg3 }}>
                of {waterGoal}L
              </span>
            </span>
          </div>

          <span className="text-sm font-bold" style={{ color: C.blue }}>
            {Math.round((water / waterGoal) * 100)}%
          </span>
        </div>

        <div
          style={{
            height: 5,
            background: C.border,
            borderRadius: 99,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: "100%",
              transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)", width: `${(water / waterGoal) * 100}%`,
              background: C.blue,
              borderRadius: 99,
            }}
          />
        </div>

        <div className="flex gap-2">
          {[250, 330, 500].map((ml) => (
            <button
            key={ml}
            onClick={() => user && addWater(user.uid, ml)}
            className="flex-1 py-2 rounded-xl text-xs font-medium"
            style={{
              background: C.card2,
              border: `1px solid ${C.border}`,
              color: C.fg2,
            }}
          >
            +{ml}ml
          </button>
          ))}
        </div>

        <button
        onClick={() => user && setWater(user.uid, 0)}
        className="w-full mt-3 py-2 rounded-xl text-sm font-semibold"
        style={{
          background: C.card2,
          border: `1px solid ${C.border}`,
          color: C.red,
        }}
        >
          Reset Water
        </button>
      </div>

      <button
        onClick={() => onNavigate("workout")}
        className="w-full py-4 rounded-[20px] font-bold text-base card-lit"
        style={{
          background: C.accent,
          color: C.bg,
          boxShadow: `0 8px 32px rgba(163,230,53,0.25)`,
        }}
      >
        Start Today's Workout
      </button>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[20px] p-4 card-lit"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <p className="text-[11px] mb-1.5" style={{ color: C.fg2 }}>
        {label}
      </p>
      <p className="text-[22px] font-bold leading-none" style={{ color: C.fg }}>
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[14px] px-3 py-2"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${C.border}`,
      }}
    >
      <p className="text-[11px] mb-1" style={{ color: C.fg3 }}>
        {label}
      </p>
      <p className="text-sm font-bold" style={{ color: C.fg }}>
        {value}
      </p>
    </div>
  );
}