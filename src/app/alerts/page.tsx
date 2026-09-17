"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Chrome,
  ExternalLink,
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
    number: "01",
    icon: Search,
    title: "Find the section you need",
    description:
      "Browse your registration results and identify the closed section, professor, and time that fit your schedule.",
  },
  {
    number: "02",
    icon: MousePointerClick,
    title: "Add a seat alert",
    description:
      "Use the AggieSB+ extension to scan visible sections or enter the subject, course, section, and CRN manually.",
  },
  {
    number: "03",
    icon: BellRing,
    title: "We watch it for you",
    description:
      "Enable notifications once. AggieSB+ monitors your watched sections and alerts you when a seat becomes available.",
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
    <div
      className="min-h-screen overflow-hidden"
      style={{ background: "var(--app-bg-gradient)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: "var(--app-bg-ambient)" }}
      />
      <Navigation variant="glass" />

      <main className="relative z-10">
        <section className="px-6 pb-20 pt-28 sm:pt-32">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#500000]/15 bg-white/65 px-3 py-1.5 text-xs font-semibold text-[#500000] backdrop-blur dark:border-[#FFCF3F]/25 dark:bg-black/45 dark:text-[#FFCF3F]">
                <BellRing className="h-3.5 w-3.5" />
                Never miss an open seat
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-heading dark:text-white sm:text-5xl lg:text-6xl">
                Stop refreshing registration.
                <span className="block text-[#500000] dark:text-[#FFCF3F]">
                  We&apos;ll watch the section.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-body dark:text-white/65 sm:text-lg">
                Pick the exact class section you want and AggieSB+ will notify
                you when a seat opens. See how it works before you sign in.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={beginSetup}
                  className="h-12 w-full rounded-full bg-[#FFCF3F] px-7 font-semibold text-[#0f0f0f] hover:bg-[#FFD966] sm:w-auto"
                >
                    {isIos && !isStandalone
                      ? "Install on iPhone"
                      : "Set up seat alerts"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                {!isIos && (
                  <a
                    href={CHROME_EXTENSION_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="h-12 w-full rounded-full border-[#500000]/25 bg-white/50 px-6 text-heading hover:bg-white/80 dark:border-white/20 dark:bg-black/30 dark:text-white dark:hover:bg-white/10 sm:w-auto"
                    >
                      <Chrome className="mr-2 h-4 w-4" />
                      Get the extension
                      <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-60" />
                    </Button>
                  </a>
                )}
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-body dark:text-white/50">
                <ShieldCheck className="h-4 w-4" />
                Sign in only when you&apos;re ready to save an alert.
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="absolute -inset-10 rounded-full bg-[#FFCF3F]/15 blur-3xl" />
              <div className="relative rounded-[2rem] border border-[#500000]/15 bg-white/75 p-5 shadow-2xl backdrop-blur-xl dark:border-[#FFCF3F]/20 dark:bg-black/65">
                <div className="mb-5 flex items-center justify-between border-b border-[#500000]/10 pb-4 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#500000] text-white dark:bg-[#FFCF3F] dark:text-black">
                      <BellRing className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-heading dark:text-white">
                        Seat Alerts
                      </p>
                      <p className="text-xs text-body dark:text-white/50">
                        2 sections watched
                      </p>
                    </div>
                  </div>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50 p-4 dark:bg-emerald-500/10">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                          A seat just opened
                        </p>
                        <p className="mt-1 text-sm text-emerald-800/75 dark:text-emerald-100/65">
                          STAT 414 · Section 501 · CRN 12345
                        </p>
                        <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          Open registration to enroll →
                        </p>
                      </div>
                    </div>
                  </div>

                  {["CSCE 313 · Section 502", "MATH 251 · Section 201"].map(
                    (section) => (
                      <div
                        key={section}
                        className="flex items-center justify-between rounded-2xl border border-[#500000]/10 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/5"
                      >
                        <div>
                          <p className="text-sm font-medium text-heading dark:text-white">
                            {section}
                          </p>
                          <p className="mt-0.5 text-xs text-body dark:text-white/45">
                            Watching for an opening
                          </p>
                        </div>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFCF3F] opacity-60" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FFCF3F]" />
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {isIos && !isStandalone && showInstallGuide && (
            <motion.div
              id="iphone-install-guide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-12 max-w-3xl rounded-3xl border border-[#FFCF3F]/35 bg-black/75 p-5 text-white shadow-2xl backdrop-blur-xl sm:p-7"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#FFCF3F] text-black">
                  <Smartphone className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">
                    Add AggieSB+ to your Home Screen
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-white/60">
                    Apple requires you to complete this from the browser menu.
                    Once installed, open AggieSB+ from its new icon and we&apos;ll
                    take you directly through sign-in and notification setup.
                  </p>
                </div>
              </div>
              <ol className="mt-6 grid gap-3 sm:grid-cols-3">
                <li className="rounded-2xl bg-white/[0.07] p-4 text-sm">
                  <span className="mb-3 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-xs font-semibold">
                    1
                  </span>
                  Tap <Share2 className="mx-1 inline h-4 w-4 text-[#FFCF3F]" />
                  <strong> Share</strong> in Safari.
                </li>
                <li className="rounded-2xl bg-white/[0.07] p-4 text-sm">
                  <span className="mb-3 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-xs font-semibold">
                    2
                  </span>
                  Scroll down and choose <strong>Add to Home Screen</strong>.
                </li>
                <li className="rounded-2xl bg-white/[0.07] p-4 text-sm">
                  <span className="mb-3 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-xs font-semibold">
                    3
                  </span>
                  Tap <strong>Add</strong>, then open the AggieSB+ icon.
                </li>
              </ol>
              <p className="mt-4 text-xs text-white/45">
                Keep “Open as Web App” enabled if your iPhone displays that option.
              </p>
            </motion.div>
          )}
        </section>

        <section className="border-y border-[#500000]/10 bg-white/35 px-6 py-20 backdrop-blur-sm dark:border-white/10 dark:bg-black/20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#500000] dark:text-[#FFCF3F]">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading dark:text-white sm:text-4xl">
                From closed section to open seat in three steps.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.article
                    key={step.number}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="rounded-3xl border border-[#500000]/10 bg-white/65 p-6 shadow-sm dark:border-white/10 dark:bg-black/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#500000]/10 text-[#500000] dark:bg-[#FFCF3F]/15 dark:text-[#FFCF3F]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-semibold tracking-[0.16em] text-body/50 dark:text-white/30">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-heading dark:text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-body dark:text-white/55">
                      {step.description}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#500000]/15 bg-[#500000] px-6 py-12 text-center text-white shadow-xl dark:border-[#FFCF3F]/25 dark:bg-[#120f08] sm:px-12">
            <Smartphone className="mx-auto h-8 w-8 text-[#FFCF3F]" />
            <h2 className="mt-5 text-3xl font-semibold tracking-tight">
              Ready to stop refreshing?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
              Sign in, enable notifications on this device, and manage every
              section you&apos;re watching from one place.
            </p>
            <Button
              onClick={beginSetup}
              className="mt-7 h-12 rounded-full bg-[#FFCF3F] px-7 font-semibold text-black hover:bg-[#FFD966]"
            >
                Continue to alert setup
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
