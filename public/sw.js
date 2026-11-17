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

/*
 * Seat-alert analytics: notification-shown / notification-click /
 * notification-dismiss, sent straight to Umami because the page tracker
 * (n.js) doesn't run in a service worker. The request mirrors n.js: same
 * collect endpoint (/api/n, which the Umami server rewrites to /api/send),
 * headers and cache token. Umami answers CORS with `*`, so this works from
 * the site's origin. Only the production host reports, only seat alerts
 * (payloads carrying `course`) are counted, and tracking never delays or
 * blocks showing or opening anything.
 */
const UMAMI_ENDPOINT = "https://stats.nitheeshk.com/api/n";
const UMAMI_WEBSITE_ID = "7efa90af-63b9-4c90-9287-510bd8e41d2e";
const PRODUCTION_HOSTNAME = "aggieschedulebuilderplus.vercel.app";
const NOTIFICATION_EVENT_URL = "/sw/notification";
const TRACK_TIMEOUT_MS = 3000;

let umamiCache; // Umami session token from the last response, like n.js keeps
let umamiDisabled = false;

function shortString(value, max) {
  return typeof value === "string" && value ? value.slice(0, max) : undefined;
}

/** { course, term } from a push payload or notification.data; null if not a seat alert. */
function notificationEventData(source) {
  const course = source && shortString(source.course, 40);
  if (!course) return null;
  const term = shortString(source.term == null ? "" : String(source.term), 20);
  return term ? { course, term } : { course };
}

function trackNotificationEvent(name, data) {
  try {
    if (self.location.hostname !== PRODUCTION_HOSTNAME || umamiDisabled || !data) {
      return Promise.resolve();
    }
    const headers = {
      "Content-Type": "application/json",
      "x-umami-website-id": UMAMI_WEBSITE_ID,
      "x-umami-hostname": PRODUCTION_HOSTNAME,
    };
    if (umamiCache) headers["x-umami-cache"] = umamiCache;
    const payload = {
      website: UMAMI_WEBSITE_ID,
      hostname: PRODUCTION_HOSTNAME,
      url: NOTIFICATION_EVENT_URL,
      name,
      data,
    };
    const language = self.navigator && self.navigator.language;
    if (language) payload.language = language;

    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), TRACK_TIMEOUT_MS) : null;
    return fetch(UMAMI_ENDPOINT, {
      method: "POST",
      keepalive: true,
      credentials: "omit",
      headers,
      body: JSON.stringify({ type: "event", payload }),
      signal: controller ? controller.signal : undefined,
    })
      .then((res) => res.json())
      .then((json) => {
        if (json) {
          umamiDisabled = !!json.disabled;
          if (json.cache) umamiCache = json.cache;
        }
      })
      .catch(() => {})
      .finally(() => {
        if (timer) clearTimeout(timer);
      });
  } catch (_) {
    return Promise.resolve();
  }
}

self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const clickUrl = sanitizeNotificationClickUrl(data.url);
    const eventData = notificationEventData(data);
    const options = {
      body: data.body,
      icon: data.icon || "/icon-192x192.png",
      badge: "/icon-192x192.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
        url: clickUrl,
        analytics: eventData,
      },
    };
    const shown = self.registration.showNotification(data.title, options);
    event.waitUntil(
      Promise.all([
        shown,
        shown.then(
          () => trackNotificationEvent("notification-shown", eventData),
          () => {}
        ),
      ])
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  event.notification.close();
  const notificationData = event.notification.data;
  const urlToOpen = sanitizeNotificationClickUrl(notificationData && notificationData.url);

  const opening = clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
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
  });
  // Runs alongside opening; the tab never waits on it.
  const tracking = trackNotificationEvent(
    "notification-click",
    notificationData && notificationData.analytics
  );

  event.waitUntil(Promise.all([opening, tracking]));
});

self.addEventListener("notificationclose", function (event) {
  const notificationData = event.notification.data;
  event.waitUntil(
    trackNotificationEvent("notification-dismiss", notificationData && notificationData.analytics)
  );
});
