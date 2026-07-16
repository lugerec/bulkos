import { toDateKey } from "@/lib/date";
export type WeeklyReport = {
  /** Monday of the last completed week, YYYY-MM-DD */
  weekStart: string;
  /** Sunday of the last completed week, YYYY-MM-DD */
  weekEnd: string;
  /** distinct training days that week */
  trainingDays: number;
  targetTrainingDays: number;
  volumeKg: number;
  /** volume difference vs the week before (kg) */
  volumeDeltaKg: number;
  /** first-to-last weight change inside that week; null without 2+ entries */
  weightChangeKg: number | null;
};

type ReportWorkout = {
  date: string;
  volumeKg: number;
};

type ReportWeightEntry = {
  date: string;
  weightKg: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getWeekStart(date: Date): Date {
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);

  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  return monday;
}

function inRange(date: string, startKey: string, endKeyExclusive: string) {
  return date >= startKey && date < endKeyExclusive;
}

/**
 * Digest of the last completed calendar week (Mon–Sun): distinct training
 * days vs the frequency target, total volume with a delta vs the week
 * before, and the weight change across that week's check-ins.
 */
export function getWeeklyReport(
  workouts: readonly ReportWorkout[],
  weightEntries: readonly ReportWeightEntry[],
  targetTrainingDays: number,
  now: Date = new Date()
): WeeklyReport {
  const currentWeekStart = getWeekStart(now);
  const reportStart = new Date(currentWeekStart.getTime() - 7 * MS_PER_DAY);
  const priorStart = new Date(currentWeekStart.getTime() - 14 * MS_PER_DAY);

  const reportStartKey = toDateKey(reportStart);
  const reportEndKey = toDateKey(currentWeekStart);
  const priorStartKey = toDateKey(priorStart);

  const reportWorkouts = workouts.filter((workout) =>
    inRange(workout.date, reportStartKey, reportEndKey)
  );
  const priorWorkouts = workouts.filter((workout) =>
    inRange(workout.date, priorStartKey, reportStartKey)
  );

  const volumeKg = reportWorkouts.reduce(
    (sum, workout) => sum + workout.volumeKg,
    0
  );
  const priorVolumeKg = priorWorkouts.reduce(
    (sum, workout) => sum + workout.volumeKg,
    0
  );

  const trainingDays = new Set(reportWorkouts.map((workout) => workout.date))
    .size;

  const weekEntries = weightEntries
    .filter((entry) => inRange(entry.date, reportStartKey, reportEndKey))
    .sort((a, b) => a.date.localeCompare(b.date));

  const weightChangeKg =
    weekEntries.length >= 2
      ? Math.round(
          (weekEntries[weekEntries.length - 1].weightKg -
            weekEntries[0].weightKg) *
            10
        ) / 10
      : null;

  return {
    weekStart: reportStartKey,
    weekEnd: toDateKey(new Date(currentWeekStart.getTime() - MS_PER_DAY)),
    trainingDays,
    targetTrainingDays,
    volumeKg: Math.round(volumeKg),
    volumeDeltaKg: Math.round(volumeKg - priorVolumeKg),
    weightChangeKg,
  };
}
