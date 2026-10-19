"use client";

import React from "react";
import Link from "next/link";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { redirectToAuth } from "supertokens-auth-react";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackSection } from "@/lib/api";

/** Same id format the extension uses, so alerts list and dedupe the same way. */
export function seatAlertSectionId(s: {
  termCode: string;
  crn: string;
  dept: string;
  courseNumber: string;
  section?: string | null;
}) {
  return [s.termCode, s.crn, s.dept, s.courseNumber, s.section || "XXX"].join("-");
}

/**
 * "Watch seat" next to a full section. Signed out, it sends the student to
 * sign in and back here; signed in, it adds the section to their seat alerts.
 */
export function WatchSectionButton({
  termCode,
  crn,
  dept,
  courseNumber,
  section,
  className = "",
}: {
  termCode: string;
  crn: string;
  dept: string;
  courseNumber: string;
  section?: string | null;
  className?: string;
}) {
  const session = useSessionContext();
  const [state, setState] = React.useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = React.useState<string | null>(null);

  const signedIn = !session.loading && session.doesSessionExist;
  const label = "Watch seat";

  const watch = async () => {
    if (!signedIn) {
      void redirectToAuth({ redirectBack: true });
      return;
    }
    setState("saving");
    setMessage(null);
    try {
      await trackSection(
        seatAlertSectionId({ termCode, crn, dept, courseNumber, section }),
        termCode,
      );
      setState("done");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Couldn't save the alert.");
    }
  };

  if (state === "done") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
        <BellRing className="h-3.5 w-3.5 text-accent" />
        <span className="text-text-heading dark:text-white">Watching.</span>
        <Link
          href="/profile/alerts"
          className="font-medium text-[#500000] underline underline-offset-2 dark:text-[#FFCF3F]"
        >
          Manage alerts
        </Link>
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={watch}
        disabled={state === "saving"}
        className="h-8 gap-1.5 rounded-full text-xs"
        title={
          signedIn
            ? `Get notified when CRN ${crn} has an open seat`
            : "Sign in to get seat alerts"
        }
      >
        {state === "saving" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Bell className="h-3.5 w-3.5" />
        )}
        {signedIn ? label : `${label} (sign in)`}
      </Button>
      {state === "error" && message && (
        <span className="text-xs text-red-700 dark:text-red-300">{message}</span>
      )}
    </span>
  );
}
