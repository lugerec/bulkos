import { mealData } from "../../data/meal";
import { C, type Screen } from "../../shared/ui";
import { ProgressRing, MacroBar, SectionHeader } from "../../shared/components";

// ─── Nutrition ────────────────────────────────────────────────────────────────

export default function NutritionScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const totals = { cal: 1840, p: 142, c: 180, f: 48 };
  const goals = { cal: 3100, p: 220, c: 310, f: 85 };

  return (
    <div className="pb-8">
      <div className="px-5 pt-4 pb-5">
        <h2 className="text-2xl font-bold mb-0.5" style={{ color: C.fg }}>Nutrition</h2>
        <p className="text-sm" style={{ color: C.fg3 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </p>
      </div>

      {/* Macro summary card */}
      <div className="mx-5 mb-5 rounded-[22px] p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[11px]" style={{ color: C.fg2 }}>Total consumed</p>
            <p className="text-3xl font-extrabold mt-0.5 leading-none" style={{ color: C.fg }}>
              {totals.cal.toLocaleString()}
              <span className="text-base font-medium ml-1" style={{ color: C.fg3 }}>kcal</span>
            </p>
            <p className="text-xs mt-1.5" style={{ color: C.fg3 }}>
              {goals.cal - totals.cal} remaining
            </p>
          </div>
          <ProgressRing value={totals.cal} max={goals.cal} size={68} stroke={5} color={C.amber}>
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

      {/* Meal cards */}
      <div className="px-5">
        <SectionHeader title="Meals" action="Add food" onAction={() => onNavigate("food-db")} />
        <div className="flex flex-col gap-3">
          {mealData.map((meal, i) => (
            <div key={i} className="rounded-[20px] overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex gap-3 p-3">
                <div className="w-[68px] h-[68px] rounded-[14px] overflow-hidden flex-shrink-0 bg-[#222]">
                  <img
                    src={`https://images.unsplash.com/${meal.img}?w=136&h=136&fit=crop&auto=format`}
                    alt={meal.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.accent }}>
                      {meal.type}
                    </span>
                    <span className="text-[10px]" style={{ color: C.fg3 }}>{meal.time}</span>
                  </div>
                  <p className="text-sm font-semibold truncate mb-1.5" style={{ color: C.fg }}>{meal.name}</p>
                  <div className="flex gap-2.5">
                    <span className="text-[11px] font-semibold" style={{ color: C.amber }}>{meal.cal}</span>
                    <span className="text-[11px]" style={{ color: C.fg3 }}>P{meal.p}g</span>
                    <span className="text-[11px]" style={{ color: C.fg3 }}>C{meal.c}g</span>
                    <span className="text-[11px]" style={{ color: C.fg3 }}>F{meal.f}g</span>
                  </div>
                </div>
              </div>
              <div className="px-3 pb-3">
                <button
                  onClick={() => onNavigate("food-db")}
                  className="w-full py-2 rounded-[12px] text-xs font-semibold"
                  style={{ background: C.card2, border: `1px solid ${C.border}`, color: C.fg2 }}
                >
                  Change Meal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


