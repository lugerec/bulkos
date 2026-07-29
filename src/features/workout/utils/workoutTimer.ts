/**
 * Wall-clock timing for the active workout. Instead of counting one-second
 * ticks (which stall when the screen unmounts or the app is backgrounded), the
 * session banks elapsed time and anchors the running segment to a real
 * timestamp. Elapsed is always derived from the clock, so it stays correct
 * across navigation and suspend/resume.
 */
export type WorkoutTiming = {
  /** Epoch ms when the current running segment began; null while paused. */
  startedAt: number | null;
  /** Banked ms from previous (already-ended) running segments. */
  accumulatedMs: number;
};

export function elapsedSeconds(
  timing: WorkoutTiming,
  now: number = Date.now()
): number {
  const running =
    timing.startedAt !== null ? Math.max(0, now - timing.startedAt) : 0;

  return Math.floor((timing.accumulatedMs + running) / 1000);
}

/** Bank the current segment and stop the clock. */
export function pauseTiming(
  timing: WorkoutTiming,
  now: number = Date.now()
): WorkoutTiming {
  if (timing.startedAt === null) return timing;

  return {
    startedAt: null,
    accumulatedMs: timing.accumulatedMs + Math.max(0, now - timing.startedAt),
  };
}

/** Start a fresh running segment from now. */
export function resumeTiming(
  timing: WorkoutTiming,
  now: number = Date.now()
): WorkoutTiming {
  if (timing.startedAt !== null) return timing;

  return { startedAt: now, accumulatedMs: timing.accumulatedMs };
}
