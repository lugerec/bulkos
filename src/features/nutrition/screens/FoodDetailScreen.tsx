import { useState } from "react";
import { ArrowLeft, CheckCircle2, Minus, Plus } from "lucide-react";

import { C } from "@/shared/ui";
import type { FoodItem } from "@/types/food";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { addFoodToMeal } from "@/services/logService";
import { toDateKey } from "@/lib/date";

type Props = {
  food: FoodItem;
  onBack: () => void;
};

const mealLabels = {
  breakfast: "Breakfast",
  snack: "Morning Snack",
  lunch: "Lunch",
  preWorkout: "Pre Workout",
  postWorkout: "Post Workout",
  dinner: "Dinner",
} as const;

function getTodayKey() {
  return toDateKey(new Date());
}

export default function FoodDetailScreen({ food, onBack }: Props) {
  const user = useAuthStore((state) => state.user);
  const selectedMeal = useAppStore((state) => state.selectedMeal);
  const navigate = useAppStore((state) => state.navigate);

  const [grams, setGrams] = useState(100);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseServing = food.serving > 0 ? food.serving : 100;
  const multiplier = grams / baseServing;

  const calories = Math.round(food.calories * multiplier);
  const protein = Number((food.protein * multiplier).toFixed(1));
  const carbs = Number((food.carbs * multiplier).toFixed(1));
  const fat = Number((food.fat * multiplier).toFixed(1));

  const category = food.category?.trim();
  const servingLabel = `${food.serving}${food.unit}`;

  const decrease = () => {
    setGrams((current) => Math.max(10, current - 10));
  };

  const increase = () => {
    setGrams((current) => current + 10);
  };

  const handleAddFood = async () => {
    if (!user || saving) return;

    try {
      setSaving(true);
      setError(null);

      await addFoodToMeal({
        uid: user.uid,
        date: getTodayKey(),
        meal: selectedMeal,
        food,
        grams,
      });

      navigate("nutrition");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add food"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 pb-8 pt-4">
      <button
        type="button"
        onClick={onBack}
        className="w-10 h-10 rounded-full flex items-center justify-center mb-5"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
        }}
        aria-label="Go back"
      >
        <ArrowLeft size={18} color={C.fg} />
      </button>

      <div
        className="rounded-[20px] p-5 mb-4 card-lit"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h2
                className="text-[22px] font-extrabold"
                style={{ color: C.fg }}
              >
                {food.name}
              </h2>

              {food.verified && (
                <CheckCircle2
                  size={17}
                  color={C.accent}
                  className="flex-shrink-0"
                />
              )}
            </div>

            <p className="text-sm" style={{ color: C.fg3 }}>
              {category ? `${category} · ` : ""}
              per {servingLabel}
            </p>
          </div>

          <p
            className="text-[22px] font-extrabold flex-shrink-0"
            style={{ color: C.amber }}
          >
            {Math.round(food.calories)}
            <span
              className="text-xs ml-1"
              style={{ color: C.fg3 }}
            >
              kcal
            </span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Macro
            label="Protein"
            value={food.protein}
            color={C.accent}
          />
          <Macro
            label="Carbs"
            value={food.carbs}
            color={C.blue}
          />
          <Macro
            label="Fat"
            value={food.fat}
            color={C.purple}
          />
        </div>
      </div>

      <div
        className="rounded-[20px] p-5 mb-4 card-lit"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
        }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-2"
          style={{ color: C.fg2 }}
        >
          Meal
        </p>

        <p
          className="text-[22px] font-extrabold"
          style={{ color: C.fg }}
        >
          {mealLabels[selectedMeal]}
        </p>
      </div>

      <div
        className="rounded-[20px] p-5 mb-4 card-lit"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
        }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-4"
          style={{ color: C.fg2 }}
        >
          Serving size
        </p>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={decrease}
            disabled={grams <= 10 || saving}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: C.card2,
              border: `1px solid ${C.border}`,
              opacity: grams <= 10 || saving ? 0.5 : 1,
            }}
            aria-label="Decrease serving"
          >
            <Minus size={18} color={C.fg} />
          </button>

          <div className="text-center">
            <p
              className="text-5xl font-extrabold leading-none"
              style={{ color: C.fg }}
            >
              {grams}
            </p>

            <p
              className="text-sm mt-1"
              style={{ color: C.fg3 }}
            >
              grams
            </p>
          </div>

          <button
            type="button"
            onClick={increase}
            disabled={saving}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: C.accent,
              opacity: saving ? 0.6 : 1,
            }}
            aria-label="Increase serving"
          >
            <Plus size={18} color={C.bg} />
          </button>
        </div>
      </div>

      <div
        className="rounded-[20px] p-5 mb-4 card-lit"
        style={{
          background:
            "linear-gradient(135deg, rgba(74,222,128,0.08), rgba(96,165,250,0.06))",
          border: "1px solid rgba(74,222,128,0.2)",
        }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-4"
          style={{ color: C.fg2 }}
        >
          Calculated macros
        </p>

        <div className="grid grid-cols-2 gap-3">
          <BigMacro
            label="Calories"
            value={calories}
            unit="kcal"
            color={C.amber}
          />
          <BigMacro
            label="Protein"
            value={protein}
            unit="g"
            color={C.accent}
          />
          <BigMacro
            label="Carbs"
            value={carbs}
            unit="g"
            color={C.blue}
          />
          <BigMacro
            label="Fat"
            value={fat}
            unit="g"
            color={C.purple}
          />
        </div>
      </div>

      {error && (
        <div
          className="rounded-[14px] px-4 py-3 mb-3"
          style={{
            background: "rgba(255,77,77,0.08)",
            border: "1px solid rgba(255,77,77,0.25)",
          }}
        >
          <p className="text-sm" style={{ color: "#ff4d4d" }}>
            {error}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleAddFood}
        disabled={!user || saving}
        className="w-full py-4 rounded-[20px] font-bold text-base card-lit"
        style={{
          background: C.accent,
          color: C.bg,
          opacity: !user || saving ? 0.6 : 1,
        }}
      >
        {saving
          ? "Adding..."
          : `Add to ${mealLabels[selectedMeal]}`}
      </button>
    </div>
  );
}

function Macro({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-3"
      style={{
        background: C.card2,
        border: `1px solid ${C.border}`,
      }}
    >
      <p className="text-[11px] mb-1" style={{ color: C.fg3 }}>
        {label}
      </p>

      <p className="text-sm font-bold" style={{ color }}>
        {Number(value.toFixed(1))}g
      </p>
    </div>
  );
}

function BigMacro({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "rgba(10,10,11,0.35)",
        border: `1px solid ${C.border}`,
      }}
    >
      <p className="text-xs mb-1" style={{ color: C.fg3 }}>
        {label}
      </p>

      <p className="text-[22px] font-extrabold" style={{ color }}>
        {value}
        <span
          className="text-xs ml-1"
          style={{ color: C.fg3 }}
        >
          {unit}
        </span>
      </p>
    </div>
  );
}