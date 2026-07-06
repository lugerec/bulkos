import { useEffect } from "react";
import { ArrowUpRight, Target, Play, Check, Droplets } from "lucide-react";
import { XAxis, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

import { C, type Screen } from "@/shared/ui";
import { ProgressRing, Badge, SectionHeader } from "@/shared/components";
import { useAuthStore } from "@/store/authStore";
import { useDailyLogStore } from "@/store/dailyLogStore";
import { useDailyTotalsStore } from "@/store/dailyTotalsStore";
import { useWorkoutHistoryStore } from "@/store/workoutHistoryStore";
import type { MealType } from "@/store/appStore";

const weeklyBarData = [
  { day: "Mon", cal: 2820 },
  { day: "Tue", cal: 3150 },
  { day: "Wed", cal: 2980 },
  { day: "Thu", cal: 3200 },
  { day: "Fri", cal: 2750 },
  { day: "Sat", cal: 3100 },
  { day: "Sun", cal: 0 },
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getWeekStartKey() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
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

  const foodsByMeal = useDailyLogStore((s) => s.foodsByMeal);
  const loadDailyLog = useDailyLogStore((s) => s.loadDailyLog);
  const totals = useDailyTotalsStore((s) => s.totals);

  const workouts = useWorkoutHistoryStore((s) => s.workouts);
  const loadWorkouts = useWorkoutHistoryStore((s) => s.loadWorkouts);

  useEffect(() => {
    if (!user) return;
    loadDailyLog(user.uid, getTodayKey());
    loadWorkouts(user.uid);
  }, [user, loadDailyLog, loadWorkouts]);

  if (!userDoc) return null;

  const userProfile = userDoc.profile;
  const nutrition = userDoc.nutrition;

  const currentWeight = userProfile?.weight ?? 0;
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

  const water = 1.8;
  const waterGoal = 3.5;

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const todayBarData = weeklyBarData.map((item) =>
    item.day === "Sun" ? { ...item, cal: macros.cal } : item
  );

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
      <div className="mb-6">
        <p className="text-sm font-semibold mb-1" style={{ color: C.accent }}>
          Good morning
        </p>
        <h1 className="text-[30px] font-extrabold leading-none tracking-tight" style={{ color: C.fg }}>
          {userProfile?.name || "Lukáš"}
        </h1>
        <p className="text-sm mt-1.5" style={{ color: C.fg3 }}>
          {dateStr}
        </p>
      </div>

      <div
  className="rounded-[24px] p-5 mb-5"
  style={{
    background: "linear-gradient(135deg, rgba(124,255,107,0.10), rgba(91,141,239,0.08))",
    border: "1px solid rgba(124,255,107,0.18)",
  }}
>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: C.accent }}>
            This Week
          </p>
          <p className="text-2xl font-extrabold" style={{ color: C.fg }}>
            {workoutsThisWeek}/{weeklyWorkoutGoal} workouts
          </p>
        </div>

        <Badge>{Math.round(weeklyProgress * 100)}%</Badge>
      </div>

      <div style={{ height: 5, background: C.border, borderRadius: 99, marginBottom: 14 }}>
        <div
          style={{
            height: "100%",
            width: `${Math.min(weeklyProgress * 100, 100)}%`,
            background: C.accent,
            borderRadius: 99,
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="Volume" value={`${volumeThisWeek.toLocaleString()} kg`} />
        <MiniStat label="Time" value={formatDuration(trainingTimeThisWeek)} />
      </div>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="flex-1 rounded-[20px] p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-[11px] mb-1.5" style={{ color: C.fg2 }}>Current</p>
          <p className="text-[26px] font-bold leading-none" style={{ color: C.fg }}>
            {currentWeight}
            <span className="text-sm font-medium ml-1" style={{ color: C.fg3 }}>kg</span>
          </p>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight size={12} color={C.accent} />
            <span className="text-[11px] font-semibold" style={{ color: C.accent }}>
              +0.3 this week
            </span>
          </div>
        </div>

        <div className="flex-1 rounded-[20px] p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-[11px] mb-1.5" style={{ color: C.fg2 }}>Goal</p>
          <p className="text-[26px] font-bold leading-none" style={{ color: C.fg }}>
            {goalWeight}
            <span className="text-sm font-medium ml-1" style={{ color: C.fg3 }}>kg</span>
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Target size={12} color={C.fg3} />
            <span className="text-[11px]" style={{ color: C.fg3 }}>
              {remainingWeight.toFixed(1)} kg to go
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-[22px] p-4 mb-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.fg2 }}>
              Weekly Calories
            </p>
            <p className="text-sm font-semibold mt-1" style={{ color: C.fg }}>
              Today {macros.cal.toLocaleString()} kcal
              <span className="font-normal ml-2" style={{ color: C.fg3 }}>
                / {macros.calGoal.toLocaleString()} target
              </span>
            </p>
          </div>
          <Badge>{macros.cal > 0 ? "1/7 days" : "0/7 days"}</Badge>
        </div>

        <div style={{ height: 80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={todayBarData} barSize={20} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: C.fg3, fontSize: 10, fontFamily: "Inter" }} />
              <Bar dataKey="cal" radius={[5, 5, 0, 0]}>
                {todayBarData.map((entry, i) => (
                  <Cell key={i} fill={entry.cal >= macros.calGoal ? C.accent : C.accentDim} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <SectionHeader title="Remaining Today" />

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: "Calories", remaining: Math.max(macros.calGoal - macros.cal, 0), unit: "kcal", color: C.amber, pct: safePct(macros.cal, macros.calGoal) },
          { label: "Protein", remaining: Math.max(macros.proteinGoal - macros.protein, 0), unit: "g", color: C.accent, pct: safePct(macros.protein, macros.proteinGoal) },
          { label: "Carbs", remaining: Math.max(macros.carbsGoal - macros.carbs, 0), unit: "g", color: C.blue, pct: safePct(macros.carbs, macros.carbsGoal) },
          { label: "Fat", remaining: Math.max(macros.fatGoal - macros.fat, 0), unit: "g", color: C.purple, pct: safePct(macros.fat, macros.fatGoal) },
        ].map(({ label, remaining, unit, color, pct }) => (
          <div key={label} className="rounded-[18px] p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px]" style={{ color: C.fg2 }}>{label}</span>
              <ProgressRing value={pct * 100} max={100} size={28} stroke={3} color={color} trackColor={C.border} />
            </div>
            <p className="text-[22px] font-bold leading-none" style={{ color: C.fg }}>
              {Math.round(remaining)}
            </p>
            <p className="text-[10px] mt-1.5" style={{ color: C.fg3 }}>
              {unit} left
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-[22px] p-4 mb-5 flex items-center gap-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <ProgressRing value={macros.cal} max={macros.calGoal} size={76} stroke={6} color={C.accent}>
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
            {macros.cal.toLocaleString()} of {macros.calGoal.toLocaleString()} kcal consumed
          </p>

          <div className="flex flex-col gap-1.5">
            {[
              { label: "Protein", pct: safePct(macros.protein, macros.proteinGoal), color: C.accent },
              { label: "Carbs", pct: safePct(macros.carbs, macros.carbsGoal), color: C.blue },
              { label: "Fat", pct: safePct(macros.fat, macros.fatGoal), color: C.purple },
            ].map(({ label, pct, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[10px] w-10" style={{ color: C.fg3 }}>{label}</span>
                <div className="flex-1" style={{ height: 3, background: C.border, borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${Math.min(pct * 100, 100)}%`, background: color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionHeader title="Today's Training" action="History" onAction={() => onNavigate("workout-history")} />

      <div className="rounded-[20px] p-4 mb-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-base" style={{ color: C.fg }}>
              {latestWorkout?.name ?? "Push Day A"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.fg2 }}>
              {latestWorkout ? `${latestWorkout.completedSets}/${latestWorkout.totalSets} sets completed` : "Chest · Shoulders · Triceps"}
            </p>
            <div className="flex gap-4 mt-2.5">
              <span className="text-xs" style={{ color: C.fg3 }}>
                {latestWorkout ? `${latestWorkout.volumeKg.toLocaleString()} kg` : "6 exercises"}
              </span>
              <span className="text-xs" style={{ color: C.fg3 }}>
                {latestWorkout ? formatDuration(latestWorkout.durationSeconds) : "~65 min"}
              </span>
            </div>
          </div>

          <button onClick={() => onNavigate("workout")} className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: C.accent, boxShadow: `0 6px 20px rgba(124,255,107,0.3)` }}>
            <Play size={18} fill={C.bg} color={C.bg} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <MetricCard label="Workouts this week" value={`${workoutsThisWeek}`} />
        <MetricCard label="Total workouts" value={`${workouts.length}`} />
        <MetricCard label="Total volume" value={`${totalVolume.toLocaleString()} kg`} />
        <MetricCard label="Training time" value={formatDuration(totalTrainingTime)} />
      </div>

      <div className="rounded-[20px] p-4 mb-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <p className="text-[11px] mb-1.5" style={{ color: C.fg2 }}>
          Best workout
        </p>
        <p className="text-base font-bold" style={{ color: C.fg }}>
          {bestWorkout?.name ?? "No workout yet"}
        </p>
        <p className="text-xs mt-1" style={{ color: C.fg3 }}>
          {bestWorkout
            ? `${bestWorkout.volumeKg.toLocaleString()} kg · ${formatDuration(bestWorkout.durationSeconds)}`
            : "Complete a workout to unlock stats"}
        </p>
      </div>

      <SectionHeader title="Meals" action="Log food" onAction={() => onNavigate("nutrition")} />

      <div className="rounded-[20px] mb-5 overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        {mealStatus.map(({ name, done }, i) => (
          <div key={name} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < mealStatus.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: done ? C.accentDim : "transparent", border: done ? "none" : `1.5px solid ${C.fg3}` }}>
              {done && <Check size={11} color={C.accent} strokeWidth={2.5} />}
            </div>
            <span className="text-sm flex-1" style={{ color: done ? C.fg : C.fg3 }}>{name}</span>
            <span className="text-[11px]" style={{ color: C.fg3 }}>{done ? "Logged" : "Pending"}</span>
          </div>
        ))}
      </div>

      <SectionHeader title="Hydration" />

      <div className="rounded-[20px] p-4 mb-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
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

        <div style={{ height: 5, background: C.border, borderRadius: 99, marginBottom: 12 }}>
          <div style={{ height: "100%", width: `${(water / waterGoal) * 100}%`, background: C.blue, borderRadius: 99 }} />
        </div>

        <div className="flex gap-2">
          {[250, 330, 500].map((ml) => (
            <button key={ml} className="flex-1 py-2 rounded-xl text-xs font-medium" style={{ background: C.card2, border: `1px solid ${C.border}`, color: C.fg2 }}>
              +{ml}ml
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => onNavigate("workout")} className="w-full py-4 rounded-[18px] font-bold text-base" style={{ background: C.accent, color: C.bg, boxShadow: `0 8px 32px rgba(124,255,107,0.25)` }}>
        Start Today's Workout
      </button>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <p className="text-[11px] mb-1.5" style={{ color: C.fg2 }}>
        {label}
      </p>
      <p className="text-[20px] font-bold leading-none" style={{ color: C.fg }}>
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[14px] px-3 py-2"
      style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}` }}
    >
      <p className="text-[10px] mb-1" style={{ color: C.fg3 }}>
        {label}
      </p>
      <p className="text-sm font-bold" style={{ color: C.fg }}>
        {value}
      </p>
    </div>
  );
}