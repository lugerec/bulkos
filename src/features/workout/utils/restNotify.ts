/**
 * Signals the end of a rest period: a short vibration (on supporting
 * devices) plus a brief beep via the Web Audio API. Both are best-effort —
 * they no-op silently when the browser doesn't support them or blocks audio
 * before a user gesture. Kept out of the component so it's easy to reason
 * about and swap later.
 */
export function notifyRestComplete(): void {
  // Vibration — phones only, ignored elsewhere.
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([120, 60, 120]);
    } catch {
      // ignore — vibration is a nice-to-have
    }
  }

  playBeep();
}

function playBeep(): void {
  if (typeof window === "undefined") return;

  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return;

  try {
    const ctx = new Ctx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.15;

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    oscillator.start(now);
    // Quick fade out so it's a soft blip, not a click.
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    oscillator.stop(now + 0.26);

    oscillator.onended = () => ctx.close();
  } catch {
    // ignore — audio may be blocked until a user gesture
  }
}

/** Clamp a rest adjustment so the timer never goes below zero. */
export function adjustRest(current: number, delta: number): number {
  return Math.max(0, current + delta);
}

/** A tiny tactile tick for small confirmations (set completed, etc.). */
export function hapticTick(): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(10);
    } catch {
      // best-effort
    }
  }
}
