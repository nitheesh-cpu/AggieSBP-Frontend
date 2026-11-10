/**
 * Umami custom events. The tracker script is loaded in the root layout and
 * only reports on the production host; elsewhere (and when an ad blocker
 * stops the script) these calls do nothing.
 */

type EventData = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void };
  }
}

export function track(event: string, data?: EventData): void {
  if (typeof window === "undefined") return;
  try {
    if (data) {
      const clean = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined && v !== null),
      );
      window.umami?.track(event, clean);
    } else {
      window.umami?.track(event);
    }
  } catch {
    // Analytics must never break the page.
  }
}
