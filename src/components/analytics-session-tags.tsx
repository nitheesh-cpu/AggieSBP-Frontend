"use client";

import { useEffect } from "react";
import Session from "supertokens-auth-react/recipe/session";
import { appPlatform, identify, track } from "@/lib/analytics";

const PLANNER_RECORD_PREFIX = "aggiesbp:planner:record:";
/** Set once this device has opened the site from its home screen. */
const FIRST_LAUNCH_KEY = "aggiesbp:app-first-launch";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function platform() {
  return appPlatform(navigator.userAgent, navigator.platform, navigator.maxTouchPoints);
}

function hasPlan(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PLANNER_RECORD_PREFIX)) continue;
      const courses = JSON.parse(localStorage.getItem(key) ?? "{}")?.courses;
      if (Array.isArray(courses) && courses.length > 0) return true;
    }
  } catch {
    // Storage blocked or malformed: treat as no plan.
  }
  return false;
}

/**
 * Tags the Umami session once per page load with coarse flags (signed in,
 * has a planner record, theme) so reports can be split by them. No user ID
 * is sent. Must render inside the SuperTokens provider.
 */
export function AnalyticsSessionTags() {
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const run = async (attempt: number) => {
      if (cancelled) return;
      // The tracker script is deferred; wait for it (up to ~10s).
      if (!window.umami?.identify) {
        if (attempt < 20) timer = window.setTimeout(() => run(attempt + 1), 500);
        return;
      }
      let signedIn = false;
      try {
        signedIn = await Session.doesSessionExist();
      } catch {
        // SuperTokens not ready: report as signed out.
      }
      if (cancelled) return;
      identify({
        signed_in: signedIn,
        has_plan: hasPlan(),
        theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
        installed: isStandalone(),
      });
    };

    void run(0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    // Chromium (Android, desktop Chrome/Edge) only; iOS never fires this.
    const onInstalled = () => track("app-installed", { platform: platform() });
    window.addEventListener("appinstalled", onInstalled);

    if (isStandalone()) {
      try {
        if (!localStorage.getItem(FIRST_LAUNCH_KEY)) {
          localStorage.setItem(FIRST_LAUNCH_KEY, "1");
          track("app-first-launch", { platform: platform() });
        }
      } catch {
        // Storage blocked: can't tell first launch from later ones, so skip.
      }
    }

    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  return null;
}
