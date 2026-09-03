import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Globe, Search, CheckCircle2, ScanLine, X, Star, Plus, Clock } from "lucide-react";

import { C } from "@/shared/ui";
import { useFoodStore } from "@/store/foodStore";
import { useRewardsStore } from "@/store/rewardsStore";
import { useAppStore } from "@/store/appStore";
import { matchesSearch } from "@/lib/text";
import { useAuthStore } from "@/store/authStore";
import { useDailyLogStore } from "@/store/dailyLogStore";
import {
  searchOpenFoodFacts,
  lookupOffBarcode,
} from "@/services/openFoodFactsService";
import {
  scanBarcode,
  isBarcodeScanSupported,
} from "@/services/barcodeScanner";
import {
  addFoodToMeal,
  logPortion,
  getRecentLoggedFoods,
} from "@/services/logService";
import type { FoodItem, RecentFood } from "@/types/food";
import FoodDetailScreen from "./FoodDetailScreen";

const ONLINE_SEARCH_MIN_CHARS = 3;
const ONLINE_SEARCH_DEBOUNCE_MS = 500;

const MEAL_LABELS = {
  breakfast: "Breakfast",
  snack: "Morning Snack",
  lunch: "Lunch",
  preWorkout: "Pre-Workout",
  postWorkout: "Post-Workout",
  dinner: "Dinner",
} as const;

export default function FoodDatabaseScreen({ onBack }: { onBack?: () => void }) {
  const { foods, loadFoods, loading } = useFoodStore();
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [onlineResults, setOnlineResults] = useState<FoodItem[]>([]);
  const [onlineLoading, setOnlineLoading] = useState(false);

  // Barcode: "scanning" (camera open) → "looking" (OFF lookup) → "notfound".
  const [scanState, setScanState] = useState<
    "idle" | "scanning" | "looking" | "notfound"
  >("idle");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");

  // Custom product form, shown when a barcode isn't on Open Food Facts.
  const [lastBarcode, setLastBarcode] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const saveFood = useFoodStore((state) => state.saveFood);
  const favorites = useFoodStore((state) => state.favorites);
  const loadFavorites = useFoodStore((state) => state.loadFavorites);
  const toggleFavorite = useFoodStore((state) => state.toggleFavorite);
  const recordEngagement = useRewardsStore((state) => state.recordEngagement);

  const selectedMeal = useAppStore((state) => state.selectedMeal);
  const selectedDateKey = useAppStore((state) => state.selectedDateKey);
  const uid = useAuthStore((state) => state.user?.uid);
  const loadDailyLog = useDailyLogStore((state) => state.loadDailyLog);

  const [recents, setRecents] = useState<RecentFood[]>([]);
  // Key of the row that just got quick-added, for a brief "Added" flash.
  const [addedKey, setAddedKey] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    if (!uid) return;

    let cancelled = false;
    getRecentLoggedFoods(uid)
      .then((items) => {
        if (!cancelled) setRecents(items);
      })
      .catch((error) => {
        console.error("Failed to load recent foods", error);
        if (!cancelled) setRecents([]);
      });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  function flashAdded(key: string) {
    setAddedKey(key);
    setTimeout(() => {
      setAddedKey((current) => (current === key ? null : current));
    }, 1400);
  }

  async function quickAddFavorite(food: FoodItem) {
    if (!uid) return;

    const grams = food.serving > 0 ? food.serving : 100;

    recordEngagement();

    await addFoodToMeal({
      uid,
      date: selectedDateKey,
      meal: selectedMeal,
      food,
      grams,
    });

    await loadDailyLog(uid, selectedDateKey);
    flashAdded(`fav-${food.id}`);
  }

  async function quickAddRecent(recent: RecentFood, index: number) {
    if (!uid) return;

    recordEngagement();

    await logPortion(uid, selectedDateKey, selectedMeal, recent);

    await loadDailyLog(uid, selectedDateKey);
    flashAdded(`recent-${recent.foodId || recent.name}-${index}`);
  }

  async function lookupBarcode(barcode: string) {
    setLastBarcode(barcode);
    setScanState("looking");
    const item = await lookupOffBarcode(barcode);

    if (item) {
      setScanState("idle");
      setSelectedFood(item);
    } else {
      setScanState("notfound");
    }
  }

  function openCustomForm() {
    setScanState("idle");
    setCustomForm({ name: "", calories: "", protein: "", carbs: "", fat: "" });
    setCustomOpen(true);
  }

  async function saveCustomProduct() {
    const name = customForm.name.trim();
    const calories = Number(customForm.calories);

    if (!name || !Number.isFinite(calories) || calories < 0) return;

    const num = (value: string) => {
      const n = Number(value);
      return Number.isFinite(n) && n >= 0 ? Math.round(n * 10) / 10 : 0;
    };

    const item: FoodItem = {
      id: lastBarcode ? `off-${lastBarcode}` : `custom-${Date.now()}`,
      name,
      category: "other",
      calories: Math.round(calories),
      protein: num(customForm.protein),
      carbs: num(customForm.carbs),
      fat: num(customForm.fat),
      serving: 100,
      unit: "g",
      verified: false,
    };

    try {
      await saveFood(item);
      setCustomOpen(false);
      setSelectedFood(item);
    } catch {
      // saveFood surfaces sign-in errors; leave the form open to retry.
    }
  }

  async function handleScanClick() {
    setScanState("idle");

    // No camera (web/dev) — go straight to manual entry.
    if (!isBarcodeScanSupported()) {
      setManualOpen(true);
      return;
    }

    setScanState("scanning");
    const result = await scanBarcode();

    if (result.status === "ok") {
      await lookupBarcode(result.barcode);
    } else if (result.status === "unsupported" || result.status === "error") {
      // Scanner plugin missing (e.g. SPM build) or failed — let them type it.
      setScanState("idle");
      setManualOpen(true);
    } else {
      // cancelled / denied — just return to the list quietly.
      setScanState("idle");
    }
  }

  async function submitManualCode() {
    const code = manualCode.trim();
    if (!code) return;

    setManualOpen(false);
    setManualCode("");
    await lookupBarcode(code);
  }

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
    const query = search.trim();

    if (!query) return foods;

    // Diacritic-insensitive so "sosovica" finds "šošovica".
    return foods.filter((food) => matchesSearch(food.name, query));
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
      <div className="flex items-center gap-3 mb-1">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.fg }}
          >
            <ArrowLeft size={17} />
          </button>
        )}
        <h2 className="text-[22px] font-bold" style={{ color: C.fg }}>
          Food Database
        </h2>
      </div>

      <p className="text-sm mb-5" style={{ color: C.fg3 }}>
        Search your foods and Open Food Facts
      </p>

      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-[14px] flex-1"
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

        <button
          onClick={handleScanClick}
          disabled={scanState === "scanning" || scanState === "looking"}
          aria-label="Scan barcode"
          className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center flex-shrink-0 disabled:opacity-60"
          style={{ background: C.accent, color: "#0A0A0B" }}
        >
          <ScanLine size={19} />
        </button>
      </div>

      {manualOpen && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] mb-3"
          style={{ background: C.card, border: `1px solid ${C.accent}` }}
        >
          <ScanLine size={16} color={C.fg3} />

          <input
            value={manualCode}
            onChange={(event) =>
              setManualCode(event.target.value.replace(/[^0-9]/g, ""))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") submitManualCode();
            }}
            inputMode="numeric"
            autoFocus
            placeholder="Enter barcode number…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: C.fg }}
          />

          <button
            onClick={submitManualCode}
            disabled={!manualCode.trim()}
            className="text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
            style={{ background: C.accent, color: "#0A0A0B" }}
          >
            Look up
          </button>

          <button
            onClick={() => {
              setManualOpen(false);
              setManualCode("");
            }}
            aria-label="Close"
            className="w-6 h-6 flex items-center justify-center flex-shrink-0"
            style={{ color: C.fg3 }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {(scanState === "scanning" || scanState === "looking") && (
        <p className="text-sm mb-3" style={{ color: C.fg3 }}>
          {scanState === "scanning" ? "Opening scanner…" : "Looking up barcode…"}
        </p>
      )}

      {scanState === "notfound" && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] mb-3"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <p className="text-sm" style={{ color: C.fg2 }}>
            Not on Open Food Facts.
          </p>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={openCustomForm}
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: C.accent, color: "#0A0A0B" }}
            >
              Add manually
            </button>

            <button
              onClick={() => setScanState("idle")}
              aria-label="Dismiss"
              className="w-6 h-6 flex items-center justify-center"
              style={{ color: C.fg3 }}
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {customOpen && (
        <div
          className="rounded-[16px] p-4 mb-4"
          style={{ background: C.card, border: `1px solid ${C.accent}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold" style={{ color: C.fg }}>
              New product{lastBarcode ? ` · ${lastBarcode}` : ""}
            </p>

            <button
              onClick={() => setCustomOpen(false)}
              aria-label="Close"
              className="w-6 h-6 flex items-center justify-center"
              style={{ color: C.fg3 }}
            >
              <X size={15} />
            </button>
          </div>

          <input
            value={customForm.name}
            onChange={(event) =>
              setCustomForm((form) => ({ ...form, name: event.target.value }))
            }
            autoFocus
            placeholder="Product name"
            className="w-full bg-transparent outline-none text-sm px-3 py-2.5 rounded-[10px] mb-3"
            style={{ color: C.fg, border: `1px solid ${C.border}` }}
          />

          <p className="text-[11px] mb-2" style={{ color: C.fg3 }}>
            Per 100 g
          </p>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <CustomField
              label="kcal"
              value={customForm.calories}
              onChange={(v) =>
                setCustomForm((form) => ({ ...form, calories: v }))
              }
            />
            <CustomField
              label="P"
              value={customForm.protein}
              onChange={(v) =>
                setCustomForm((form) => ({ ...form, protein: v }))
              }
            />
            <CustomField
              label="C"
              value={customForm.carbs}
              onChange={(v) =>
                setCustomForm((form) => ({ ...form, carbs: v }))
              }
            />
            <CustomField
              label="F"
              value={customForm.fat}
              onChange={(v) => setCustomForm((form) => ({ ...form, fat: v }))}
            />
          </div>

          <button
            onClick={saveCustomProduct}
            disabled={!customForm.name.trim() || !customForm.calories.trim()}
            className="w-full py-3 rounded-[14px] font-bold text-sm disabled:opacity-50"
            style={{ background: C.accent, color: "#0A0A0B" }}
          >
            Save & log
          </button>
        </div>
      )}

      {!search.trim() && (favorites.length > 0 || recents.length > 0) && (
        <div className="mb-5">
          <p className="text-[11px] mb-3" style={{ color: C.fg3 }}>
            Quick-add to {MEAL_LABELS[selectedMeal]}
          </p>

          {favorites.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Star size={13} color={C.accent} fill={C.accent} />
                <p className="text-xs font-bold" style={{ color: C.fg2 }}>
                  Favorites
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {favorites.map((food) => (
                  <QuickRow
                    key={food.id}
                    title={food.name}
                    subtitle={`${Math.round(food.calories)} kcal · ${
                      food.unit === "piece"
                        ? `${food.serving > 0 ? food.serving : 1} ${
                            food.unitLabel ?? "piece"
                          }${food.serving === 1 ? "" : "s"}`
                        : `${food.serving > 0 ? food.serving : 100}${food.unit}`
                    }`}
                    added={addedKey === `fav-${food.id}`}
                    onOpen={() => setSelectedFood(food)}
                    onQuickAdd={() => quickAddFavorite(food)}
                    onRemoveFavorite={() => {
                      toggleFavorite(food).catch(() => {});
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {recents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={13} color={C.fg3} />
                <p className="text-xs font-bold" style={{ color: C.fg2 }}>
                  Recent
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {recents.map((recent, index) => (
                  <QuickRow
                    key={`${recent.foodId || recent.name}-${index}`}
                    title={recent.name}
                    subtitle={`${Math.round(recent.calories)} kcal · ${
                      recent.unit === "piece"
                        ? `${recent.grams} ${recent.unitLabel ?? "piece"}${
                            recent.grams === 1 ? "" : "s"
                          }`
                        : `${recent.grams}g`
                    }`}
                    added={
                      addedKey ===
                      `recent-${recent.foodId || recent.name}-${index}`
                    }
                    onQuickAdd={() => quickAddRecent(recent, index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-2">
          <div className="skeleton" style={{ height: 64 }} />
          <div className="skeleton" style={{ height: 64, opacity: 0.7 }} />
          <div className="skeleton" style={{ height: 64, opacity: 0.4 }} />
        </div>
      )}

      {!loading && filteredFoods.length === 0 && (
        <div
          className="rounded-[20px] p-5 text-center card-lit"
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
          const serving =
            food.unit === "piece"
              ? `${food.serving} ${food.unitLabel ?? "piece"}${
                  food.serving === 1 ? "" : "s"
                }`
              : `${food.serving}${food.unit}`;

          return (
            <button
              key={food.id}
              onClick={() => setSelectedFood(food)}
              className="w-full text-left rounded-[20px] p-4 card-lit"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      className="text-base font-bold"
                      style={{
                        color: C.fg,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.25,
                      }}
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
                    className="w-full text-left rounded-[20px] p-4 card-lit"
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

function QuickRow({
  title,
  subtitle,
  added,
  onOpen,
  onQuickAdd,
  onRemoveFavorite,
}: {
  title: string;
  subtitle: string;
  added: boolean;
  onOpen?: () => void;
  onQuickAdd: () => void;
  onRemoveFavorite?: () => void;
}) {
  const Info = (
    <div className="min-w-0 text-left">
      <p className="text-sm font-bold truncate" style={{ color: C.fg }}>
        {title}
      </p>
      <p className="text-xs" style={{ color: C.fg3 }}>
        {subtitle}
      </p>
    </div>
  );

  return (
    <div
      className="flex items-center justify-between gap-2 pl-4 pr-2 py-2.5 rounded-[14px]"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      {onOpen ? (
        <button onClick={onOpen} className="min-w-0 flex-1">
          {Info}
        </button>
      ) : (
        <div className="min-w-0 flex-1">{Info}</div>
      )}

      {onRemoveFavorite && (
        <button
          onClick={onRemoveFavorite}
          aria-label={`Remove ${title} from favorites`}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ color: C.accent }}
        >
          <Star size={17} fill={C.accent} />
        </button>
      )}

      <button
        onClick={onQuickAdd}
        disabled={added}
        aria-label={`Add ${title}`}
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: added ? C.card2 : C.accent,
          color: added ? C.accent : "#0A0A0B",
          border: added ? `1px solid ${C.accent}` : "none",
        }}
      >
        {added ? <CheckCircle2 size={17} /> : <Plus size={18} />}
      </button>
    </div>
  );
}

function CustomField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="rounded-xl px-2.5 py-2"
      style={{ background: C.card2, border: `1px solid ${C.border}` }}
    >
      <span className="text-[10px] font-bold" style={{ color: C.fg3 }}>
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value.replace(/[^0-9.]/g, ""))
        }
        inputMode="decimal"
        placeholder="0"
        className="w-full bg-transparent outline-none text-sm mt-0.5"
        style={{ color: C.fg }}
      />
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