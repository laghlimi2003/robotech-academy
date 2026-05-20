import { useEffect } from "react";
import type { T } from "./useLang";

const LAST_REMINDER_KEY = "robotech_last_reminder_v1";
const LAST_VISIT_KEY    = "robotech_last_visit_v1";
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Lightweight daily-reminder strategy that doesn't require a service-worker push:
 * - Tracks the user's last visit timestamp.
 * - On load, if it's been >= 24h since the last visit AND >= 20h since the last reminder,
 *   shows a local notification (only after the user has granted permission).
 */
export function useReminder(t: T, userName?: string) {
  useEffect(() => {
    const now = Date.now();
    const lastVisit    = Number(localStorage.getItem(LAST_VISIT_KEY)    || 0);
    const lastReminder = Number(localStorage.getItem(LAST_REMINDER_KEY) || 0);
    localStorage.setItem(LAST_VISIT_KEY, String(now));

    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    const sinceVisit    = now - lastVisit;
    const sinceReminder = now - lastReminder;
    if (lastVisit && sinceVisit >= DAY_MS && sinceReminder >= 20 * 60 * 60 * 1000) {
      try {
        const title = t.reminderTitle;
        const body  = userName ? t.reminderBodyNamed.replace("{name}", userName) : t.reminderBody;
        new Notification(title, { body, icon: "pwa-192.png", badge: "pwa-192.png", tag: "robotech-daily" });
        localStorage.setItem(LAST_REMINDER_KEY, String(now));
      } catch (e) {
        console.warn("Notification failed:", e);
      }
    }
  }, [t, userName]);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined") return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  try { return await Notification.requestPermission(); }
  catch { return "denied"; }
}
