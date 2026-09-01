import {
  cancelStreakReminder,
  hasReminderPermission,
  requestReminderPermission,
  scheduleStreakReminder,
} from "@/services/reminderService";
import { create } from "zustand";

export type UnitSystem = "metric" | "imperial";
export type ThemeMode = "dark" | "light";

const STORAGE_KEY = "bulkos.settings.units";
const THEME_KEY = "bulkos.settings.theme";
const REMINDER_KEY = "bulkos.settings.streakReminder";
const REMINDER_HOUR_KEY = "bulkos.settings.streakReminderHour";

function loadUnits(): UnitSystem {
  if (typeof localStorage === "undefined") return "metric";

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "imperial" ? "imperial" : "metric";
  } catch {
    return "metric";
  }
}

function loadTheme(): ThemeMode {
  if (typeof localStorage === "undefined") return "dark";

  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function loadReminderEnabled(): boolean {
  if (typeof localStorage === "undefined") return false;

  try {
    return localStorage.getItem(REMINDER_KEY) === "1";
  } catch {
    return false;
  }
}

function loadReminderHour(): number {
  if (typeof localStorage === "undefined") return 19;

  try {
    const raw = Number(localStorage.getItem(REMINDER_HOUR_KEY));
    return Number.isInteger(raw) && raw >= 0 && raw <= 23 ? raw : 19;
  } catch {
    return 19;
  }
}

/** Reflect the theme onto <html data-theme> so CSS variables switch. */
export function applyTheme(theme: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

type SettingsState = {
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  /** Daily streak reminder (local notification). */
  streakReminder: boolean;
  streakReminderHour: number;
  setStreakReminder: (enabled: boolean) => Promise<void>;
  setStreakReminderHour: (hour: number) => Promise<void>;
};

/**
 * App-wide preferences. Persisted locally (display choices, not account
 * data) so the app remembers them across launches without a network trip.
 */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  units: loadUnits(),
  setUnits: (units) => {
    try {
      localStorage.setItem(STORAGE_KEY, units);
    } catch {
      // non-fatal — just won't persist
    }
    set({ units });
  },

  theme: loadTheme(),
  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // non-fatal
    }
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    get().setTheme(get().theme === "dark" ? "light" : "dark");
  },

  streakReminder: loadReminderEnabled(),
  streakReminderHour: loadReminderHour(),

  setStreakReminder: async (enabled) => {
    if (!enabled) {
      try {
        localStorage.setItem(REMINDER_KEY, "0");
      } catch {
        // non-fatal
      }
      set({ streakReminder: false });
      await cancelStreakReminder();
      return;
    }

    // Turning it on needs permission; if the user declines, leave it off
    // rather than showing a toggle that silently does nothing.
    const granted =
      (await hasReminderPermission()) || (await requestReminderPermission());

    if (!granted) {
      set({ streakReminder: false });
      return;
    }

    const scheduled = await scheduleStreakReminder(get().streakReminderHour);
    if (!scheduled) {
      set({ streakReminder: false });
      return;
    }

    try {
      localStorage.setItem(REMINDER_KEY, "1");
    } catch {
      // non-fatal
    }
    set({ streakReminder: true });
  },

  setStreakReminderHour: async (hour) => {
    const safeHour = Math.min(23, Math.max(0, Math.round(hour)));

    try {
      localStorage.setItem(REMINDER_HOUR_KEY, String(safeHour));
    } catch {
      // non-fatal
    }
    set({ streakReminderHour: safeHour });

    // Re-schedule at the new time if reminders are currently on.
    if (get().streakReminder) {
      await scheduleStreakReminder(safeHour);
    }
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
