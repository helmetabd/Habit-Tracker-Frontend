/**
 * Reminders are checked once a minute while the app is open, and fire a
 * browser Notification when a habit's reminder time matches "now" and it
 * isn't completed yet. Browsers don't allow web apps to wake up and notify
 * while fully closed without a push server, so this is a lightweight,
 * no-backend approximation — good enough for an app kept open in a tab
 * or installed as a PWA that's still running.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'default') return Notification.permission
  return Notification.permission
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function notify(title: string, body: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification(title, { body, icon: '/pwa-192.png' })
}
