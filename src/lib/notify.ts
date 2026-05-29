/* ============================================================
   Browser notification plumbing.

   This shows a notification while the app is open (or the service
   worker is alive). Reliable scheduled delivery when the app is
   fully closed needs Web Push (a push server + VAPID keys) — see
   the note on the Reminders screen. We degrade gracefully: if
   notifications aren't permitted, the in-app banner still nudges.
   ============================================================ */

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationPermission(): NotificationPermission {
  return notificationsSupported() ? Notification.permission : 'denied';
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export async function showNotification(title: string, body: string): Promise<void> {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  const options: NotificationOptions = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'saath-reminder',
    lang: 'en',
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    if (reg?.showNotification) {
      await reg.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  } catch {
    /* ignore — the in-app banner is the fallback */
  }
}
