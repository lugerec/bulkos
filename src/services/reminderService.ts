import { Capacitor } from "@capacitor/core";

import { t } from "@/i18n";

/**
 * Streak reminders via local notifications — no server or push certificates
 * needed, the phone schedules them itself. Native-only; every function is a
 * safe no-op on web so calling code never has to branch.
 *
 * The plugin is imported lazily so the web bundle doesn't carry it.
 */

/** Fixed ids so re-scheduling replaces rather than stacks up reminders. */
const STREAK_REMINDER_ID = 1001;
const REST_DONE_ID = 1002;
const TEST_ID = 1003;

export function areRemindersSupported(): boolean {
  return Capacitor.isNativePlatform();
}

async function plugin() {
  const mod = await import("@capacitor/local-notifications");
  return mod.LocalNotifications;
}

/**
 * Every failure here used to be swallowed by a bare `catch {}`, so a broken
 * reminder looked identical whether the chunk failed to load, the plugin
 * wasn't registered, or the user denied permission. Keep the real message.
 */
function describe(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return String(error);
}

export type ReminderPermissionStatus =
  | { status: "granted" }
  | { status: "denied" }
  | { status: "unsupported" }
  | { status: "error"; detail: string };

/** Ask for notification permission. */
export async function requestReminderPermission(): Promise<ReminderPermissionStatus> {
  if (!areRemindersSupported()) return { status: "unsupported" };

  try {
    const LocalNotifications = await plugin();
    const permissions = await LocalNotifications.requestPermissions();

    return permissions.display === "granted"
      ? { status: "granted" }
      : { status: "denied" };
  } catch (error) {
    return { status: "error", detail: describe(error) };
  }
}

/** Whether permission is already granted (without prompting). */
export async function hasReminderPermission(): Promise<boolean> {
  if (!areRemindersSupported()) return false;

  try {
    const LocalNotifications = await plugin();
    const status = await LocalNotifications.checkPermissions();
    return status.display === "granted";
  } catch {
    return false;
  }
}

/**
 * Schedule the daily streak reminder at `hour`:`minute` local time, repeating
 * every day. Re-scheduling with the same id replaces the previous one.
 */
export async function scheduleStreakReminder(
  hour: number,
  minute = 0
): Promise<{ ok: true } | { ok: false; detail: string }> {
  if (!areRemindersSupported()) {
    return { ok: false, detail: "not a native platform" };
  }

  if (!(await hasReminderPermission())) {
    return { ok: false, detail: "permission not granted" };
  }

  try {
    const LocalNotifications = await plugin();

    await LocalNotifications.schedule({
      notifications: [
        {
          id: STREAK_REMINDER_ID,
          title: t("Keep your streak alive"),
          body: t("Log a workout or hit your protein target today."),
          // `on` maps to a repeating calendar trigger — the documented way to
          // get "every day at HH:MM". `{ at, repeats: true }` repeats at the
          // *interval* to `at`, which is not a daily reminder.
          schedule: { on: { hour, minute }, allowWhileIdle: true },
        },
      ],
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, detail: describe(error) };
  }
}

/**
 * Fire a notification a few seconds from now so the reminder pipeline can
 * actually be verified. Without this the daily reminder is untestable: it is
 * scheduled for a fixed hour, so "broken" and "working, arriving tomorrow"
 * look exactly the same.
 */
export async function sendTestNotification(): Promise<
  { ok: true } | { ok: false; detail: string }
> {
  if (!areRemindersSupported()) {
    return { ok: false, detail: "not a native platform" };
  }

  try {
    const LocalNotifications = await plugin();

    await LocalNotifications.schedule({
      notifications: [
        {
          id: TEST_ID,
          title: t("BulkOS reminders work"),
          body: t("This is a test notification."),
          schedule: { at: new Date(Date.now() + 5000) },
        },
      ],
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, detail: describe(error) };
  }
}

/** Cancel the daily streak reminder. */
export async function cancelStreakReminder(): Promise<void> {
  if (!areRemindersSupported()) return;

  try {
    const LocalNotifications = await plugin();
    await LocalNotifications.cancel({
      notifications: [{ id: STREAK_REMINDER_ID }],
    });
  } catch {
    // Nothing scheduled, or the plugin is unavailable — nothing to undo.
  }
}

/**
 * Fire a notification when the rest period ends. The in-app beep and vibration
 * only work while the webview is awake, so a pocketed or locked phone misses
 * the end of rest entirely — this covers that case.
 *
 * Silently does nothing without permission (we never prompt mid-workout).
 */
export async function scheduleRestDone(seconds: number): Promise<void> {
  if (!areRemindersSupported() || seconds <= 0) return;
  if (!(await hasReminderPermission())) return;

  try {
    const LocalNotifications = await plugin();

    await LocalNotifications.schedule({
      notifications: [
        {
          id: REST_DONE_ID,
          title: t("Rest over"),
          body: t("Time for your next set."),
          schedule: {
            at: new Date(Date.now() + seconds * 1000),
            allowWhileIdle: true,
          },
        },
      ],
    });
  } catch {
    // Best-effort — the in-app timer is still the source of truth.
  }
}

/** Cancel a pending rest notification (rest skipped, or finished in-app). */
export async function cancelRestDone(): Promise<void> {
  if (!areRemindersSupported()) return;

  try {
    const LocalNotifications = await plugin();
    await LocalNotifications.cancel({ notifications: [{ id: REST_DONE_ID }] });
  } catch {
    // Nothing pending.
  }
}
