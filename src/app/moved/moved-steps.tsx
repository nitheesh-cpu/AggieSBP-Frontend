"use client";

import * as React from "react";
import Link from "@/components/app-link";
import { ArrowUpRight, Share2 } from "lucide-react";
import { appPlatform, track, type AppPlatform } from "@/lib/analytics";

const NEW_APP_URL = "https://aggiesbp.com/alerts";

const BROWSER: Record<AppPlatform, string> = {
  ios: "Safari",
  android: "Chrome",
  desktop: "your browser",
};

function steps(platform: AppPlatform): React.ReactNode[] {
  if (platform === "ios") {
    return [
      <>Open aggiesbp.com in Safari with the button below.</>,
      <>
        Tap <Share2 strokeWidth={1.5} className="mx-0.5 inline h-4 w-4 align-[-2px]" aria-label="" />{" "}
        Share, then Add to Home Screen.
      </>,
      <>Open the new icon, sign in, and turn on notifications on the Seat alerts page.</>,
      <>Delete the old icon: press and hold it, then Remove App. Otherwise each alert arrives twice.</>,
    ];
  }
  if (platform === "android") {
    return [
      <>Open aggiesbp.com in Chrome with the button below.</>,
      <>Tap the menu (three dots), then Add to Home screen or Install app.</>,
      <>Open the new icon, sign in, and turn on notifications on the Seat alerts page.</>,
      <>Remove the old icon: press and hold it, then Uninstall or Remove. Otherwise each alert arrives twice.</>,
    ];
  }
  return [
    <>Open aggiesbp.com in your browser with the button below.</>,
    <>Click the install icon at the right end of the address bar, then Install.</>,
    <>Open the new app, sign in, and turn on notifications on the Seat alerts page.</>,
    <>Uninstall the old app from its window menu. Otherwise each alert arrives twice.</>,
  ];
}

export function MovedSteps() {
  // Server render and first paint use the desktop steps; the platform is
  // only known in the browser.
  const [platform, setPlatform] = React.useState<AppPlatform>("desktop");

  React.useEffect(() => {
    const detected = appPlatform(navigator.userAgent, navigator.platform, navigator.maxTouchPoints);
    setPlatform(detected);
    // Only the old Home Screen app is redirected here, so this counts how
    // many people still open it.
    if (new URLSearchParams(window.location.search).get("source") === "pwa") {
      track("old-app-open", { platform: detected });
    }
  }, []);

  return (
    <>
      <ol className="mt-8 space-y-4">
        {steps(platform).map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border font-mono text-xs text-text-body">
              {i + 1}
            </span>
            <p className="text-sm leading-6 text-text-body">{step}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {/* A new tab leaves the old app's window and opens the real browser,
            where Add to Home Screen is available. */}
        <a
          href={NEW_APP_URL}
          target="_blank"
          rel="noopener"
          onClick={() => track("old-app-reinstall-click", { platform })}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Open in {BROWSER[platform]}
          <ArrowUpRight strokeWidth={1.5} className="h-4 w-4" aria-hidden />
        </a>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-raised"
        >
          Continue for now
        </Link>
      </div>
    </>
  );
}
