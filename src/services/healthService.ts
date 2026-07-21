import { Capacitor } from "@capacitor/core";
import { Health } from "@capgo/capacitor-health";
import type {
  AuthorizationOptions,
  HealthDataType,
} from "@capgo/capacitor-health";

/**
 * Thin wrapper around @capgo/capacitor-health so the rest of the app never
 * touches the plugin directly. Every call is a safe no-op / zero fallback off
 * native (e.g. desktop Safari during development), so callers don't have to
 * guard for platform themselves.
 *
 * Note: this plugin has no saveWorkout — HealthKit workout *sessions* aren't
 * writable through it — so a finished session is recorded as an active-energy
 * (calories) sample over the workout's time span, plus exercise minutes.
 */

/** What we read from Health: activity + body metrics logged by other apps. */
const READ_TYPES: HealthDataType[] = [
  "steps",
  "distance",
  "calories",
  "weight",
  "heartRate",
  "flightsClimbed",
  "exerciseTime",
];

/** What we write to Health: body-weight logs + workout energy/minutes. */
const WRITE_TYPES: HealthDataType[] = ["weight", "calories", "exerciseTime"];

const AUTH_OPTIONS: AuthorizationOptions = {
  read: READ_TYPES,
  write: WRITE_TYPES,
};

export function isHealthSupported(): boolean {
  return Capacitor.isNativePlatform();
}

/** True only on a device where HealthKit is actually available. */
export async function isHealthAvailable(): Promise<boolean> {
  if (!isHealthSupported()) return false;

  try {
    const { available } = await Health.isAvailable();
    return Boolean(available);
  } catch {
    return false;
  }
}

/**
 * Ask the user for read/write access. Safe to call repeatedly — iOS only
 * shows the sheet the first time and returns current grants afterwards.
 * Returns true if we got write access to anything we asked for.
 */
export async function requestHealthAuthorization(): Promise<boolean> {
  if (!(await isHealthAvailable())) return false;

  try {
    const status = await Health.requestAuthorization(AUTH_OPTIONS);
    return status.writeAuthorized.length > 0;
  } catch {
    return false;
  }
}

/** Current read/write grants, without prompting. */
export async function checkHealthAuthorization(): Promise<boolean> {
  if (!(await isHealthAvailable())) return false;

  try {
    const status = await Health.checkAuthorization(AUTH_OPTIONS);
    return (
      status.writeAuthorized.length > 0 || status.readAuthorized.length > 0
    );
  } catch {
    return false;
  }
}

/** Sum a metric over today (e.g. steps, distance). Returns 0 off-device. */
export async function readTodayTotal(
  dataType: HealthDataType
): Promise<number> {
  if (!(await isHealthAvailable())) return 0;

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  try {
    const { samples } = await Health.queryAggregated({
      dataType,
      startDate: start.toISOString(),
      endDate: new Date().toISOString(),
      bucket: "day",
      aggregation: "sum",
    });

    return (samples ?? []).reduce((sum, s) => sum + (s.value ?? 0), 0);
  } catch {
    return 0;
  }
}

/** The most recent body-weight sample in kg from Health, or null. */
export async function readLatestWeightKg(): Promise<number | null> {
  if (!(await isHealthAvailable())) return null;

  try {
    const { samples } = await Health.readSamples({
      dataType: "weight",
      limit: 1,
      ascending: false,
    });

    const latest = samples?.[0];
    return latest ? latest.value : null;
  } catch {
    return null;
  }
}

/** Write a body-weight log (kg) to Health. No-op off-device. */
export async function writeWeightKg(
  kg: number,
  when: Date = new Date()
): Promise<void> {
  if (!(await isHealthAvailable())) return;

  try {
    await Health.saveSample({
      dataType: "weight",
      value: kg,
      unit: "kilogram",
      startDate: when.toISOString(),
      endDate: when.toISOString(),
    });
  } catch {
    // best-effort — never block the app on a Health write
  }
}

/**
 * Record a finished strength session to Health: exercise minutes over the
 * session span, plus active energy if we have an estimate. (The plugin can't
 * write true workout sessions, so this is the closest faithful mapping.)
 */
export async function writeStrengthWorkout(params: {
  start: Date;
  end: Date;
  calories?: number;
}): Promise<void> {
  if (!(await isHealthAvailable())) return;

  const minutes = Math.max(
    1,
    Math.round((params.end.getTime() - params.start.getTime()) / 60000)
  );

  try {
    await Health.saveSample({
      dataType: "exerciseTime",
      value: minutes,
      unit: "minute",
      startDate: params.start.toISOString(),
      endDate: params.end.toISOString(),
    });

    if (params.calories != null && params.calories > 0) {
      await Health.saveSample({
        dataType: "calories",
        value: params.calories,
        unit: "kilocalorie",
        startDate: params.start.toISOString(),
        endDate: params.end.toISOString(),
      });
    }
  } catch {
    // best-effort
  }
}
