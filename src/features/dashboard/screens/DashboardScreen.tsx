import { ArrowUpRight, Target, Play, Check, Droplets } from "lucide-react";
import { XAxis, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

import { C, type Screen } from "@/shared/ui";
import { ProgressRing, Badge, SectionHeader } from "@/shared/components";
import { useAuthStore } from "@/store/authStore";

const weeklyBarData = [
  { day: "Mon", cal: 2820 },
  { day: "Tue", cal: 3150 },
  { day: "Wed", cal: 2980 },
  { day: "Thu", cal: 3200 },
  { day: "Fri", cal: 2750 },
  { day: "Sat", cal: 3100 },
  { day: "Sun", cal: 1840 },
];

export default function DashboardScreen({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void;
}) {
  const userDoc = useAuthStore((s) => s.profile);

  if (!userDoc) return null;

  const userProfile = userDoc.profile;
  const nutrition = userDoc.nutrition;

  const currentWeight = userProfile?.weight ?? 0;
  const goalWeight = userProfile?.goalWeight ?? 0;
  const remainingWeight = Math.max(goalWeight - currentWeight, 0);

  const macros = {
    cal: 1840,
    calGoal: nutrition?.calories ?? 0,
    protein: 142,
    proteinGoal: nutrition?.protein ?? 0,
    carbs: 180,
    carbsGoal: nutrition?.carbs ?? 0,
    fat: 48,
    fatGoal: nutrition?.fat ?? 0,
  };

  const water = 1.8;
  const waterGoal = 3.5;

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const mealStatus = [
    { name: "Breakfast", done: true },
    { name: "Morning Snack", done: true },
    { name: "Lunch", done: true },
    { name: "Pre-Workout", done: false },
    { name: "Post-Workout", done: false },
    { name: "Dinner", done: false },
  ];

  return (
    <div className="px-5 pb-8 pt-3">
      <div className="mb-6">
        <p className="text-sm font-semibold mb-1" style={{ color: C.accent }}>
          Good morning
        </p>
        <h1
          className="text-[30px] font-extrabold leading-none tracking-tight"
          style={{ color: C.fg }}
        >
          {userProfile?.name || "Lukáš"}
        </h1>
        <p className="text-sm mt-1.5" style={{ color: C.fg3 }}>
          {dateStr}
        </p>
      </div>

      <div className="flex gap-3 mb-5">
        <div
          className="flex-1 rounded-[20px] p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p className="text-[11px] mb-1.5" style={{ color: C.fg2 }}>
            Current
          </p>
          <p
            className="text-[26px] font-bold leading-none"
            style={{ color: C.fg }}
          >
            {currentWeight}
            <span className="text-sm font-medium ml-1" style={{ color: C.fg3 }}>
              kg
            </span>
          </p>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight size={12} color={C.accent} />
            <span
              className="text-[11px] font-semibold"
              style={{ color: C.accent }}
            >
              +0.3 this week
            </span>
          </div>
        </div>

        <div
          className="flex-1 rounded-[20px] p-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p className="text-[11px] mb-1.5" style={{ color: C.fg2 }}>
            Goal
          </p>
          <p
            className="text-[26px] font-bold leading-none"
            style={{ color: C.fg }}
          >
            {goalWeight}
            <span className="text-sm font-medium ml-1" style={{ color: C.fg3 }}>
              kg
            </span>
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Target size={12} color={C.fg3} />
            <span className="text-[11px]" style={{ color: C.fg3 }}>
              {remainingWeight.toFixed(1)} kg to go
            </span>
          </div>
        </div>
      </div>

      <div
        className="rounded-[22px] p-4 mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: C.fg2 }}
            >
              Weekly Calories
            </p>
            <p className="text-sm font-semibold mt-1" style={{ color: C.fg }}>
              Avg 2,863 kcal
              <span className="font-normal ml-2" style={{ color: C.fg3 }}>
                / {macros.calGoal.toLocaleString()} target
              </span>
            </p>
          </div>
          <Badge>6/7 days</Badge>
        </div>

        <div style={{ height: 80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyBarData}
              barSize={20}
              margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: C.fg3, fontSize: 10, fontFamily: "Inter" }}
              />
              <Bar dataKey="cal" radius={[5, 5, 0, 0]}>
                {weeklyBarData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.cal >= macros.calGoal ? C.accent : C.accentDim}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <SectionHeader title="Remaining Today" />

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          {
            label: "Calories",
            remaining: macros.calGoal - macros.cal,
            unit: "kcal",
            color: C.amber,
            pct: macros.cal / macros.calGoal,
          },
          {
            label: "Protein",
            remaining: macros.proteinGoal - macros.protein,
            unit: "g",
            color: C.accent,
            pct: macros.protein / macros.proteinGoal,
          },
          {
            label: "Carbs",
            remaining: macros.carbsGoal - macros.carbs,
            unit: "g",
            color: C.blue,
            pct: macros.carbs / macros.carbsGoal,
          },
          {
            label: "Fat",
            remaining: macros.fatGoal - macros.fat,
            unit: "g",
            color: C.purple,
            pct: macros.fat / macros.fatGoal,
          },
        ].map(({ label, remaining, unit, color, pct }) => (
          <div
            key={label}
            className="rounded-[18px] p-4"
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
            <p
              className="text-[22px] font-bold leading-none"
              style={{ color: C.fg }}
            >
              {remaining}
            </p>
            <p className="text-[10px] mt-1.5" style={{ color: C.fg3 }}>
              {unit} left
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-[22px] p-4 mb-5 flex items-center gap-5"
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
              {Math.round((macros.cal / macros.calGoal) * 100)}%
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
                pct: macros.protein / macros.proteinGoal,
                color: C.accent,
              },
              {
                label: "Carbs",
                pct: macros.carbs / macros.carbsGoal,
                color: C.blue,
              },
              {
                label: "Fat",
                pct: macros.fat / macros.fatGoal,
                color: C.purple,
              },
            ].map(({ label, pct, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[10px] w-10" style={{ color: C.fg3 }}>
                  {label}
                </span>
                <div
                  className="flex-1"
                  style={{ height: 3, background: C.border, borderRadius: 99 }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(pct * 100, 100)}%`,
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

      <SectionHeader title="Today's Training" />

      <div
        className="rounded-[20px] p-4 mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-base" style={{ color: C.fg }}>
              Push Day A
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.fg2 }}>
              Chest · Shoulders · Triceps
            </p>
            <div className="flex gap-4 mt-2.5">
              <span className="text-xs" style={{ color: C.fg3 }}>
                6 exercises
              </span>
              <span className="text-xs" style={{ color: C.fg3 }}>
                ~65 min
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate("workout")}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: C.accent,
              boxShadow: `0 6px 20px rgba(124,255,107,0.3)`,
            }}
          >
            <Play size={18} fill={C.bg} color={C.bg} />
          </button>
        </div>
      </div>

      <SectionHeader
        title="Meals"
        action="Log food"
        onAction={() => onNavigate("nutrition")}
      />

      <div
        className="rounded-[20px] mb-5 overflow-hidden"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        {mealStatus.map(({ name, done }, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: i < 5 ? `1px solid ${C.border}` : "none" }}
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
        className="rounded-[20px] p-4 mb-6"
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
              width: `${(water / waterGoal) * 100}%`,
              background: C.blue,
              borderRadius: 99,
            }}
          />
        </div>

        <div className="flex gap-2">
          {[250, 330, 500].map((ml) => (
            <button
              key={ml}
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
      </div>

      <button
        onClick={() => onNavigate("workout")}
        className="w-full py-4 rounded-[18px] font-bold text-base"
        style={{
          background: C.accent,
          color: C.bg,
          boxShadow: `0 8px 32px rgba(124,255,107,0.25)`,
        }}
      >
        Start Today's Workout
      </button>
    </div>
  );
}