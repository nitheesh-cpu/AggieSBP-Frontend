"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Chrome,
  MousePointerClick,
  Search,
  Share2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";

const CHROME_EXTENSION_URL =
  "https://chromewebstore.google.com/detail/aggie-schedule-builder-pl/glckdcnecomhlmlegmjdceblibmaljpm";

const steps = [
  {
    number: "1",
    icon: Search,
    title: "Find the section you need",
    description:
      "Browse your registration results and identify the closed section, professor, and time that fit your schedule",
  },
  {
    number: "2",
    icon: MousePointerClick,
    title: "Add a seat alert",
    description:
      "Use the AggieSB+ extension to scan visible sections or enter the subject, course, section and CRN yourself",
  },
  {
    number: "3",
    icon: BellRing,
    title: "We watch it for you",
    description:
      "Enable notifications once. AggieSB+ monitors your watched sections and alerts you when a seat opens",
  },
];

export default function SeatAlertsPage() {
  const router = useRouter();
  const [isIos, setIsIos] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [showInstallGuide, setShowInstallGuide] = React.useState(false);

  React.useEffect(() => {
    const ios =
      /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsIos(ios);
    setIsStandalone(standalone);

    const launchedFromIcon =
      new URLSearchParams(window.location.search).get("source") === "pwa";
    if (standalone && launchedFromIcon) {
      const hasCompletedSetup =
        window.localStorage.getItem("aggiesbp:alerts-pwa-configured") === "1";
      if (hasCompletedSetup) {
        router.replace("/dashboard");
      } else {
        router.replace("/profile/alerts");
      }
    }
  }, [router]);

  const beginSetup = () => {
    if (isIos && !isStandalone) {
      window.localStorage.setItem("aggiesbp:alerts-onboarding", "pending");
      setShowInstallGuide(true);
      window.requestAnimationFrame(() => {
        document
          .getElementById("iphone-install-guide")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    router.push("/profile/alerts");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-canvas">
      <Navigation variant="glass" />

      <main>
        <section className="px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="max-w-2xl text-[36px] font-medium leading-[1.06] tracking-[-0.02em] text-text-heading sm:text-[48px] lg:text-[56px] lg:tracking-[-0.03em]">
                Stop refreshing registration. We&apos;ll watch the section
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-7 text-text-body">
                Pick the exact section you want and AggieSB+ notifies you when a
                seat opens. See how it works before you sign in.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={beginSetup} size="lg" className="w-full sm:w-auto">
                  {isIos && !isStandalone ? "Install on iPhone" : "Set up seat alerts"}
                  <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
                </Button>
                {!isIos && (
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <a href={CHROME_EXTENSION_URL} target="_blank" rel="noreferrer">
                      <Chrome strokeWidth={1.5} className="h-4 w-4" />
                      Get the extension
                    </a>
                  </Button>
                )}
              </div>

              <p className="mt-5 flex items-center gap-2 text-sm text-text-muted">
                <ShieldCheck strokeWidth={1.5} className="h-4 w-4" />
                Sign in only when you&apos;re ready to save an alert
              </p>
            </motion.div>

            {/* Product preview: the alert list as it looks in the app */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="rounded-2xl border border-border-strong bg-card p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <BellRing strokeWidth={1.5} className="h-[18px] w-[18px] text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-text-heading">Seat alerts</p>
                      <p className="text-xs text-text-muted">3 sections watched</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-2 font-mono text-xs text-text-muted">
                    <span className="h-2 w-2 rounded-full bg-positive" />
                    Checking
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="rounded-xl border border-positive/30 bg-positive/10 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 strokeWidth={1.5} className="mt-0.5 h-[18px] w-[18px] shrink-0 text-positive" />
                      <div>
                        <p className="text-sm font-medium text-text-heading">A seat just opened</p>
                        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-body">
                          <span className="code-tag">STAT 211</span>
                          Section 503 · CRN 48213
                        </p>
                        <p className="mt-3 text-sm text-text-heading">
                          Open registration to enroll
                        </p>
                      </div>
                    </div>
                  </div>

                  {[
                    { code: "CSCE 313", section: "Section 502" },
                    { code: "MATH 251", section: "Section 201" },
                  ].map((row) => (
                    <div
                      key={row.code}
                      className="flex items-center justify-between rounded-xl border border-border bg-canvas px-4 py-3"
                    >
                      <div className="flex items-center gap-2 text-sm text-text-body">
                        <span className="code-tag">{row.code}</span>
                        {row.section}
                      </div>
                      <span className="text-xs text-text-muted">Watching</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {isIos && !isStandalone && showInstallGuide && (
            <motion.div
              id="iphone-install-guide"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border-strong bg-card p-6 sm:p-8"
            >
              <div className="flex items-start gap-3">
                <Smartphone strokeWidth={1.5} className="mt-1 h-[18px] w-[18px] shrink-0 text-text-muted" />
                <div>
                  <h2 className="text-lg font-medium text-text-heading">
                    Add AggieSB+ to your Home Screen
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-text-body">
                    Apple requires you to do this from the browser menu. Once
                    installed, open AggieSB+ from its new icon and we&apos;ll take
                    you through sign-in and notification setup.
                  </p>
                </div>
              </div>
              <ol className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  <>Tap <Share2 strokeWidth={1.5} className="mx-1 inline h-4 w-4 text-text-muted" /> Share in Safari</>,
                  <>Scroll down and choose Add to Home Screen</>,
                  <>Tap Add, then open the AggieSB+ icon</>,
                ].map((content, i) => (
                  <li key={i} className="rounded-xl border border-border bg-canvas p-4 text-sm text-text-body">
                    <span className="mb-3 block font-mono text-xs text-text-muted">{i + 1}</span>
                    {content}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-text-muted">
                Keep &ldquo;Open as Web App&rdquo; on if your iPhone shows that option
              </p>
            </motion.div>
          )}
        </section>

        <section className="border-y border-border bg-card px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-2xl text-[28px] font-medium leading-9 text-text-heading sm:text-[32px] sm:leading-10">
              From closed section to open seat in three steps
            </h2>

            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.number} className="rounded-xl border border-border bg-canvas p-6">
                    <div className="flex items-center justify-between">
                      <Icon strokeWidth={1.5} className="h-[18px] w-[18px] text-text-muted" />
                      <span className="font-mono text-xs text-text-muted">{step.number}</span>
                    </div>
                    <h3 className="mt-6 text-base font-medium text-text-heading">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-text-body">{step.description}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-medium text-text-heading">Ready to stop refreshing</h2>
              <p className="mt-2 max-w-xl text-base leading-6 text-text-body">
                Sign in, turn on notifications on this device and manage every
                section you&apos;re watching from one place
              </p>
            </div>
            <Button onClick={beginSetup} size="lg">
              Continue to alert setup
              <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
