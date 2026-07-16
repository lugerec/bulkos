import type { SetEffort } from "@/types/workout";

export type SessionEffort = {
  /** Number of rated sets. */
  rated: number;
  counts: Record<SetEffort, number>;
  /** The dominant rating, or null when nothing was rated. */
  overall: SetEffort | null;
};

type EffortInput = {
  sets: { completed?: boolean; effort?: SetEffort }[];
};

const EMPTY_COUNTS: Record<SetEffort, number> = {
  easy: 0,
  moderate: 0,
  hard: 0,
};

/**
 * Summarises how hard a session felt from its per-set effort ratings.
 * Only completed, rated sets count. `overall` is the most frequent rating,
 * breaking ties toward the harder end (hard > moderate > easy) so a session
 * that's borderline-tough isn't flattered.
 */
export function getSessionEffort(exercises: EffortInput[]): SessionEffort {
  const counts: Record<SetEffort, number> = { ...EMPTY_COUNTS };

  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (set.completed && set.effort) {
        counts[set.effort] += 1;
      }
    }
  }

  const rated = counts.easy + counts.moderate + counts.hard;

  if (rated === 0) {
    return { rated: 0, counts, overall: null };
  }

  // Order matters for tie-breaking: later entries win ties, so list from
  // easy to hard to bias toward the harder rating.
  const order: SetEffort[] = ["easy", "moderate", "hard"];
  let overall: SetEffort = "easy";
  let best = -1;

  for (const effort of order) {
    if (counts[effort] >= best) {
      best = counts[effort];
      overall = effort;
    }
  }

  return { rated, counts, overall };
}

/** Human label + emoji for a session effort rating. */
export function describeSessionEffort(effort: SetEffort): {
  label: string;
  emoji: string;
} {
  switch (effort) {
    case "easy":
      return { label: "Felt easy", emoji: "🟦" };
    case "moderate":
      return { label: "Solid effort", emoji: "🟩" };
    case "hard":
      return { label: "Tough session", emoji: "🟨" };
  }
}
