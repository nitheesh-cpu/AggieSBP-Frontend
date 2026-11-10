"use client";

import { useEffect } from "react";
import Session from "supertokens-auth-react/recipe/session";
import { identify } from "@/lib/analytics";

const PLANNER_RECORD_PREFIX = "aggiesbp:planner:record:";

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
      });
    };

    void run(0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
