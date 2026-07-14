import { useEffect, useMemo, useState } from "react";
import { Search, CheckCircle2 } from "lucide-react";

import { C } from "@/shared/ui";
import { useFoodStore } from "@/store/foodStore";
import type { FoodItem } from "@/types/food";
import FoodDetailScreen from "./FoodDetailScreen";

export default function FoodDatabaseScreen() {
  const { foods, loadFoods, loading } = useFoodStore();
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  const filteredFoods = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return foods;

    return foods.filter((food) =>
      food.name.toLowerCase().includes(query)
    );
  }, [foods, search]);

  if (selectedFood) {
    return (
      <FoodDetailScreen
        food={selectedFood}
        onBack={() => setSelectedFood(null)}
      />
    );
  }

  return (
    <div className="px-5 pb-8 pt-4">
      <h2 className="text-2xl font-bold mb-1" style={{ color: C.fg }}>
        Food Database
      </h2>

      <p className="text-sm mb-5" style={{ color: C.fg3 }}>
        Search foods from Firestore
      </p>

      <div
        className="flex items-center gap-3 px-4 py-3 rounded-[16px] mb-5"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        <Search size={16} color={C.fg3} />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search food..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: C.fg }}
        />
      </div>

      {loading && (
        <p className="text-sm" style={{ color: C.fg3 }}>
          Loading foods...
        </p>
      )}

      {!loading && filteredFoods.length === 0 && (
        <div
          className="rounded-[20px] p-5 text-center"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p className="text-sm font-semibold" style={{ color: C.fg }}>
            No foods found
          </p>
          <p className="text-xs mt-1" style={{ color: C.fg3 }}>
            Try a different search.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filteredFoods.map((food) => {
          const category = food.category?.trim();
          const serving = `${food.serving}${food.unit}`;

          return (
            <button
              key={food.id}
              onClick={() => setSelectedFood(food)}
              className="w-full text-left rounded-[20px] p-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      className="text-base font-bold truncate"
                      style={{ color: C.fg }}
                    >
                      {food.name}
                    </p>

                    {food.verified && (
                      <CheckCircle2
                        size={14}
                        color={C.accent}
                        className="flex-shrink-0"
                      />
                    )}
                  </div>

                  <p className="text-xs mb-3" style={{ color: C.fg3 }}>
                    {category ? `${category} · ` : ""}
                    per {serving}
                  </p>
                </div>

                <p
                  className="text-sm font-bold flex-shrink-0"
                  style={{ color: C.amber }}
                >
                  {Math.round(food.calories)} kcal
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Macro label="P" value={food.protein} color={C.accent} />
                <Macro label="C" value={food.carbs} color={C.blue} />
                <Macro label="F" value={food.fat} color={C.purple} />
              </div>
            </button>
          );
        })}
      </div>
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
      className="rounded-xl px-3 py-2"
      style={{ background: C.card2, border: `1px solid ${C.border}` }}
    >
      <span className="text-xs font-bold" style={{ color }}>
        {label}
      </span>

      <span className="text-xs ml-1" style={{ color: C.fg2 }}>
        {Math.round(value)}g
      </span>
    </div>
  );
}