import { C } from "@/shared/ui";
import type { MealType } from "@/store/appStore";
import type { LoggedFood } from "@/types/food";

type Totals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type Props = {
  meal: {
    id: MealType;
    label: string;
    time: string;
    /** 24h "HH:MM" value for the <input type="time">, e.g. "09:15". */
    time24: string;
  };
  foods: LoggedFood[];
  total: Totals;
  onAdd: () => void;
  onTimeChange: (time24: string) => void;
};

export default function NutritionMealCard({
  meal,
  foods,
  total,
  onAdd,
  onTimeChange,
}: Props) {
  return (
    <div
      className="rounded-[20px] overflow-hidden card-lit"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: C.accentInk }}
            >
              {meal.label}
            </span>

            {/* Tapping the time opens the native time picker (invisible
                input layered over the styled label) so editing feels like
                part of the design rather than a raw form field. */}
            <label className="relative flex items-center w-fit mt-1">
              <p className="text-[11px]" style={{ color: C.fg3 }}>
                {meal.time}
              </p>
              <input
                type="time"
                value={meal.time24}
                onChange={(e) => e.target.value && onTimeChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label={`${meal.label} time`}
              />
            </label>
          </div>

          <button
            onClick={onAdd}
            className="px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: C.accentDim,
              color: C.accentInk,
              border: `1px solid rgba(204,242,50,0.2)`,
            }}
          >
            + Add
          </button>
        </div>

        {foods.length === 0 ? (
          <p className="text-sm" style={{ color: C.fg3 }}>
            No foods logged yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {foods.map((food) => (
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
                    <p className="text-[11px]" style={{ color: C.fg3 }}>
                      {food.grams}g
                    </p>
                  </div>

                  <p className="text-xs font-bold" style={{ color: C.amber }}>
                    {food.calories} kcal
                  </p>
                </div>

                <div className="flex gap-2 mt-1">
                  <span className="text-[11px]" style={{ color: C.fg3 }}>
                    P{food.protein}g
                  </span>
                  <span className="text-[11px]" style={{ color: C.fg3 }}>
                    C{food.carbs}g
                  </span>
                  <span className="text-[11px]" style={{ color: C.fg3 }}>
                    F{food.fat}g
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-2 flex gap-2 text-[11px]">
              <span style={{ color: C.amber }}>
                {Math.round(total.calories)} kcal
              </span>
              <span style={{ color: C.fg3 }}>
                P{total.protein.toFixed(1)}g
              </span>
              <span style={{ color: C.fg3 }}>
                C{total.carbs.toFixed(1)}g
              </span>
              <span style={{ color: C.fg3 }}>
                F{total.fat.toFixed(1)}g
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}