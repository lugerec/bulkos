import { create } from "zustand";

export type UnitSystem = "metric" | "imperial";

const STORAGE_KEY = "bulkos.settings.units";

function loadUnits(): UnitSystem {
  if (typeof localStorage === "undefined") return "metric";

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "imperial" ? "imperial" : "metric";
  } catch {
    return "metric";
  }
}

type SettingsState = {
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
};

/**
 * App-wide preferences. Units persist locally (they're a display choice, not
 * account data) so the app remembers them across launches without a network
 * round-trip.
 */
export const useSettingsStore = create<SettingsState>((set) => ({
  units: loadUnits(),
  setUnits: (units) => {
    try {
      localStorage.setItem(STORAGE_KEY, units);
    } catch {
      // non-fatal — just won't persist
    }
    set({ units });
  },
}));

const KG_PER_LB = 0.45359237;

/** Convert a kg weight to the chosen unit's numeric value. */
export function toDisplayWeight(kg: number, units: UnitSystem): number {
  return units === "imperial" ? kg / KG_PER_LB : kg;
}

/** Convert a value the user typed (in their unit) back to kg for storage. */
export function fromDisplayWeight(value: number, units: UnitSystem): number {
  return units === "imperial" ? value * KG_PER_LB : value;
}

/** Unit label, e.g. "kg" / "lb". */
export function weightUnit(units: UnitSystem): string {
  return units === "imperial" ? "lb" : "kg";
}

/**
 * Format a kg weight for display in the chosen unit, rounded sensibly.
 * e.g. formatWeight(100, "imperial") -> "220 lb".
 */
export function formatWeight(kg: number, units: UnitSystem): string {
  const value = toDisplayWeight(kg, units);
  const rounded = Math.round(value * 10) / 10;
  const clean = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);

  return `${clean} ${weightUnit(units)}`;
}
