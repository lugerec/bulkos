import TemplateEditorScreen from "@/features/workout/screens/TemplateEditorScreen";
import TemplateBuilderScreen from "@/features/workout/screens/TemplateBuilderScreen";
import CheckInScreen from "@/features/progress/screens/CheckInScreen";
import ExerciseHistoryScreen from "@/features/workout/screens/ExerciseHistoryScreen";
import ExerciseDetailScreen from "@/features/workout/screens/ExerciseDetailScreen";
import WorkoutDetailScreen from "@/features/workout/screens/WorkoutDetailScreen";
import WorkoutHistoryScreen from "@/features/workout/screens/WorkoutHistoryScreen";
import SettingsScreen from "@/features/settings/screens/SettingsScreen";
import ProgressScreen from "@/features/progress/screens/ProgressScreen";
import WorkoutScreen from "@/features/workout/screens/WorkoutScreen";
import OneRepMaxScreen from "@/features/workout/screens/OneRepMaxScreen";
import FoodDatabaseScreenNew from "../features/nutrition/screens/FoodDatabaseScreen";
import OnboardingScreen from "../features/onboarding/screens/OnboardingScreen";
import LoginScreen from "../features/auth/screens/LoginScreen";
import DashboardScreen from "../features/dashboard/screens/DashboardScreen";
import NutritionScreen from "../features/nutrition/screens/NutritionScreen";

import { pushA } from "@/data/workouts/pushA";
import { useWorkoutTemplateStore } from "@/store/workoutTemplateStore";

import { useAuthStore } from "../store/authStore";
import { useWorkoutHistoryStore } from "../store/workoutHistoryStore";
import { useBodyMetricsStore } from "../store/bodyMetricsStore";
import { getDailyMacros, getRecentFoodNames } from "../services/logService";
import { updateNutritionTargets } from "../services/userService";
import {
  addGroceryItem,
  deleteGroceryItem,
  getGroceryItems,
  setGroceryItemChecked,
  type GroceryItem,
  type GroceryItemSource,
} from "../services/groceryService";
import { searchOpenFoodFacts } from "../services/openFoodFactsService";
import { buildGrocerySuggestions } from "../lib/grocerySuggestions";
import { getAnalyticsScores, getMacroAdherence } from "../lib/analyticsScores";
import { applyKcalDeltaToTargets, getBulkPace, getPaceInsight } from "../lib/bulkPace";
import { getFrequencyAdherence } from "../features/workout/utils/frequencyAdherence";
import {
  getMuscleRecoveryOverview,
  getMuscleSetTargetOverview,
} from "../features/workout/utils/workoutRecommendation";
import type { Goal } from "../types/profile";
import { useAppStore } from "../store/appStore";

import "../config/firebase";

import {
  ProgressRing,
  MacroBar,
  Badge,
  Pill,
  SectionHeader,
  SubScreenHeader,
} from "../shared/components";

import { C, type Screen } from "../shared/ui";
import { mealData } from "../data/meal";

import { useState, useEffect } from "react";

import {
  Home,
  Utensils,
  TrendingUp,
  Dumbbell,
  Settings as SettingsIcon,
  Search,
  Plus,
  ChevronRight,
  Heart,
  Check,
  X,
  Timer,
  Play,
  Camera,
  Droplets,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Target,
  Brain,
  BarChart3,
  Circle,
  CheckCircle2,
  Info,
  Zap,
  ArrowLeft,
  Flame,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { toDateKey } from "@/lib/date";

// ─── Status Bar ────────────────────────────────────────────────────────────────

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-6 pt-3 pb-1 flex-shrink-0" style={{ color: C.fg }}>
      <span className="text-[13px] font-semibold">9:41</span>
      <div className="flex gap-1.5 items-center">
        <div className="flex gap-[2px] items-end" style={{ height: 12 }}>
          {[4, 6, 8, 10].map((h, i) => (
            <div key={i} style={{ width: 3, height: h, background: i < 3 ? C.fg : C.fg3, borderRadius: 1 }} />
          ))}
        </div>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
          <path d="M8 2C10.2 2 12.2 2.9 13.6 4.3L15 2.9C13.2 1.1 10.7 0 8 0C5.3 0 2.8 1.1 1 2.9L2.4 4.3C3.8 2.9 5.8 2 8 2Z" fill={C.fg} />
          <path d="M8 5C9.4 5 10.7 5.6 11.6 6.5L13 5.1C11.8 3.8 10 3 8 3C6 3 4.2 3.8 3 5.1L4.4 6.5C5.3 5.6 6.6 5 8 5Z" fill={C.fg} />
          <circle cx="8" cy="9.5" r="1.5" fill={C.fg} />
        </svg>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 24, height: 11, border: `1.5px solid ${C.fg}`, borderRadius: 3, padding: 2 }}>
            <div style={{ height: "100%", width: "78%", background: C.fg, borderRadius: 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Meal Detail ──────────────────────────────────────────────────────────────

function MealDetailScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="pb-8">
      {/* Hero image */}
      <div className="relative h-56 bg-[#222]">
        <img
          src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=390&h=280&fit=crop&auto=format"
          alt="Salmon & Quinoa Bowl"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(10,10,11,0.25) 0%, rgba(10,10,11,0.85) 100%)" }}
        />
        <button
          onClick={onBack}
          className="absolute top-4 left-5 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(10,10,11,0.6)", backdropFilter: "blur(12px)", border: `1px solid ${C.border}` }}
        >
          <ArrowLeft size={16} color={C.fg} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <Badge>Post-Workout</Badge>
          <h2 className="text-[22px] font-bold mt-1.5" style={{ color: C.fg }}>Salmon & Quinoa Bowl</h2>
          <p className="text-xs mt-0.5" style={{ color: "rgba(240,240,240,0.6)" }}>
            15 min prep · 20 min cook · 1 serving
          </p>
        </div>
      </div>

      <div className="px-5 pt-5">
        {/* Macro summary */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: "Cal", val: "540", unit: "kcal", color: C.amber },
            { label: "Protein", val: "48", unit: "g", color: C.accent },
            { label: "Carbs", val: "42", unit: "g", color: C.blue },
            { label: "Fat", val: "16", unit: "g", color: C.purple },
          ].map(({ label, val, unit, color }) => (
            <div
              key={label}
              className="rounded-[14px] py-3 px-2 text-center"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <p className="text-[17px] font-bold leading-none" style={{ color }}>{val}</p>
              <p className="text-[11px] mt-1" style={{ color: C.fg3 }}>{unit}</p>
              <p className="text-[11px] mt-0.5" style={{ color: C.fg2 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Micronutrients */}
        <div className="rounded-[20px] p-4 mb-4 card-lit" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <SectionHeader title="Micronutrients" />
          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
            {[
              { name: "Vitamin D", val: "18.4 µg", pct: 92 },
              { name: "Omega-3", val: "2.8 g", pct: 140 },
              { name: "Potassium", val: "640 mg", pct: 14 },
              { name: "Iron", val: "1.8 mg", pct: 10 },
              { name: "B12", val: "3.2 µg", pct: 133 },
              { name: "Zinc", val: "1.1 mg", pct: 10 },
            ].map(({ name, val, pct }) => (
              <div key={name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px]" style={{ color: C.fg2 }}>{name}</span>
                  <span className="text-[11px] font-semibold" style={{ color: C.fg }}>{pct}%</span>
                </div>
                <div style={{ height: 3, background: C.border, borderRadius: 99 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(pct, 100)}%`,
                      background: pct > 100 ? C.accent : C.blue,
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="rounded-[20px] p-4 mb-4 card-lit" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <SectionHeader title="Ingredients" />
          {[
            { item: "Atlantic Salmon Fillet", qty: "180g" },
            { item: "Quinoa (cooked)", qty: "150g" },
            { item: "Baby Spinach", qty: "60g" },
            { item: "Cherry Tomatoes", qty: "80g" },
            { item: "Olive Oil", qty: "1 tbsp" },
            { item: "Lemon Juice", qty: "½ lemon" },
            { item: "Garlic", qty: "2 cloves" },
          ].map(({ item, qty }, i, arr) => (
            <div
              key={i}
              className="flex justify-between py-2.5"
              style={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}
            >
              <span className="text-sm" style={{ color: C.fg }}>{item}</span>
              <span className="text-sm" style={{ color: C.fg3 }}>{qty}</span>
            </div>
          ))}
        </div>

        {/* Preparation */}
        <div className="rounded-[20px] p-4 mb-4 card-lit" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <SectionHeader title="Preparation" />
          {[
            "Season salmon with salt, pepper, and minced garlic.",
            "Heat olive oil in a pan over medium-high heat.",
            "Cook salmon 4 minutes each side until golden.",
            "Assemble bowl with quinoa, spinach, tomatoes.",
            "Top with salmon and drizzle lemon juice.",
          ].map((step, i) => (
            <div key={i} className="flex gap-3 py-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: C.accentDim }}
              >
                <span className="text-[11px] font-bold" style={{ color: C.accent }}>{i + 1}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: C.fg2 }}>{step}</p>
            </div>
          ))}
        </div>

        {/* Meal prep tip */}
        <div
          className="rounded-[20px] p-4 mb-4 card-lit"
          style={{ background: C.accentDim2, border: "1px solid rgba(163,230,53,0.15)" }}
        >
          <div className="flex gap-3 items-start">
            <Zap size={16} color={C.accent} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: C.accent }}>Meal Prep Tip</p>
              <p className="text-xs leading-relaxed" style={{ color: C.fg2 }}>
                Cook salmon in batches of 3-4 fillets. Store in airtight container for up to 3 days.
                Quinoa can be cooked in bulk and refrigerated up to 5 days.
              </p>
            </div>
          </div>
        </div>

        {/* Alternative ingredients */}
        <div className="rounded-[20px] p-4 mb-4 card-lit" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <SectionHeader title="Alternatives" />
          <div className="flex flex-wrap gap-2">
            {["Brown rice instead of quinoa", "Tuna instead of salmon", "Kale instead of spinach", "Lime instead of lemon"].map((alt) => (
              <span
                key={alt}
                className="text-[11px] px-3 py-1.5 rounded-full"
                style={{ background: C.card2, border: `1px solid ${C.border}`, color: C.fg2 }}
              >
                {alt}
              </span>
            ))}
          </div>
        </div>

        {/* Allergen warning */}
        <div
          className="rounded-[20px] p-4 card-lit"
          style={{ background: "rgba(255,76,76,0.06)", border: "1px solid rgba(255,76,76,0.2)" }}
        >
          <div className="flex gap-3 items-start">
            <Info size={16} color={C.red} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: C.red }}>Allergen Info</p>
              <p className="text-xs leading-relaxed" style={{ color: C.fg2 }}>
                Contains: <span style={{ color: C.fg }}>Fish (Salmon)</span>.
                May contain traces of nuts and gluten. Suitable for gluten-free diets if using certified quinoa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────

function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const user = useAuthStore((s) => s.user);
  const userDoc = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const workouts = useWorkoutHistoryStore((s) => s.workouts);
  const loadWorkouts = useWorkoutHistoryStore((s) => s.loadWorkouts);
  const bodyEntries = useBodyMetricsStore((s) => s.entries);
  const loadBodyMetrics = useBodyMetricsStore((s) => s.load);

  const [weekMacros, setWeekMacros] = useState<
    Array<{ day: string; calories: number; protein: number; carbs: number; fat: number }>
  >([]);
  const [insightApplied, setInsightApplied] = useState(false);
  const [applyingInsight, setApplyingInsight] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadWorkouts(user.uid);
    loadBodyMetrics(user.uid);
  }, [user, loadWorkouts, loadBodyMetrics]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();

        date.setDate(date.getDate() - (6 - index));

        return date;
      });

      const totals = await Promise.all(
        days.map((day) =>
          getDailyMacros(user.uid, toDateKey(day))
        )
      );

      if (cancelled) return;

      setWeekMacros(
        days.map((day, index) => ({
          day: day.toLocaleDateString("en-US", { weekday: "short" }),
          calories: totals[index].calories,
          protein: totals[index].protein,
          carbs: totals[index].carbs,
          fat: totals[index].fat,
        }))
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const goal: Goal = userDoc?.profile?.goal ?? "bulk";
  const targetFrequency: number = userDoc?.profile?.trainingFrequency ?? 4;
  const calorieTarget: number = userDoc?.nutrition?.calories ?? 0;

  const pace = getBulkPace(bodyEntries, goal);
  const insight = getPaceInsight(pace, goal);
  const macroAdherence = getMacroAdherence(weekMacros, userDoc?.nutrition);

  const applyInsight = async () => {
    if (!user || !userDoc?.nutrition || applyingInsight) return;

    const latestWeight = [...bodyEntries].sort((a, b) =>
      a.date.localeCompare(b.date)
    )[bodyEntries.length - 1]?.weightKg;

    if (!latestWeight) return;

    try {
      setApplyingInsight(true);
      await updateNutritionTargets(
        user.uid,
        latestWeight,
        applyKcalDeltaToTargets(userDoc.nutrition, insight.kcalDelta)
      );
      await refreshProfile();
      setInsightApplied(true);
    } finally {
      setApplyingInsight(false);
    }
  };

  const scores = getAnalyticsScores({
    pace,
    goal,
    adherence: getFrequencyAdherence(
      workouts.map((w) => w.date),
      targetFrequency
    ),
    muscleRecovery: getMuscleRecoveryOverview(workouts),
    setTargets: getMuscleSetTargetOverview(workouts),
  });

  const loggedDays = weekMacros.filter((day) => day.calories > 0);
  const weeklyAvgCalories =
    loggedDays.length > 0
      ? Math.round(
          loggedDays.reduce((sum, day) => sum + day.calories, 0) /
            loggedDays.length
        )
      : 0;

  const scoreColors = [C.accent, C.blue, C.amber, C.purple];

  return (
    <div className="pb-8">
      <SubScreenHeader title="Analytics" onBack={onBack} />

      <div className="px-5">
        {/* Score grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {scores.map(({ label, value, description }, index) => {
            const color = scoreColors[index % scoreColors.length];

            return (
              <div key={label} className="rounded-[20px] p-4 card-lit" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex justify-between items-start mb-3">
                  <p className="text-[11px] leading-tight" style={{ color: C.fg2, maxWidth: 72 }}>{label}</p>
                  <ProgressRing value={value ?? 0} max={100} size={38} stroke={4} color={color}>
                    <span className="text-[11px] font-bold" style={{ color: C.fg }}>{value ?? "—"}</span>
                  </ProgressRing>
                </div>
                <p className="text-sm font-bold" style={{ color }}>{description}</p>
              </div>
            );
          })}
        </div>

        {/* Calorie chart */}
        <div className="rounded-[20px] p-4 mb-4 card-lit" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: C.fg2 }}>
                Weekly Avg Calories
              </p>
              <p className="text-[22px] font-extrabold mt-0.5 leading-none" style={{ color: C.fg }}>
                {weeklyAvgCalories.toLocaleString()}<span className="text-sm font-medium ml-1" style={{ color: C.fg3 }}>kcal</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px]" style={{ color: C.fg3 }}>Target</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: C.fg }}>{calorieTarget.toLocaleString()} kcal</p>
            </div>
          </div>
          <div style={{ height: 90 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekMacros} barSize={22} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="day" axisLine={false} tickLine={false}
                  tick={{ fill: C.fg3, fontSize: 10, fontFamily: "Inter" }}
                />
                <Tooltip
                  contentStyle={{
                    background: C.card2, border: `1px solid ${C.border}`,
                    borderRadius: 10, fontSize: 11, fontFamily: "Inter", color: C.fg,
                  }}
                  labelStyle={{ color: C.fg2 }}
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                />
                <Bar dataKey="calories" fill={C.accentDim} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macro adherence */}
        {macroAdherence && (
          <div className="rounded-[20px] p-4 mb-4 card-lit" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <SectionHeader title="Macro Adherence" />
            <div className="flex flex-col gap-4">
              {macroAdherence.map(({ label, percent }, index) => {
                const color = [C.accent, C.blue, C.purple][index % 3];

                return (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm" style={{ color: C.fg2 }}>{label}</span>
                      <span className="text-sm font-bold" style={{ color: C.fg }}>{percent}%</span>
                    </div>
                    <div style={{ height: 4, background: C.border, borderRadius: 99 }}>
                      <div style={{ height: "100%", width: `${percent}%`, background: color, borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] mt-3" style={{ color: C.fg3 }}>
              Average of the last 7 days with logged food vs your targets.
            </p>
          </div>
        )}

        {/* Coach insight */}
        <div
          className="rounded-[20px] p-5 card-lit"
          style={{
            background: "linear-gradient(135deg, rgba(163,230,53,0.07) 0%, rgba(96,165,250,0.07) 100%)",
            border: "1px solid rgba(163,230,53,0.18)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: C.accentDim }}
            >
              <Brain size={17} color={C.accent} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.accent }}>Coach Insight</p>
              <p className="text-[11px]" style={{ color: C.fg2 }}>Based on the last 14 days of check-ins</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: C.fg }}>
            {insight.message}
          </p>
          {insight.kcalDelta !== 0 && !insightApplied && (
            <button
              onClick={applyInsight}
              disabled={applyingInsight}
              className="w-full py-3 rounded-[14px] text-sm font-bold"
              style={{
                background: C.accentDim,
                border: "1px solid rgba(163,230,53,0.2)",
                color: C.accent,
                opacity: applyingInsight ? 0.6 : 1,
              }}
            >
              {applyingInsight
                ? "Applying…"
                : `Apply ${insight.kcalDelta > 0 ? "+" : ""}${insight.kcalDelta} kcal to targets`}
            </button>
          )}
          {insightApplied && (
            <p className="text-sm font-bold" style={{ color: C.accent }}>
              Applied — your calorie and carb targets were updated.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Grocery List ─────────────────────────────────────────────────────────────

function GroceryListScreen({ onBack }: { onBack: () => void }) {
  const user = useAuthStore((s) => s.user);

  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      const [list, recent] = await Promise.all([
        getGroceryItems(user.uid),
        getRecentFoodNames(user.uid, 5),
      ]);

      if (cancelled) return;

      setItems(list);
      setSuggestions(
        buildGrocerySuggestions(recent, list.map((item) => item.name))
      );
      setLoadingList(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const query = searchTerm.trim();

    if (query.length < 3) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    let cancelled = false;
    const timer = setTimeout(async () => {
      const results = await searchOpenFoodFacts(query);

      if (cancelled) return;

      setSearchResults(results.map((item) => item.name).slice(0, 6));
      setSearching(false);
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const addItem = async (name: string, source: GroceryItemSource) => {
    if (!user) return;

    const trimmed = name.trim();

    if (!trimmed) return;
    if (items.some((item) => item.name.toLowerCase() === trimmed.toLowerCase()))
      return;

    const created = await addGroceryItem(user.uid, trimmed, source);

    setItems((prev) => [...prev, created]);
    setSuggestions((prev) =>
      prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())
    );
    setSearchTerm("");
    setSearchResults([]);
  };

  const toggleItem = async (item: GroceryItem) => {
    if (!user) return;

    setItems((prev) =>
      prev.map((existing) =>
        existing.id === item.id
          ? { ...existing, checked: !existing.checked }
          : existing
      )
    );
    await setGroceryItemChecked(user.uid, item.id, !item.checked);
  };

  const removeItem = async (item: GroceryItem) => {
    if (!user) return;

    setItems((prev) => prev.filter((existing) => existing.id !== item.id));
    await deleteGroceryItem(user.uid, item.id);
  };

  const doneCount = items.filter((item) => item.checked).length;
  const progress = items.length > 0 ? (doneCount / items.length) * 100 : 0;

  return (
    <div className="pb-8">
      <SubScreenHeader title="Grocery List" onBack={onBack} />

      <div className="px-5">
        {/* Summary */}
        <div className="rounded-[20px] p-4 mb-4 card-lit" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold" style={{ color: C.fg }}>Shopping progress</span>
            <span className="text-sm font-bold" style={{ color: C.accent }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: 4, background: C.border, borderRadius: 99, marginBottom: 12 }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: C.accent,
                borderRadius: 99,
                transition: "width 0.4s",
              }}
            />
          </div>
          <span className="text-sm" style={{ color: C.fg2 }}>
            {doneCount} of {items.length} items
          </span>
        </div>

        {/* Add item */}
        <div className="rounded-[20px] p-4 mb-4 card-lit" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2 mb-1">
            <Search size={14} color={C.fg3} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addItem(searchTerm, "custom");
              }}
              placeholder="Search products or add your own…"
              className="flex-1 bg-transparent outline-none text-sm py-1.5"
              style={{ color: C.fg }}
            />
          </div>

          {searching && (
            <p className="text-xs mt-2" style={{ color: C.fg3 }}>
              Searching Open Food Facts…
            </p>
          )}

          {!searching && searchTerm.trim().length >= 3 && (
            <div className="flex flex-col gap-1 mt-2">
              <button
                onClick={() => addItem(searchTerm, "custom")}
                className="text-left text-sm py-2 px-2 rounded-xl"
                style={{ color: C.accent }}
              >
                + Add "{searchTerm.trim()}"
              </button>

              {searchResults.map((name) => (
                <button
                  key={name}
                  onClick={() => addItem(name, "off")}
                  className="text-left text-sm py-2 px-2 rounded-xl truncate"
                  style={{ color: C.fg2 }}
                >
                  + {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Suggestions from meals */}
        {suggestions.length > 0 && (
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: C.fg2 }}>
              From your recent meals
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((name) => (
                <button
                  key={name}
                  onClick={() => addItem(name, "meal")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg2 }}
                >
                  + {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        {loadingList ? (
          <p className="text-sm" style={{ color: C.fg3 }}>Loading list…</p>
        ) : items.length === 0 ? (
          <div className="rounded-[20px] p-5 text-center card-lit" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-sm font-semibold" style={{ color: C.fg }}>Your list is empty</p>
            <p className="text-xs mt-1" style={{ color: C.fg3 }}>
              Search real products above or tap a suggestion from your meals.
            </p>
          </div>
        ) : (
          <div className="rounded-[20px] overflow-hidden card-lit" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  borderBottom: index < items.length - 1 ? `1px solid ${C.border}` : "none",
                  opacity: item.checked ? 0.4 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <button
                  onClick={() => toggleItem(item)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: item.checked ? C.accentDim : "transparent",
                    border: `1.5px solid ${item.checked ? C.accent : C.fg3}`,
                  }}
                >
                  {item.checked && <Check size={12} color={C.accent} strokeWidth={2.5} />}
                </button>

                <p
                  className="flex-1 min-w-0 text-sm font-medium truncate"
                  style={{ color: C.fg, textDecoration: item.checked ? "line-through" : "none" }}
                >
                  {item.name}
                </p>

                {item.source === "off" && (
                  <span
                    className="text-[11px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: "rgba(96,165,250,0.15)", color: C.blue }}
                  >
                    STORE
                  </span>
                )}

                <button
                  onClick={() => removeItem(item)}
                  className="flex-shrink-0 px-1"
                  style={{ color: C.fg3 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bottom Nav ────────────────────────────────────────────────────────────────

const navItems = [
  { id: "dashboard" as Screen, icon: Home, label: "Home" },
  { id: "nutrition" as Screen, icon: Utensils, label: "Nutrition" },
  { id: "workout" as Screen, icon: Dumbbell, label: "Train" },
  { id: "progress" as Screen, icon: TrendingUp, label: "Progress" },
  { id: "settings" as Screen, icon: SettingsIcon, label: "Settings" },
];

function BottomNav({ active, onNavigate }: {
  active: Screen; onNavigate: (s: Screen) => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-2 pointer-events-none">
      <div
        className="flex justify-around items-center py-2 px-2 rounded-[26px] pointer-events-auto"
        style={{
          background: "rgba(22,22,26,0.82)",
          border: `1px solid ${C.border}`,
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              aria-label={label}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[18px] flex-1"
              style={{
                background: isActive ? C.accentDim : "transparent",
              }}
            >
              <Icon
                size={21}
                color={isActive ? C.accent : C.fg3}
                strokeWidth={isActive ? 2.2 : 1.6}
              />
              <span
                className="text-[11px] font-semibold"
                style={{ color: isActive ? C.accent : C.fg3 }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

const mainScreens: Screen[] = ["dashboard", "nutrition", "workout", "progress", "settings"];

export default function App() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
  return initAuth();
  }, [initAuth]);

  const loadTemplates = useWorkoutTemplateStore((s) => s.load);

  useEffect(() => {
    if (!user) return;
    loadTemplates(user.uid);
  }, [user, loadTemplates]);

  const screen = useAppStore((s) => s.screen);
  const navigate = useAppStore((s) => s.navigate);
  const goBack = useAppStore((s) => s.goBack);

  const profile = useAuthStore((s) => s.profile);

  if (loading) return null;
  if (!user) return <LoginScreen />;
  if (!profile?.onboardingCompleted) return <OnboardingScreen />;

  const showNav = mainScreens.includes(screen);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "#050505", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Global scrollbar hide */}
      <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Phone frame */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          width: 390,
          height: 844,
          background: C.bg,
          borderRadius: 44,
          border: `1px solid ${C.border}`,
          boxShadow: `0 0 0 8px #111111, 0 60px 120px rgba(0,0,0,0.9), 0 0 80px rgba(163,230,53,0.04)`,
        }}
      >
        {/* Notch */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
          style={{ width: 120, height: 32, background: "#050505", borderRadius: "0 0 16px 16px" }}
        />

        <StatusBar />

        {/* Screen content */}
        <div
          className="absolute overflow-y-auto"
          style={{ top: 44, left: 0, right: 0, bottom: showNav ? 82 : 0 }}
        >
          {screen === "dashboard" && <DashboardScreen onNavigate={navigate} />}
          {screen === "nutrition" && <NutritionScreen onNavigate={navigate} />}
          {screen === "food-db" && <FoodDatabaseScreenNew />}
          
          {screen === "template-editor" && (<TemplateEditorScreen onBack={() => navigate("template-builder")} />
          )}
          
          {screen === "meal-detail" && <MealDetailScreen onBack={() => navigate("food-db")} />}
          {screen === "workout" && <WorkoutScreen />}
          {screen === "template-builder" && (<TemplateBuilderScreen onBack={() => navigate("workout")} onNavigate={navigate}/>
          )}
          {screen === "workout-history" && (<WorkoutHistoryScreen onBack={() => navigate("dashboard")} onNavigate={navigate} />
          )}

        {screen === "workout-detail" && (
        <WorkoutDetailScreen onBack={() => navigate("workout-history")} onNavigate={navigate}
        />
        
        )}
        {screen === "exercise-history" && (
        <ExerciseHistoryScreen onBack={() => navigate("workout-detail")} />
        )}
          {screen === "progress" && <ProgressScreen onNavigate={navigate} />}

          {screen === "check-in" && (
          <CheckInScreen onBack={() => navigate("progress")} />
        )}
          {screen === "analytics" && <AnalyticsScreen onBack={() => navigate("settings")} />}
          {screen === "grocery" && <GroceryListScreen onBack={() => navigate("settings")} />}
          {screen === "one-rep-max" && <OneRepMaxScreen onBack={() => navigate("settings")} />}
          {screen === "exercise-detail" && (
            <ExerciseDetailScreen onBack={goBack} />
          )}
          {screen === "settings" && <SettingsScreen onNavigate={navigate} />}
        </div>

        {/* Bottom navigation */}
        {showNav && <BottomNav active={screen} onNavigate={navigate} />}
      </div>
    </div>
  );
}