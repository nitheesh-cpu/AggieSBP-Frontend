"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/** The flag both Umami scripts check before sending anything. */
const OPT_OUT_KEY = "umami.disabled";

export function AnalyticsOptOut() {
  const [optedOut, setOptedOut] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setOptedOut(localStorage.getItem(OPT_OUT_KEY) !== null);
    } catch {
      setOptedOut(null);
    }
  }, []);

  if (optedOut === null) return null;

  const toggle = () => {
    try {
      if (optedOut) localStorage.removeItem(OPT_OUT_KEY);
      else localStorage.setItem(OPT_OUT_KEY, "1");
      setOptedOut(!optedOut);
    } catch {
      // Storage blocked: nothing we can save.
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" size="sm" onClick={toggle}>
        {optedOut ? "Turn analytics back on" : "Turn off analytics in this browser"}
      </Button>
      <span className="text-sm text-text-muted" aria-live="polite">
        {optedOut
          ? "Analytics is off in this browser."
          : "Analytics is on in this browser."}
      </span>
    </div>
  );
}
