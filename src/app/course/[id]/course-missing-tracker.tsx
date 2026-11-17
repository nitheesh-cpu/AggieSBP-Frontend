"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { track } from "@/lib/analytics";

/** Reports a course URL the API doesn't know (a 404), once per page view. */
export function CourseMissingTracker() {
  const params = useParams<{ id?: string }>();
  const raw = typeof params?.id === "string" ? params.id : "";
  const reported = useRef<string | null>(null);

  useEffect(() => {
    let code = raw;
    try {
      code = decodeURIComponent(raw);
    } catch {
      // keep the raw value
    }
    code = code.replace(/\s+/g, "").toUpperCase().slice(0, 40);
    if (!code || reported.current === code) return;
    reported.current = code;
    track("course-missing", { code });
  }, [raw]);

  return null;
}
