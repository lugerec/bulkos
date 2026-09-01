import { Capacitor } from "@capacitor/core";

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

export function areRemindersSupported(): boolean {
  return Capacitor.isNativePlatform();
}

async function plugin() {
  const mod = await import("@capacitor/local-notifications");
  return mod.LocalNotifications;
}

/** Ask for notification permission. Returns true when granted. */
export async function requestReminderPermission(): Promise<boolean> {
  if (!areRemindersSupported()) return false;

  try {
    const LocalNotifications = await plugin();
    const status = await LocalNotifications.requestPermissions();
    return status.display === "granted";
  } catch {
    return false;
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
): Promise<boolean> {
  if (!areRemindersSupported()) return false;
  if (!(await hasReminderPermission())) return false;

  try {
    const LocalNotifications = await plugin();

    // Next occurrence of hour:minute; if it's already past today, start
    // tomorrow so the first fire isn't immediate.
    const at = new Date();
    at.setSeconds(0, 0);
    at.setHours(hour, minute);
    if (at.getTime() <= Date.now()) {
      at.setDate(at.getDate() + 1);
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: STREAK_REMINDER_ID,
          title: "Keep your streak alive",
          body: "Log a workout or hit your protein target today.",
          schedule: { at, repeats: true, allowWhileIdle: true },
        },
      ],
    });

    return true;
  } catch {
    return false;
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
          title: "Rest over",
          body: "Time for your next set.",
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
