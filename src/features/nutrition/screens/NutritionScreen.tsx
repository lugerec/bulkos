import { useEffect, useMemo } from "react";

import { useFoodStore } from "@/store/foodStore";
import { useAppStore, type MealType } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { useDailyLogStore } from "@/store/dailyLogStore";
import { C, type Screen } from "@/shared/ui";
import {
  ProgressRing,
  MacroBar,
  SectionHeader,
} from "@/shared/components";

const meals: { id: MealType; label: string; time: string }[] = [
  { id: "breakfast", label: "Breakfast", time: "7:30 AM" },
  { id: "snack", label: "Morning Snack", time: "10:00 AM" },
  { id: "lunch", label: "Lunch", time: "1:00 PM" },
  { id: "preWorkout", label: "Pre-Workout", time: "4:30 PM" },
  { id: "postWorkout", label: "Post-Workout", time: "6:30 PM" },
  { id: "dinner", label: "Dinner", time: "8:00 PM" },
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function NutritionScreen({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void;
}) {
  const user = useAuthStore((s) => s.user);

  const { foods, loadFoods, loading } = useFoodStore();
  const setSelectedMeal = useAppStore((s) => s.setSelectedMeal);

  const foodsByMeal = useDailyLogStore((s) => s.foodsByMeal);
  const loadDailyLog = useDailyLogStore((s) => s.loadDailyLog);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  useEffect(() => {
    if (!user) return;
    loadDailyLog(user.uid, getTodayKey());
  }, [user, loadDailyLog]);

  const openFoodDatabase = (meal: MealType) => {
    setSelectedMeal(meal);
    onNavigate("food-db");
  };

  const totals = useMemo(() => {
    const allFoods = Object.values(foodsByMeal).flat();

    return allFoods.reduce(
      (acc, food) => ({
        cal: acc.cal + food.calories,
        p: acc.p + food.protein,
        c: acc.c + food.carbs,
        f: acc.f + food.fat,
      }),
      { cal: 0, p: 0, c: 0, f: 0 }
    );
  }, [foodsByMeal]);

  const goals = { cal: 3100, p: 220, c: 310, f: 85 };

  return (
    <div className="pb-8">
      <div className="px-5 pt-4 pb-5">
        <h2 className="text-2xl font-bold mb-0.5" style={{ color: C.fg }}>
          Nutrition
        </h2>

        <p className="text-sm" style={{ color: C.fg3 }}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </p>

        <p style={{ color: "white", fontSize: 12, marginTop: 12 }}>
          Foods loaded: {loading ? "Loading..." : foods.length}
        </p>
      </div>

      <div
        className="mx-5 mb-5 rounded-[22px] p-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[11px]" style={{ color: C.fg2 }}>
              Total consumed
            </p>
            <p
              className="text-3xl font-extrabold mt-0.5 leading-none"
              style={{ color: C.fg }}
            >
              {Math.round(totals.cal).toLocaleString()}
              <span className="text-base font-medium ml-1" style={{ color: C.fg3 }}>
                kcal
              </span>
            </p>
            <p className="text-xs mt-1.5" style={{ color: C.fg3 }}>
              {Math.max(goals.cal - Math.round(totals.cal), 0)} remaining
            </p>
          </div>

          <ProgressRing
            value={totals.cal}
            max={goals.cal}
            size={68}
            stroke={5}
            color={C.amber}
          >
            <span className="text-[12px] font-bold" style={{ color: C.fg }}>
              {Math.round((totals.cal / goals.cal) * 100)}%
            </span>
          </ProgressRing>
        </div>

        <div className="flex flex-col gap-3.5">
          <MacroBar label="Protein" current={totals.p} goal={goals.p} color={C.accent} />
          <MacroBar label="Carbohydrates" current={totals.c} goal={goals.c} color={C.blue} />
          <MacroBar label="Fat" current={totals.f} goal={goals.f} color={C.purple} />
        </div>
      </div>

      <div className="px-5">
        <SectionHeader
          title="Meals"
          action="Add food"
          onAction={() => openFoodDatabase("breakfast")}
        />

        <div className="flex flex-col gap-3">
          {meals.map((meal) => {
            const mealFoods = foodsByMeal[meal.id];
            const mealTotals = mealFoods.reduce(
              (acc, food) => ({
                cal: acc.cal + food.calories,
                p: acc.p + food.protein,
                c: acc.c + food.carbs,
                f: acc.f + food.fat,
              }),
              { cal: 0, p: 0, c: 0, f: 0 }
            );

            return (
              <div
                key={meal.id}
                className="rounded-[20px] overflow-hidden"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: C.accent }}
                      >
                        {meal.label}
                      </span>
                      <p className="text-[10px] mt-0.5" style={{ color: C.fg3 }}>
                        {meal.time}
                      </p>
                    </div>

                    <button
                      onClick={() => openFoodDatabase(meal.id)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{
                        background: C.accentDim,
                        color: C.accent,
                        border: `1px solid rgba(124,255,107,0.2)`,
                      }}
                    >
                      + Add
                    </button>
                  </div>

                  {mealFoods.length === 0 ? (
                    <p className="text-sm" style={{ color: C.fg3 }}>
                      No foods logged yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {mealFoods.map((food) => (
                        <div
                          key={food.id}
                          className="rounded-[14px] px-3 py-2"
                          style={{
                            background: C.card2,
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          <div className="flex justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold" style={{ color: C.fg }}>
                                {food.name}
                              </p>
                              <p className="text-[10px]" style={{ color: C.fg3 }}>
                                {food.grams}g
                              </p>
                            </div>

                            <p className="text-xs font-bold" style={{ color: C.amber }}>
                              {food.calories} kcal
                            </p>
                          </div>

                          <div className="flex gap-2 mt-1">
                            <span className="text-[10px]" style={{ color: C.fg3 }}>
                              P{food.protein}g
                            </span>
                            <span className="text-[10px]" style={{ color: C.fg3 }}>
                              C{food.carbs}g
                            </span>
                            <span className="text-[10px]" style={{ color: C.fg3 }}>
                              F{food.fat}g
                            </span>
                          </div>
                        </div>
                      ))}

                      <div className="pt-2 flex gap-2 text-[11px]">
                        <span style={{ color: C.amber }}>{Math.round(mealTotals.cal)} kcal</span>
                        <span style={{ color: C.fg3 }}>P{mealTotals.p.toFixed(1)}g</span>
                        <span style={{ color: C.fg3 }}>C{mealTotals.c.toFixed(1)}g</span>
                        <span style={{ color: C.fg3 }}>F{mealTotals.f.toFixed(1)}g</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}