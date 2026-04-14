/** Fallback when push payload has no safe College Scheduler URL. */
const DEFAULT_NOTIFICATION_CLICK_URL = "https://tamu.collegescheduler.com/terms";
const COLLEGE_SCHEDULER_ORIGIN = "https://tamu.collegescheduler.com";

/**
 * Only allow navigation to tamu.collegescheduler.com under /terms (seat alerts, test push).
 */
function sanitizeNotificationClickUrl(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    return DEFAULT_NOTIFICATION_CLICK_URL;
  }
  try {
    const u = new URL(raw.trim());
    if (u.origin !== COLLEGE_SCHEDULER_ORIGIN) {
      return DEFAULT_NOTIFICATION_CLICK_URL;
    }
    if (!u.pathname.startsWith("/terms")) {
      return DEFAULT_NOTIFICATION_CLICK_URL;
    }
    return u.href;
  } catch (_) {
    return DEFAULT_NOTIFICATION_CLICK_URL;
  }
}

self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const clickUrl = sanitizeNotificationClickUrl(data.url);
    const options = {
      body: data.body,
      icon: data.icon || "/icon-192x192.png",
      badge: "/icon-192x192.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
        url: clickUrl,
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  event.notification.close();
  const urlToOpen = sanitizeNotificationClickUrl(event.notification.data && event.notification.data.url);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      let targetPath = "";
      try {
        targetPath = new URL(urlToOpen).pathname;
      } catch (_) { }

      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        try {
          const c = new URL(client.url);
          if (
            c.origin === COLLEGE_SCHEDULER_ORIGIN &&
            targetPath &&
            c.pathname === targetPath &&
            "focus" in client
          ) {
            return client.focus();
          }
        } catch (_) {
          /* ignore */
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
