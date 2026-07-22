import { Capacitor, registerPlugin, type PluginListenerHandle } from "@capacitor/core";

import type { WorkoutExercise } from "@/types/workout";

/**
 * Bridge to the paired Apple Watch (native plugin lives in
 * ios/App/App/WatchBridgePlugin.swift). Everything here is a safe no-op off
 * iOS, so callers don't need to guard for platform.
 */

type SetUpdateEvent = {
  exerciseIndex: number;
  setIndex: number;
  completed: boolean;
};

type WatchBridgePlugin = {
  sendWorkout(options: { workout: string }): Promise<{ delivered: boolean }>;
  isPaired(): Promise<{
    supported: boolean;
    paired: boolean;
    appInstalled: boolean;
  }>;
  addListener(
    eventName: "setUpdate",
    listener: (event: SetUpdateEvent) => void
  ): Promise<PluginListenerHandle>;
};

const WatchBridge = registerPlugin<WatchBridgePlugin>("WatchBridge");

function isSupported(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
}

/** Is a watch paired with the BulkOS watch app installed? */
export async function isWatchReady(): Promise<boolean> {
  const status = await getWatchStatus();
  return Boolean(status?.paired && status.appInstalled);
}

export type WatchStatus = {
  supported: boolean;
  paired: boolean;
  appInstalled: boolean;
};

/**
 * Full pairing status, or null when the native plugin isn't present in this
 * build (which is itself a useful diagnostic: the phone app needs a rebuild).
 */
export async function getWatchStatus(): Promise<WatchStatus | null> {
  if (!isSupported()) return null;

  try {
    return await WatchBridge.isPaired();
  } catch {
    // Plugin missing/unregistered in this binary.
    return null;
  }
}

/**
 * Push the active workout to the watch. Shapes the payload to the watch's
 * Codable model (name / exercises / sets), so keep the two in step.
 */
export async function sendWorkoutToWatch(
  name: string,
  exercises: readonly WorkoutExercise[]
): Promise<void> {
  if (!isSupported()) return;

  const payload = {
    name,
    exercises: exercises.map((exercise) => ({
      name: exercise.name,
      targetReps: exercise.targetReps ?? null,
      sets: exercise.sets.map((set) => ({
        reps: set.reps,
        weight: set.weight,
        completed: Boolean(set.completed),
      })),
    })),
  };

  try {
    await WatchBridge.sendWorkout({ workout: JSON.stringify(payload) });
  } catch {
    // best-effort — never block the workout on the watch link
  }
}

/**
 * Listen for sets completed on the watch. Returns a cleanup function; safe to
 * call off-device (returns a no-op).
 */
export async function onWatchSetUpdate(
  handler: (event: SetUpdateEvent) => void
): Promise<() => void> {
  if (!isSupported()) return () => {};

  try {
    const listener = await WatchBridge.addListener("setUpdate", handler);
    return () => listener.remove();
  } catch {
    return () => {};
  }
}
