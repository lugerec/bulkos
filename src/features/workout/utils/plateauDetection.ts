import { exerciseDefinitions } from "@/data/exercises";
import type {
  RecommendationWorkout,
} from "@/features/workout/utils/workoutRecommendation";

export type VariationSuggestion = {
  exerciseId: string;
  name: string;
};

/**
 * Alternatives for a stalling lift: same primary muscle, different
 * exercise, preferring a different movement stimulus (other equipment
 * first, then same-equipment variations), compounds before isolation,
 * skipping advanced-difficulty movements.
 */
export function suggestVariations(
  exerciseId: string,
  count = 2
): VariationSuggestion[] {
  const source = exerciseDefinitions.find((item) => item.id === exerciseId);

  if (!source) return [];

  return exerciseDefinitions
    .filter(
      (item) =>
        item.id !== source.id &&
        item.primaryMuscle === source.primaryMuscle &&
        item.difficulty !== "advanced"
    )
    .sort((a, b) => {
      const aDifferentEquipment = a.equipment !== source.equipment ? 0 : 1;
      const bDifferentEquipment = b.equipment !== source.equipment ? 0 : 1;

      if (aDifferentEquipment !== bDifferentEquipment) {
        return aDifferentEquipment - bDifferentEquipment;
      }

      const aCompound = a.category === "compound" ? 0 : 1;
      const bCompound = b.category === "compound" ? 0 : 1;

      return aCompound - bCompound;
    })
    .slice(0, count)
    .map((item) => ({ exerciseId: item.id, name: item.name }));
}

export type ExercisePlateau = {
  exerciseId: string;
  exerciseName: string;
  /** sessions performed since the best estimated 1RM in the window */
  sessionsSinceBest: number;
  /** best estimated 1RM in the window (kg) */
  bestEst1RM: number;
  /** best estimated 1RM across the most recent sessions (kg) */
  recentBestEst1RM: number;
};

const WINDOW_DAYS = 90;
const MIN_SESSIONS = 4;
const RECENT_SESSIONS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Epley estimate, same formula the workout logger uses for PRs. */
function estimateOneRepMax(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

type ExerciseSession = {
  timestamp: number;
  est1RM: number;
};

/**
 * Finds lifts that stopped progressing: exercises with at least 4 sessions
 * in the last 90 days where none of the most recent 3 sessions beat the
 * earlier best estimated 1RM. Exercises without loaded sets (bodyweight
 * logged at 0 kg) are skipped since est1RM is meaningless there.
 */
export function detectPlateaus(
  workouts: readonly RecommendationWorkout[],
  now: Date = new Date()
): ExercisePlateau[] {
  const windowStart = now.getTime() - WINDOW_DAYS * MS_PER_DAY;
  const sessions = new Map<string, ExerciseSession[]>();
  const names = new Map<string, string>();

  for (const workout of workouts) {
    const timestamp = Date.parse(workout.date);

    if (Number.isNaN(timestamp) || timestamp < windowStart) continue;
    if (timestamp > now.getTime()) continue;

    for (const exercise of workout.exercises ?? []) {
      const exerciseId = exercise.exerciseId ?? exercise.id;

      let best = 0;

      for (const set of exercise.sets) {
        if (!set.completed || set.weight <= 0) continue;

        best = Math.max(best, estimateOneRepMax(set.weight, set.reps));
      }

      if (best <= 0) continue;

      const list = sessions.get(exerciseId) ?? [];

      list.push({ timestamp, est1RM: best });
      sessions.set(exerciseId, list);
      names.set(exerciseId, exercise.name);
    }
  }

  const plateaus: ExercisePlateau[] = [];

  sessions.forEach((list, exerciseId) => {
    if (list.length < MIN_SESSIONS) return;

    const ordered = [...list].sort((a, b) => a.timestamp - b.timestamp);
    const recent = ordered.slice(-RECENT_SESSIONS);
    const earlier = ordered.slice(0, -RECENT_SESSIONS);

    const earlierBest = Math.max(...earlier.map((s) => s.est1RM));
    const recentBest = Math.max(...recent.map((s) => s.est1RM));

    if (recentBest > earlierBest) return;

    const bestIndex = ordered.reduce(
      (best, session, index) =>
        session.est1RM > ordered[best].est1RM ? index : best,
      0
    );

    plateaus.push({
      exerciseId,
      exerciseName: names.get(exerciseId) ?? exerciseId,
      sessionsSinceBest: ordered.length - 1 - bestIndex,
      bestEst1RM: Math.round(ordered[bestIndex].est1RM),
      recentBestEst1RM: Math.round(recentBest),
    });
  });

  return plateaus.sort((a, b) => b.sessionsSinceBest - a.sessionsSinceBest);
}
