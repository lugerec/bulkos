import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useFoodStore } from "@/store/foodStore";
import { useAppStore, type MealType } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { useDailyLogStore } from "@/store/dailyLogStore";
import { useDailyTotalsStore } from "@/store/dailyTotalsStore";
import { C, type Screen } from "@/shared/ui";
import {
  ProgressRing,
  MacroBar,
  SectionHeader,
} from "@/shared/components";
import NutritionMealCard from "@/features/nutrition/components/NutritionMealCard";
import { toDateKey } from "@/lib/date";

const meals: { id: MealType; label: string; time: string }[] = [
  { id: "breakfast", label: "Breakfast", time: "7:30 AM" },
  { id: "snack", label: "Morning Snack", time: "10:00 AM" },
  { id: "lunch", label: "Lunch", time: "1:00 PM" },
  { id: "preWorkout", label: "Pre-Workout", time: "4:30 PM" },
  { id: "postWorkout", label: "Post-Workout", time: "6:30 PM" },
  { id: "dinner", label: "Dinner", time: "8:00 PM" },
];

/** Date `offset` days before today (offset <= 0), at local midnight. */
function dateFromOffset(offset: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

function dayLabel(offset: number, date: Date) {
  if (offset === 0) return "Today";
  if (offset === -1) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function NutritionScreen({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const nutrition = useAuthStore((s) => s.profile)?.nutrition;

  const { foods, loadFoods, loading } = useFoodStore();
  const setSelectedMeal = useAppStore((s) => s.setSelectedMeal);

  const foodsByMeal = useDailyLogStore((s) => s.foodsByMeal);
  const loadDailyLog = useDailyLogStore((s) => s.loadDailyLog);

  const totals = useDailyTotalsStore((s) => s.totals);
  const mealTotals = useDailyTotalsStore((s) => s.mealTotals);

  // 0 = today, -1 = yesterday… (never positive; no future days).
  const [dateOffset, setDateOffset] = useState(0);
  const selectedDate = dateFromOffset(dateOffset);
  const selectedKey = toDateKey(selectedDate);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  useEffect(() => {
    if (!user) return;
    loadDailyLog(user.uid, selectedKey);
  }, [user, loadDailyLog, selectedKey]);

  const openFoodDatabase = (meal: MealType) => {
    setSelectedMeal(meal);
    onNavigate("food-db");
  };

  // Mirror the dashboard: use the profile's computed macro targets, falling
  // back to the same defaults so an unconfigured profile still renders.
  const goals = {
    cal: nutrition?.calories ?? 3100,
    p: nutrition?.protein ?? 220,
    c: nutrition?.carbs ?? 310,
    f: nutrition?.fat ?? 85,
  };

  return (
    <div className="pb-8">
      <div className="px-5 pt-4 pb-5">
        <h2 className="text-[22px] font-bold mb-2" style={{ color: C.fg }}>
          Nutrition
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDateOffset((o) => o - 1)}
            aria-label="Previous day"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
          >
            <ChevronLeft size={16} />
          </button>

          <span
            className="text-sm font-semibold min-w-[130px] text-center"
            style={{ color: C.fg2 }}
          >
            {dayLabel(dateOffset, selectedDate)}
          </span>

          <button
            onClick={() => setDateOffset((o) => Math.min(0, o + 1))}
            disabled={dateOffset === 0}
            aria-label="Next day"
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        className="mx-5 mb-4 rounded-[20px] p-5 card-lit"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[11px]" style={{ color: C.fg2 }}>
              Total consumed
            </p>

            <p
              className="text-[32px] font-extrabold mt-0.5 leading-none"
              style={{ color: C.fg }}
            >
              {Math.round(totals.calories).toLocaleString()}
              <span className="text-base font-medium ml-1" style={{ color: C.fg3 }}>
                kcal
              </span>
            </p>

            <p className="text-xs mt-1.5" style={{ color: C.fg3 }}>
              {Math.max(goals.cal - Math.round(totals.calories), 0)} remaining
            </p>
          </div>

          <ProgressRing
            value={totals.calories}
            max={goals.cal}
            size={68}
            stroke={5}
            color={C.amber}
          >
            <span className="text-[13px] font-bold" style={{ color: C.fg }}>
              {Math.round((totals.calories / goals.cal) * 100)}%
            </span>
          </ProgressRing>
        </div>

        <div className="flex flex-col gap-3.5">
          <MacroBar label="Protein" current={totals.protein} goal={goals.p} color={C.accent} />
          <MacroBar label="Carbohydrates" current={totals.carbs} goal={goals.c} color={C.blue} />
          <MacroBar label="Fat" current={totals.fat} goal={goals.f} color={C.purple} />
        </div>
      </div>

      <div className="px-5">
        <SectionHeader
          title="Meals"
          action="Add food"
          onAction={() => openFoodDatabase("breakfast")}
        />

        <div className="flex flex-col gap-3">
          {meals.map((meal) => (
            <NutritionMealCard
              key={meal.id}
              meal={meal}
              foods={foodsByMeal[meal.id]}
              total={mealTotals[meal.id]}
              onAdd={() => openFoodDatabase(meal.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}