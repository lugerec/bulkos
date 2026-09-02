import { getWeekStart } from "@/features/rewards/weeklySummary";
import { toDateKey } from "@/lib/date";

/** Minimal shape needed from a logged workout for trend analysis. */
export type TrendWorkout = {
  date: string;
  volumeKg: number;
  exercises?: {
    exerciseId?: string;
    id: string;
    name: string;
    sets: { weight: number; reps: number; completed: boolean }[];
  }[];
};

export type WeeklyVolumePoint = {
  /** Monday of the week, YYYY-MM-DD. */
  weekStart: string;
  volumeKg: number;
  sessions: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Total training volume bucketed by week, oldest first, for the last `weeks`
 * weeks including the current one. Weeks with no sessions still appear with
 * zero volume, so a chart doesn't silently skip a quiet week.
 */
export function getWeeklyVolumeTrend(
  workouts: readonly TrendWorkout[],
  weeks = 12,
  now: Date = new Date()
): WeeklyVolumePoint[] {
  const thisMonday = getWeekStart(now);

  const buckets: WeeklyVolumePoint[] = Array.from({ length: weeks }, (_, i) => {
    const monday = new Date(
      thisMonday.getTime() - (weeks - 1 - i) * 7 * MS_PER_DAY
    );
    return { weekStart: toDateKey(monday), volumeKg: 0, sessions: 0 };
  });

  const indexByWeekStart = new Map(buckets.map((b, i) => [b.weekStart, i]));

  for (const workout of workouts) {
    const monday = toDateKey(getWeekStart(new Date(workout.date)));
    const idx = indexByWeekStart.get(monday);
    if (idx === undefined) continue;

    buckets[idx].volumeKg += workout.volumeKg || 0;
    buckets[idx].sessions += 1;
  }

  for (const b of buckets) {
    b.volumeKg = Math.round(b.volumeKg);
  }

  return buckets;
}

/**
 * Epley formula: est. 1RM = weight × (1 + reps / 30).
 * Reliable up to roughly 10 reps; beyond that the estimate drifts, so callers
 * should treat high-rep sets as a rough indication rather than a true max.
 */
export function estimateOneRepMax(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export type OneRepMaxPoint = {
  date: string;
  estimatedOneRepMax: number;
  weight: number;
  reps: number;
};

/**
 * Best estimated 1RM per session for a given exercise, oldest first — the
 * heaviest-implied set of each session that included it. Matches by
 * exerciseId when present, falling back to name for older logs that predate
 * the id field.
 */
export function getStrengthTrend(
  workouts: readonly TrendWorkout[],
  exerciseKey: { id?: string; name: string }
): OneRepMaxPoint[] {
  const points: OneRepMaxPoint[] = [];

  const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));

  for (const workout of sorted) {
    const match = workout.exercises?.find((ex) =>
      exerciseKey.id
        ? ex.exerciseId === exerciseKey.id || ex.id === exerciseKey.id
        : ex.name === exerciseKey.name
    );
    if (!match) continue;

    let best: OneRepMaxPoint | null = null;
    for (const set of match.sets) {
      if (!set.completed || set.weight <= 0 || set.reps <= 0) continue;

      const estimate = estimateOneRepMax(set.weight, set.reps);
      if (!best || estimate > best.estimatedOneRepMax) {
        best = {
          date: workout.date,
          estimatedOneRepMax: estimate,
          weight: set.weight,
          reps: set.reps,
        };
      }
    }

    if (best) points.push(best);
  }

  return points;
}

export type MuscleVolumePoint = {
  muscleGroup: string;
  setsThisWeek: number;
  setsLastWeek: number;
};

/**
 * Completed sets per muscle group for this week vs last, from an exercise ->
 * muscle-group lookup the caller supplies. Kept dependency-free (no import of
 * the exercise data set) so it stays easy to test; callers typically build
 * `muscleGroupByExercise` once from exerciseDefinitions.
 */
export function getMuscleVolumeTrend(
  workouts: readonly TrendWorkout[],
  muscleGroupByExercise: ReadonlyMap<string, string>,
  now: Date = new Date()
): MuscleVolumePoint[] {
  const thisMonday = toDateKey(getWeekStart(now));
  const lastMonday = toDateKey(
    new Date(getWeekStart(now).getTime() - 7 * MS_PER_DAY)
  );
  const thisWeekEnd = toDateKey(
    new Date(getWeekStart(now).getTime() + 6 * MS_PER_DAY)
  );

  const setsThisWeek = new Map<string, number>();
  const setsLastWeek = new Map<string, number>();

  for (const workout of workouts) {
    const isThisWeek = workout.date >= thisMonday && workout.date <= thisWeekEnd;
    const isLastWeek = workout.date >= lastMonday && workout.date < thisMonday;
    if (!isThisWeek && !isLastWeek) continue;

    const target = isThisWeek ? setsThisWeek : setsLastWeek;

    for (const ex of workout.exercises ?? []) {
      const muscleGroup =
        muscleGroupByExercise.get(ex.exerciseId ?? ex.id) ?? "Other";
      const completed = ex.sets.filter((s) => s.completed).length;
      target.set(muscleGroup, (target.get(muscleGroup) ?? 0) + completed);
    }
  }

  const groups = new Set([...setsThisWeek.keys(), ...setsLastWeek.keys()]);

  return Array.from(groups)
    .map((muscleGroup) => ({
      muscleGroup,
      setsThisWeek: setsThisWeek.get(muscleGroup) ?? 0,
      setsLastWeek: setsLastWeek.get(muscleGroup) ?? 0,
    }))
    .sort((a, b) => b.setsThisWeek - a.setsThisWeek);
}
