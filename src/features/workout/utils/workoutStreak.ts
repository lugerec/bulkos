export type WorkoutStreak = {
  /** consecutive fully-hit weeks up to and including the current one */
  currentStreak: number;
  /** longest run of consecutive hit weeks in the available history */
  longestStreak: number;
  /**
   * true when the current (in-progress) week hasn't hit target yet but the
   * streak is still alive from prior weeks — used to warn "don't break it".
   */
  currentWeekAtRisk: boolean;
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

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Distinct training days in the 7-day window starting at `weekStart`. */
function trainingDaysInWeek(
  trainedDays: ReadonlySet<string>,
  weekStart: Date
): number {
  const startKey = toDateKey(weekStart);
  const endKey = toDateKey(new Date(weekStart.getTime() + 7 * MS_PER_DAY));

  let count = 0;

  for (const day of trainedDays) {
    if (day >= startKey && day < endKey) count += 1;
  }

  return count;
}

/**
 * Weekly training streak: how many consecutive weeks the frequency target
 * was met. The current (in-progress) week doesn't break the streak until
 * it's over — if it hasn't hit target yet, the streak carries from last
 * week and is flagged `currentWeekAtRisk`. Looks back up to 52 weeks.
 */
export function getWorkoutStreak(
  workoutDates: readonly string[],
  targetPerWeek: number,
  now: Date = new Date()
): WorkoutStreak {
  const trainedDays = new Set(workoutDates);
  const thisWeekStart = getWeekStart(now);

  const hits: boolean[] = [];

  for (let weeksBack = 0; weeksBack < 52; weeksBack++) {
    const weekStart = new Date(
      thisWeekStart.getTime() - weeksBack * 7 * MS_PER_DAY
    );

    hits.push(trainingDaysInWeek(trainedDays, weekStart) >= targetPerWeek);
  }

  // hits[0] = current week, hits[1] = last week, ...
  const currentWeekHit = hits[0];

  let currentStreak = 0;

  // Count back from the current week while weeks are hit. If the current
  // week isn't hit yet, start counting from last week (streak still alive).
  const startIndex = currentWeekHit ? 0 : 1;

  for (let i = startIndex; i < hits.length; i++) {
    if (hits[i]) currentStreak += 1;
    else break;
  }

  let longestStreak = 0;
  let run = 0;

  for (const hit of hits) {
    if (hit) {
      run += 1;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 0;
    }
  }

  return {
    currentStreak,
    longestStreak,
    currentWeekAtRisk: !currentWeekHit && currentStreak > 0,
  };
}
