import type { Equipment, ExerciseCategory } from "@/types/workout";

export type RestContext = {
  equipment?: Equipment;
  category?: ExerciseCategory;
  name?: string;
};

const NAME_RULES: ReadonlyArray<{ keywords: string[]; seconds: number }> = [
  { keywords: ["deadlift", "mŕtvy", "rack pull"], seconds: 240 },
  { keywords: ["bench", "squat", "drep"], seconds: 180 },
  { keywords: ["row", "pull", "ohp", "shoulder press"], seconds: 150 },
  { keywords: ["curl", "triceps", "pushdown"], seconds: 90 },
  { keywords: ["lateral", "calf", "abs"], seconds: 60 },
];

/** Name-keyword heuristic (legacy behaviour), or null when nothing matches. */
function restFromName(name: string | undefined): number | null {
  if (!name) return null;

  const lower = name.toLowerCase();

  for (const rule of NAME_RULES) {
    if (rule.keywords.some((keyword) => lower.includes(keyword))) {
      return rule.seconds;
    }
  }

  return null;
}

/**
 * Recommended rest between sets (seconds). Prefers the exercise's own
 * `defaultRestSeconds` when provided; otherwise derives it from
 * equipment + category (heavy compounds rest longer, isolation shorter),
 * falling back to a name-keyword heuristic and finally a 90s default.
 */
export function getRestSeconds(
  context: RestContext,
  defaultRestSeconds?: number
): number {
  if (typeof defaultRestSeconds === "number" && defaultRestSeconds > 0) {
    return defaultRestSeconds;
  }

  const { equipment, category } = context;

  if (category === "compound") {
    if (equipment === "barbell" || equipment === "smithMachine") return 180;
    if (equipment === "dumbbell" || equipment === "machine") return 150;

    return 150;
  }

  if (category === "isolation") {
    return 75;
  }

  // No category info — try the legacy name heuristic, then a safe default.
  return restFromName(context.name) ?? 90;
}
