"use client";

import { useEffect } from "react";

const RECORDER_SRC = "https://stats.nitheeshk.com/recorder.js";
const WEBSITE_ID = "7efa90af-63b9-4c90-9287-510bd8e41d2e";

/**
 * Umami heatmap recorder. Unlike the main tracker it ignores `data-domains`
 * and the `umami.disabled` opt-out, so it's added from here only on the
 * production host and only for visitors who haven't opted out.
 */
export function UmamiRecorder({ host }: { host: string }) {
  useEffect(() => {
    if (window.location.hostname !== host) return;
    try {
      if (window.localStorage.getItem("umami.disabled")) return;
    } catch {
      // Storage blocked: fall through and record as usual.
    }
    if (document.querySelector(`script[src="${RECORDER_SRC}"]`)) return;
    const script = document.createElement("script");
    script.defer = true;
    script.src = RECORDER_SRC;
    script.setAttribute("data-website-id", WEBSITE_ID);
    document.head.appendChild(script);
  }, [host]);
  return null;
}
