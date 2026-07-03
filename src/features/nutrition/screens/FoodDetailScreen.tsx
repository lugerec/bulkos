import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Plus,
} from "lucide-react";

import { C } from "@/shared/ui";
import type { FoodItem } from "@/types/food";

type Props = {
  food: FoodItem;
  onBack: () => void;
};

const meals = [
  "Breakfast",
  "Morning Snack",
  "Lunch",
  "Pre Workout",
  "Post Workout",
  "Dinner",
] as const;

export default function FoodDetailScreen({ food, onBack }: Props) {
  const [grams, setGrams] = useState(100);
  const [meal, setMeal] = useState<(typeof meals)[number]>("Breakfast");

  const multiplier = grams / food.serving;

  const calories = Math.round(food.calories * multiplier);
  const protein = Number((food.protein * multiplier).toFixed(1));
  const carbs = Number((food.carbs * multiplier).toFixed(1));
  const fat = Number((food.fat * multiplier).toFixed(1));

  const decrease = () => setGrams((v) => Math.max(10, v - 10));
  const increase = () => setGrams((v) => v + 10);

  return (
    <div className="px-5 pb-8 pt-4">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-full flex items-center justify-center mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <ArrowLeft size={18} color={C.fg} />
      </button>

      <div
        className="rounded-[28px] p-5 mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-extrabold" style={{ color: C.fg }}>
                {food.name}
              </h2>
              {food.verified && <CheckCircle2 size={17} color={C.accent} />}
            </div>

            <p className="text-sm" style={{ color: C.fg3 }}>
              {food.category} · per {food.serving}
              {food.unit}
            </p>
          </div>

          <p className="text-xl font-extrabold" style={{ color: C.amber }}>
            {food.calories}
            <span className="text-xs ml-1" style={{ color: C.fg3 }}>
              kcal
            </span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Macro label="Protein" value={food.protein} color={C.accent} />
          <Macro label="Carbs" value={food.carbs} color={C.blue} />
          <Macro label="Fat" value={food.fat} color={C.purple} />
        </div>
      </div>

      <div
        className="rounded-[28px] p-5 mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-4"
          style={{ color: C.fg2 }}
        >
          Meal
        </p>

        <div className="grid grid-cols-2 gap-3">
          {meals.map((item) => {
            const active = meal === item;

            return (
              <button
                key={item}
                onClick={() => setMeal(item)}
                className="rounded-2xl py-3 px-4 text-left"
                style={{
                  background: active ? C.accent : C.card2,
                  border: `1px solid ${active ? C.accent : C.border}`,
                  color: active ? C.bg : C.fg,
                }}
              >
                <span className="text-sm font-semibold">{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="rounded-[28px] p-5 mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-4"
          style={{ color: C.fg2 }}
        >
          Serving size
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={decrease}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: C.card2, border: `1px solid ${C.border}` }}
          >
            <Minus size={18} color={C.fg} />
          </button>

          <div className="text-center">
            <p className="text-5xl font-extrabold leading-none" style={{ color: C.fg }}>
              {grams}
            </p>
            <p className="text-sm mt-1" style={{ color: C.fg3 }}>
              grams
            </p>
          </div>

          <button
            onClick={increase}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: C.accent }}
          >
            <Plus size={18} color={C.bg} />
          </button>
        </div>
      </div>

      <div
        className="rounded-[28px] p-5 mb-6"
        style={{
          background: "linear-gradient(135deg, rgba(124,255,107,0.08), rgba(91,141,239,0.06))",
          border: "1px solid rgba(124,255,107,0.2)",
        }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-4"
          style={{ color: C.fg2 }}
        >
          Calculated macros
        </p>

        <div className="grid grid-cols-2 gap-3">
          <BigMacro label="Calories" value={calories} unit="kcal" color={C.amber} />
          <BigMacro label="Protein" value={protein} unit="g" color={C.accent} />
          <BigMacro label="Carbs" value={carbs} unit="g" color={C.blue} />
          <BigMacro label="Fat" value={fat} unit="g" color={C.purple} />
        </div>
      </div>

      <button
        className="w-full py-4 rounded-[18px] font-bold text-base"
        style={{ background: C.accent, color: C.bg }}
      >
        Add to {meal}
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
      style={{ background: C.card2, border: `1px solid ${C.border}` }}
    >
      <p className="text-[10px] mb-1" style={{ color: C.fg3 }}>
        {label}
      </p>
      <p className="text-sm font-bold" style={{ color }}>
        {value}g
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
      style={{ background: "rgba(9,9,9,0.35)", border: `1px solid ${C.border}` }}
    >
      <p className="text-xs mb-1" style={{ color: C.fg3 }}>
        {label}
      </p>
      <p className="text-2xl font-extrabold" style={{ color }}>
        {value}
        <span className="text-xs ml-1" style={{ color: C.fg3 }}>
          {unit}
        </span>
      </p>
    </div>
  );
}