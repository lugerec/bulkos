import { useEffect, useMemo, useState } from "react";
import { Globe, Search, CheckCircle2 } from "lucide-react";

import { C } from "@/shared/ui";
import { useFoodStore } from "@/store/foodStore";
import { searchOpenFoodFacts } from "@/services/openFoodFactsService";
import type { FoodItem } from "@/types/food";
import FoodDetailScreen from "./FoodDetailScreen";

const ONLINE_SEARCH_MIN_CHARS = 3;
const ONLINE_SEARCH_DEBOUNCE_MS = 500;

export default function FoodDatabaseScreen() {
  const { foods, loadFoods, loading } = useFoodStore();
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [onlineResults, setOnlineResults] = useState<FoodItem[]>([]);
  const [onlineLoading, setOnlineLoading] = useState(false);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  useEffect(() => {
    const query = search.trim();

    if (query.length < ONLINE_SEARCH_MIN_CHARS) {
      setOnlineResults([]);
      setOnlineLoading(false);
      return;
    }

    setOnlineLoading(true);

    let cancelled = false;
    const timer = setTimeout(async () => {
      const results = await searchOpenFoodFacts(query);

      if (cancelled) return;

      setOnlineResults(results);
      setOnlineLoading(false);
    }, ONLINE_SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

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
      <h2 className="text-[22px] font-bold mb-1" style={{ color: C.fg }}>
        Food Database
      </h2>

      <p className="text-sm mb-5" style={{ color: C.fg3 }}>
        Search your foods and Open Food Facts
      </p>

      <div
        className="flex items-center gap-3 px-4 py-3 rounded-[14px] mb-5"
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

      {(onlineLoading || onlineResults.length > 0) && (
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={14} color={C.blue} />
            <p className="text-xs font-bold" style={{ color: C.fg2 }}>
              Online results · Open Food Facts
            </p>
          </div>

          {onlineLoading && (
            <p className="text-sm" style={{ color: C.fg3 }}>
              Searching online…
            </p>
          )}

          {!onlineLoading && (
            <div className="flex flex-col gap-3">
              {onlineResults
                .filter(
                  (item) =>
                    !foods.some(
                      (local) =>
                        local.name.toLowerCase() === item.name.toLowerCase()
                    )
                )
                .map((food) => (
                  <button
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className="w-full text-left rounded-[20px] p-4"
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="text-base font-bold truncate mb-1"
                          style={{ color: C.fg }}
                        >
                          {food.name}
                        </p>
                        <p className="text-xs mb-3" style={{ color: C.fg3 }}>
                          per 100g
                        </p>
                      </div>

                      <p
                        className="text-sm font-bold flex-shrink-0"
                        style={{ color: C.fg2 }}
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
                ))}
            </div>
          )}
        </div>
      )}
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