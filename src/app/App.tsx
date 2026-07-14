import TemplateEditorScreen from "@/features/workout/screens/TemplateEditorScreen";
import TemplateBuilderScreen from "@/features/workout/screens/TemplateBuilderScreen";
import CheckInScreen from "@/features/progress/screens/CheckInScreen";
import ExerciseHistoryScreen from "@/features/workout/screens/ExerciseHistoryScreen";
import WorkoutDetailScreen from "@/features/workout/screens/WorkoutDetailScreen";
import WorkoutHistoryScreen from "@/features/workout/screens/WorkoutHistoryScreen";
import SettingsScreen from "@/features/settings/screens/SettingsScreen";
import ProgressScreen from "@/features/progress/screens/ProgressScreen";
import WorkoutScreen from "@/features/workout/screens/WorkoutScreen";
import FoodDatabaseScreenNew from "../features/nutrition/screens/FoodDatabaseScreen";
import OnboardingScreen from "../features/onboarding/screens/OnboardingScreen";
import LoginScreen from "../features/auth/screens/LoginScreen";
import DashboardScreen from "../features/dashboard/screens/DashboardScreen";
import NutritionScreen from "../features/nutrition/screens/NutritionScreen";

import { pushA } from "@/data/workouts/pushA";
import { useWorkoutTemplateStore } from "@/store/workoutTemplateStore";

import { useAuthStore } from "../store/authStore";
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

// ─── Food Database ────────────────────────────────────────────────────────────

const foodItems = [
  { name: "Chicken Breast", cal: 165, p: 31, c: 0, f: 3.6, serving: "100g", cat: "Protein", img: "photo-1532550907401-a500c9a57435", fav: true },
  { name: "Whole Eggs", cal: 155, p: 13, c: 1.1, f: 11, serving: "2 large", cat: "Protein", img: "photo-1506976785307-8732e854ad03", fav: false },
  { name: "Atlantic Salmon", cal: 208, p: 28, c: 0, f: 10, serving: "150g", cat: "Protein", img: "photo-1467003909585-2f8a72700288", fav: true },
  { name: "Lean Ground Beef", cal: 215, p: 26, c: 0, f: 12, serving: "150g", cat: "Protein", img: "photo-1558618666-fcd25c85cd64", fav: false },
  { name: "Brown Rice", cal: 218, p: 4.5, c: 46, f: 1.6, serving: "1 cup cooked", cat: "Carbs", img: "photo-1516714819001-8ee7a13b71d7", fav: false },
  { name: "Sweet Potato", cal: 130, p: 2, c: 30, f: 0.2, serving: "1 medium", cat: "Carbs", img: "photo-1596097635121-14b63b7a0c19", fav: true },
  { name: "Avocado", cal: 160, p: 2, c: 9, f: 15, serving: "1/2 medium", cat: "Healthy Fats", img: "photo-1523049673857-eb18f1d7b578", fav: true },
  { name: "Banana", cal: 105, p: 1.3, c: 27, f: 0.4, serving: "1 medium", cat: "Fruit", img: "photo-1571771894821-ce9b6c11b08e", fav: false },
  { name: "Broccoli", cal: 55, p: 3.7, c: 11, f: 0.6, serving: "1 cup", cat: "Vegetables", img: "photo-1584270354949-c26b0d5b4a0c", fav: false },
  { name: "Whey Protein", cal: 120, p: 24, c: 3, f: 2, serving: "1 scoop", cat: "Supplements", img: "photo-1571019614242-c5c5dee9f50b", fav: false },
];

function FoodDatabaseScreen({ onNavigate, onBack }: {
  onNavigate: (s: Screen) => void; onBack: () => void;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [favorites, setFavorites] = useState(new Set(foodItems.filter(f => f.fav).map(f => f.name)));

  const categories = ["All", "Protein", "Carbs", "Healthy Fats", "Vegetables", "Fruit", "Supplements"];

  const filtered = foodItems.filter(f =>
    (activeCategory === "All" || f.cat === activeCategory) &&
    (search === "" || f.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="pb-8">
      <SubScreenHeader title="Food Library" onBack={onBack} />

      {/* Search */}
      <div className="px-5 mb-4">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-[14px]"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <Search size={16} color={C.fg3} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search foods, recipes…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: C.fg, fontFamily: "Inter" }}
          />
          {search && <button onClick={() => setSearch("")}><X size={14} color={C.fg3} /></button>}
        </div>
      </div>

      {/* Category chips */}
      <div className="px-5 flex gap-2 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
        {categories.map((cat) => (
          <Pill key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>
            {cat}
          </Pill>
        ))}
      </div>

      {/* Food grid */}
      <div className="px-5 grid grid-cols-2 gap-3">
        {filtered.map((food, i) => (
          <div
            key={i}
            onClick={() => onNavigate("meal-detail")}
            className="rounded-[20px] overflow-hidden text-left cursor-pointer"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div className="relative h-28 bg-[#222]">
              <img
                src={`https://images.unsplash.com/${food.img}?w=200&h=160&fit=crop&auto=format`}
                alt={food.name}
                className="w-full h-full object-cover"
              />
              <button
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(9,9,9,0.65)", backdropFilter: "blur(8px)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setFavorites((prev) => {
                    const n = new Set(prev);
                    n.has(food.name) ? n.delete(food.name) : n.add(food.name);
                    return n;
                  });
                }}
              >
                <Heart
                  size={13}
                  fill={favorites.has(food.name) ? C.red : "none"}
                  color={favorites.has(food.name) ? C.red : C.fg2}
                />
              </button>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold leading-tight mb-1" style={{ color: C.fg }}>{food.name}</p>
              <p className="text-[10px] mb-2" style={{ color: C.fg3 }}>{food.serving}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold" style={{ color: C.amber }}>{food.cal} kcal</span>
                <span className="text-[10px]" style={{ color: C.fg3 }}>P {food.p}g</span>
              </div>
            </div>
          </div>
        ))}
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
          style={{ background: "linear-gradient(to bottom, rgba(9,9,9,0.25) 0%, rgba(9,9,9,0.85) 100%)" }}
        />
        <button
          onClick={onBack}
          className="absolute top-4 left-5 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(9,9,9,0.6)", backdropFilter: "blur(12px)", border: `1px solid ${C.border}` }}
        >
          <ArrowLeft size={16} color={C.fg} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <Badge>Post-Workout</Badge>
          <h2 className="text-xl font-bold mt-1.5" style={{ color: C.fg }}>Salmon & Quinoa Bowl</h2>
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
              <p className="text-lg font-bold leading-none" style={{ color }}>{val}</p>
              <p className="text-[9px] mt-1" style={{ color: C.fg3 }}>{unit}</p>
              <p className="text-[9px] mt-0.5" style={{ color: C.fg2 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Micronutrients */}
        <div className="rounded-[20px] p-4 mb-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
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
        <div className="rounded-[20px] p-4 mb-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
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
        <div className="rounded-[20px] p-4 mb-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
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
          className="rounded-[20px] p-4 mb-4"
          style={{ background: C.accentDim2, border: "1px solid rgba(124,255,107,0.15)" }}
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
        <div className="rounded-[20px] p-4 mb-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
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
          className="rounded-[20px] p-4"
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

const calData = [
  { day: "Mon", cal: 95 },
  { day: "Tue", cal: 102 },
  { day: "Wed", cal: 88 },
  { day: "Thu", cal: 105 },
  { day: "Fri", cal: 79 },
  { day: "Sat", cal: 98 },
  { day: "Sun", cal: 58 },
];

function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const scores = [
    { label: "Lean Bulk Score", val: 87, color: C.accent, desc: "Excellent" },
    { label: "Training Consistency", val: 92, color: C.blue, desc: "Outstanding" },
    { label: "Recovery Score", val: 74, color: C.amber, desc: "Good" },
    { label: "Sleep Score", val: 68, color: C.purple, desc: "Improve" },
  ];

  return (
    <div className="pb-8">
      <SubScreenHeader title="Analytics" onBack={onBack} />

      <div className="px-5">
        {/* Score grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {scores.map(({ label, val, color, desc }) => (
            <div key={label} className="rounded-[20px] p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex justify-between items-start mb-3">
                <p className="text-[11px] leading-tight" style={{ color: C.fg2, maxWidth: 72 }}>{label}</p>
                <ProgressRing value={val} max={100} size={38} stroke={4} color={color}>
                  <span className="text-[10px] font-bold" style={{ color: C.fg }}>{val}</span>
                </ProgressRing>
              </div>
              <p className="text-sm font-bold" style={{ color }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Calorie chart */}
        <div className="rounded-[22px] p-4 mb-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: C.fg2 }}>
                Weekly Avg Calories
              </p>
              <p className="text-2xl font-extrabold mt-0.5 leading-none" style={{ color: C.fg }}>
                2,971<span className="text-sm font-medium ml-1" style={{ color: C.fg3 }}>kcal</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px]" style={{ color: C.fg3 }}>Target</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: C.fg }}>3,100 kcal</p>
            </div>
          </div>
          <div style={{ height: 90 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calData} barSize={22} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
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
                <Bar dataKey="cal" fill={C.accentDim} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macro adherence */}
        <div className="rounded-[22px] p-4 mb-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <SectionHeader title="Macro Adherence" />
          <div className="flex flex-col gap-4">
            {[
              { label: "Protein", val: 89, color: C.accent },
              { label: "Carbohydrates", val: 93, color: C.blue },
              { label: "Fat", val: 84, color: C.purple },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm" style={{ color: C.fg2 }}>{label}</span>
                  <span className="text-sm font-bold" style={{ color: C.fg }}>{val}%</span>
                </div>
                <div style={{ height: 4, background: C.border, borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${val}%`, background: color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI recommendation */}
        <div
          className="rounded-[22px] p-5"
          style={{
            background: "linear-gradient(135deg, rgba(124,255,107,0.07) 0%, rgba(91,141,239,0.07) 100%)",
            border: "1px solid rgba(124,255,107,0.18)",
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
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.accent }}>AI Insight</p>
              <p className="text-[10px]" style={{ color: C.fg3 }}>Based on last 14 days</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: C.fg }}>
            Your lean bulk is progressing well at +0.27 kg/week. Based on weight trend and recovery
            markers, consider increasing daily calories by{" "}
            <span style={{ color: C.accent, fontWeight: 700 }}>+150 kcal</span> to maintain
            optimal muscle growth while keeping fat gain minimal.
          </p>
          <button
            className="w-full py-3 rounded-[14px] text-sm font-bold"
            style={{
              background: C.accentDim,
              border: "1px solid rgba(124,255,107,0.2)",
              color: C.accent,
            }}
          >
            Apply Recommendation
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Grocery List ─────────────────────────────────────────────────────────────

const groceryData = [
  {
    section: "Protein",
    items: [
      { name: "Chicken Breast", qty: "1.5 kg", price: 12.50, mealPrep: true },
      { name: "Atlantic Salmon", qty: "600g", price: 14.80, mealPrep: true },
      { name: "Whole Eggs (12)", qty: "1 pack", price: 5.20, mealPrep: false },
      { name: "Whey Protein Isolate", qty: "1 tub", price: 42.00, mealPrep: false },
    ],
  },
  {
    section: "Carbohydrates",
    items: [
      { name: "Brown Rice", qty: "2 kg", price: 4.50, mealPrep: true },
      { name: "Rolled Oats", qty: "1 kg", price: 3.80, mealPrep: true },
      { name: "Sweet Potato", qty: "1 kg", price: 3.20, mealPrep: false },
      { name: "Quinoa", qty: "500g", price: 6.90, mealPrep: true },
    ],
  },
  {
    section: "Produce",
    items: [
      { name: "Baby Spinach", qty: "300g", price: 3.50, mealPrep: true },
      { name: "Broccoli", qty: "600g", price: 2.80, mealPrep: false },
      { name: "Banana", qty: "6 pcs", price: 2.20, mealPrep: false },
      { name: "Cherry Tomatoes", qty: "400g", price: 4.10, mealPrep: true },
    ],
  },
  {
    section: "Healthy Fats",
    items: [
      { name: "Avocado", qty: "4 pcs", price: 5.60, mealPrep: false },
      { name: "Extra Virgin Olive Oil", qty: "500ml", price: 8.90, mealPrep: false },
      { name: "Almonds", qty: "200g", price: 6.40, mealPrep: false },
    ],
  },
];

function GroceryListScreen({ onBack }: { onBack: () => void }) {
  const allItems = groceryData.flatMap((s) => s.items.map((i) => i.name));
  const [checked, setChecked] = useState<Set<string>>(new Set(["Whole Eggs (12)", "Quinoa"]));

  const toggle = (name: string) => {
    setChecked((prev) => {
      const n = new Set(prev);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });
  };

  const total = groceryData.flatMap((s) => s.items).reduce((a, i) => a + i.price, 0);
  const doneCount = checked.size;

  return (
    <div className="pb-8">
      <SubScreenHeader title="Grocery List" onBack={onBack} />

      <div className="px-5">
        {/* Summary */}
        <div className="rounded-[20px] p-4 mb-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold" style={{ color: C.fg }}>Shopping progress</span>
            <span className="text-sm font-bold" style={{ color: C.accent }}>
              {Math.round((doneCount / allItems.length) * 100)}%
            </span>
          </div>
          <div style={{ height: 4, background: C.border, borderRadius: 99, marginBottom: 12 }}>
            <div
              style={{
                height: "100%",
                width: `${(doneCount / allItems.length) * 100}%`,
                background: C.accent,
                borderRadius: 99,
                transition: "width 0.4s",
              }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-sm" style={{ color: C.fg2 }}>
              {doneCount} of {allItems.length} items
            </span>
            <span className="text-sm font-bold" style={{ color: C.fg }}>
              £{total.toFixed(2)} est.
            </span>
          </div>
        </div>

        {/* Items by section */}
        <div className="flex flex-col gap-5">
          {groceryData.map(({ section, items }) => (
            <div key={section}>
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-3"
                style={{ color: C.fg2 }}
              >
                {section}
              </p>
              <div
                className="rounded-[20px] overflow-hidden"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                {items.map(({ name, qty, price, mealPrep }, i) => {
                  const isDone = checked.has(name);
                  return (
                    <div
                      key={name}
                      className="flex items-center gap-3 px-4 py-3.5"
                      style={{
                        borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none",
                        opacity: isDone ? 0.4 : 1,
                        transition: "opacity 0.2s",
                      }}
                    >
                      <button
                        onClick={() => toggle(name)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isDone ? C.accentDim : "transparent",
                          border: `1.5px solid ${isDone ? C.accent : C.fg3}`,
                        }}
                      >
                        {isDone && <Check size={12} color={C.accent} strokeWidth={2.5} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: C.fg, textDecoration: isDone ? "line-through" : "none" }}
                          >
                            {name}
                          </p>
                          {mealPrep && (
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{ background: "rgba(91,141,239,0.15)", color: C.blue, flexShrink: 0 }}
                            >
                              PREP
                            </span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: C.fg3 }}>{qty}</p>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: C.fg }}>£{price.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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
    <div
      className="absolute bottom-0 left-0 right-0 flex justify-around items-center pt-2 pb-6"
      style={{
        background: "rgba(9,9,9,0.95)",
        borderTop: `1px solid ${C.border}`,
        backdropFilter: "blur(24px)",
      }}
    >
      {navItems.map(({ id, icon: Icon, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className="flex flex-col items-center gap-1 px-4 py-0.5"
          >
            <Icon
              size={22}
              color={isActive ? C.accent : C.fg3}
              strokeWidth={isActive ? 2.2 : 1.5}
            />
            <span
              className="text-[10px] font-semibold"
              style={{ color: isActive ? C.accent : C.fg3 }}
            >
              {label}
            </span>
          </button>
        );
      })}
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
          boxShadow: `0 0 0 8px #111111, 0 60px 120px rgba(0,0,0,0.9), 0 0 80px rgba(124,255,107,0.04)`,
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
          {screen === "settings" && <SettingsScreen onNavigate={navigate} />}
        </div>

        {/* Bottom navigation */}
        {showNav && <BottomNav active={screen} onNavigate={navigate} />}
      </div>
    </div>
  );
}