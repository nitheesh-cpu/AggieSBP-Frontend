"use client";

import React, { useEffect, useState } from "react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { motion } from "motion/react";
import { Bell, Smartphone, Share2, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  savePushSubscription,
  sendTestNotification,
  getTrackedSections,
  untrackSection,
  type TrackedSection,
} from "@/lib/api";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function MyAlertsPage() {
  return (
    <SessionAuth>
      <MyAlertsContent />
    </SessionAuth>
  );
}

function MyAlertsContent() {
  const { isStandalone, permission, requestAndSubscribe, subscribe } = usePushNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [tracked, setTracked] = useState<TrackedSection[]>([]);
  const [trackedLoading, setTrackedLoading] = useState(true);
  const [trackedError, setTrackedError] = useState<string | null>(null);

  const saveSubscriptionToBackend = async (
    subscription: { endpoint: string; keys?: { p256dh?: string; auth?: string } },
  ) => {
    await savePushSubscription(subscription);
  };

  useEffect(() => {
    let cancelled = false;
    const loadTracked = async () => {
      setTrackedLoading(true);
      setTrackedError(null);
      try {
        const data = await getTrackedSections();
        if (!cancelled) setTracked(data);
      } catch (e) {
        if (!cancelled) {
          setTrackedError(
            e instanceof Error
              ? e.message
              : "Failed to load watched sections",
          );
        }
      } finally {
        if (!cancelled) setTrackedLoading(false);
      }
    };
    void loadTracked();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEnable = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const subscription = await requestAndSubscribe();
      if (subscription && typeof subscription === "object") {
        await saveSubscriptionToBackend(subscription as { endpoint: string; keys?: { p256dh?: string; auth?: string } });
      }
      setSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to enable notifications";
      console.error("Push subscription error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResave = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const subscription = await subscribe();
      if (subscription && typeof subscription === "object") {
        await saveSubscriptionToBackend(subscription as { endpoint: string; keys?: { p256dh?: string; auth?: string } });
      }
      setSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to re-save subscription";
      console.error("Re-save subscription error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNow = async () => {
    setTestStatus("Sending...");
    setTestError(null);
    setTestLoading(true);
    try {
      await sendTestNotification();
      setTestStatus("Test notification sent. Check this device.");
    } catch (e) {
      setTestError(e instanceof Error ? e.message : "Failed to send");
      setTestStatus(null);
    } finally {
      setTestLoading(false);
    }
  };

  const granted = permission === "granted";
  const hasDeviceSetup = granted;

  useEffect(() => {
    setSetupOpen(!hasDeviceSetup);
  }, [hasDeviceSetup]);

  const groupedTracked = tracked.reduce<Record<string, TrackedSection[]>>((acc, item) => {
    const parts = item.section_id.split("-");
    const courseCode =
      parts.length >= 4 ? `${parts[2]} ${parts[3]}` : item.section_id;
    acc[courseCode] = acc[courseCode] ?? [];
    acc[courseCode].push(item);
    return acc;
  }, {});

  return (
    <div
      className="min-h-screen relative flex flex-col"
      style={{ background: "var(--app-bg-gradient)" }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ background: "var(--app-bg-ambient)" }}
      />

      <Navigation variant="glass" />

      <main className="flex-grow pt-24 px-6 relative z-10">
        <div className="max-w-2xl mx-auto space-y-8 pb-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/50 dark:bg-black/50 backdrop-blur-md border border-[#500000]/10 dark:border-[#FFCF3F]/10 rounded-2xl p-4 md:p-6 flex items-center gap-4 md:gap-6 shadow-sm"
          >
            <div className="h-16 w-16 rounded-full bg-[#500000]/5 dark:bg-[#FFCF3F]/10 flex items-center justify-center shrink-0">
              <Bell className="h-8 w-8 text-[#500000] dark:text-[#FFCF3F]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-heading dark:text-white mb-1">
                My Alerts
              </h1>
              <p className="text-body dark:text-gray-400 text-sm">
                Get notified when a watched section opens up
              </p>
            </div>
          </motion.div>

          {/* Setup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/50 dark:bg-black/50 backdrop-blur-md border border-[#500000]/10 dark:border-[#FFCF3F]/10 rounded-2xl p-4 md:p-6 shadow-sm"
          >
            <Collapsible open={setupOpen} onOpenChange={setSetupOpen}>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-heading dark:text-white flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Set up alerts on your phone
                </h2>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#500000] dark:text-[#FFCF3F] hover:opacity-90 transition-opacity"
                    aria-label={setupOpen ? "Collapse setup steps" : "Expand setup steps"}
                  >
                    {setupOpen ? "Hide" : "Show"}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${setupOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="pt-4 space-y-6">
                {/* Step 1: Add to Home Screen */}
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#500000]/10 dark:bg-[#FFCF3F]/10 text-[#500000] dark:text-[#FFCF3F] font-semibold text-sm">
                      1
                    </span>
                    <div>
                      <h3 className="font-medium text-heading dark:text-white mb-2">
                        Add AggieSB+ to your home screen
                      </h3>
                      <p className="text-sm text-body dark:text-gray-400 mb-3">
                        Push notifications work best when the app is installed as a shortcut.
                      </p>
                      <ul className="text-sm text-body dark:text-gray-400 space-y-2 list-disc list-inside">
                        <li>
                          <strong>iPhone (Safari):</strong> Tap the{" "}
                          <Share2 className="inline h-4 w-4 align-middle mx-0.5" /> Share
                          button, then &quot;Add to Home Screen&quot;
                        </li>
                        <li>
                          <strong>Android (Chrome):</strong> Tap the menu (⋮), then
                          &quot;Add to Home screen&quot; or &quot;Install app&quot;
                        </li>
                      </ul>
                      {!isStandalone && (
                        <p className="mt-3 text-amber-600 dark:text-amber-400 text-sm font-medium">
                          You&apos;re viewing in the browser. Add to home screen first for
                          reliable alerts.
                        </p>
                      )}
                      {isStandalone && (
                        <p className="mt-3 text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> App is installed
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2: Enable notifications */}
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#500000]/10 dark:bg-[#FFCF3F]/10 text-[#500000] dark:text-[#FFCF3F] font-semibold text-sm">
                      2
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium text-heading dark:text-white mb-2">
                        Enable notifications
                      </h3>
                      <p className="text-sm text-body dark:text-gray-400 mb-4">
                        Allow AggieSB+ to send you alerts when a section you&apos;re
                        watching opens up. If test notifications fail with &quot;no active
                        subscription&quot;, tap &quot;Re-save subscription&quot; to sync this device.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleEnable}
                          disabled={loading || granted}
                          className="bg-[#500000] text-white hover:bg-[#330000] dark:bg-[#FFCF3F] dark:text-black dark:hover:bg-[#FFD966]"
                        >
                          {granted
                            ? "Alerts enabled"
                            : loading
                              ? "Enabling..."
                              : "Enable alerts"}
                        </Button>
                        {granted && (
                          <Button
                            onClick={handleResave}
                            disabled={loading}
                            variant="outline"
                            className="border-[#500000] dark:border-[#FFCF3F] text-[#500000] dark:text-[#FFCF3F] hover:bg-[#500000]/10 dark:hover:bg-[#FFCF3F]/10"
                          >
                            {loading ? "Saving..." : "Re-save subscription"}
                          </Button>
                        )}
                      </div>
                      {success && (
                        <p className="mt-3 text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> You&apos;re all set!
                        </p>
                      )}
                      {error && (
                        <p className="mt-3 text-red-500 dark:text-red-400 text-sm">
                          {error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 3: Watch sections */}
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#500000]/10 dark:bg-[#FFCF3F]/10 text-[#500000] dark:text-[#FFCF3F] font-semibold text-sm">
                      3
                    </span>
                    <div>
                      <h3 className="font-medium text-heading dark:text-white mb-2">
                        Watch sections
                      </h3>
                      <p className="text-sm text-body dark:text-gray-400">
                        When browsing courses, tap &quot;Watch&quot; on any section you want
                        to get notified about. We&apos;ll alert you as soon as a seat opens.
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white/50 dark:bg-black/50 backdrop-blur-md border border-[#500000]/10 dark:border-[#FFCF3F]/10 rounded-2xl p-4 md:p-6 shadow-sm"
          >
            {/* Test buttons */}
            <div className="pt-6 border-t border-[#500000]/10 dark:border-[#FFCF3F]/10">
              <h3 className="font-medium text-heading dark:text-white mb-2">
                Test your setup
              </h3>
              <p className="text-sm text-body dark:text-gray-400 mb-4">
                Send a test notification to this device to verify alerts are working.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={sendTestNow}
                  disabled={testLoading || !granted}
                  variant="outline"
                  className="border-[#500000] dark:border-[#FFCF3F] text-[#500000] dark:text-[#FFCF3F] hover:bg-[#500000]/10 dark:hover:bg-[#FFCF3F]/10"
                >
                  {testLoading ? "Sending..." : "Send test now"}
                </Button>
              </div>
              {testStatus && (
                <p className="mt-3 text-green-600 dark:text-green-400 text-sm">
                  {testStatus}
                </p>
              )}
              {testError && (
                <p className="mt-3 text-red-500 dark:text-red-400 text-sm">
                  {testError}
                </p>
              )}
            </div>

            {/* Watched classes */}
            <div className="pt-6 border-t border-[#500000]/10 dark:border-[#FFCF3F]/10 mt-6">
              <h3 className="text-lg font-semibold text-heading dark:text-white mb-2">
                Watched classes
              </h3>
              {trackedLoading && (
                <p className="text-sm text-body dark:text-gray-400">
                  Loading watched sections...
                </p>
              )}
              {trackedError && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {trackedError}
                </p>
              )}
              {!trackedLoading && !trackedError && tracked.length === 0 && (
                <p className="text-sm text-body dark:text-gray-400">
                  You&apos;re not watching any sections yet. Go to a course page
                  and tap &quot;Watch&quot; on a section to start.
                </p>
              )}
              {!trackedLoading && tracked.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(groupedTracked).map(([courseCode, sections]) => {
                    return (
                      <div
                        key={courseCode}
                        className="rounded-xl border border-border dark:border-white/10 bg-white/40 dark:bg-black/40 p-4"
                      >
                        <div className="mb-3">
                          <h4 className="text-base font-semibold text-heading dark:text-white">
                            {courseCode}
                          </h4>
                          <p className="text-xs text-body dark:text-gray-400">
                            {sections.length} watched section{sections.length === 1 ? "" : "s"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {sections.map((item) => {
                            const parts = item.section_id.split("-");
                            const crn = parts[1] ?? item.section_id;
                            const sectionNumber = parts[4] ?? "Unknown";
                            return (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-3 rounded-md border border-border/60 dark:border-white/10 bg-white/70 dark:bg-black/50 px-3 py-2"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium text-heading dark:text-white">
                                    Section {sectionNumber}
                                  </span>
                                  <span className="text-xs text-body dark:text-gray-400">
                                    Term {item.term_code} • CRN {crn}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-[#500000] dark:text-[#FFCF3F] border-[#500000]/40 dark:border-[#FFCF3F]/40"
                                  onClick={async () => {
                                    try {
                                      await untrackSection(item.section_id);
                                      setTracked((prev) =>
                                        prev.filter((t) => t.id !== item.id),
                                      );
                                    } catch (e) {
                                      console.error("Failed to unwatch section", e);
                                      setTrackedError(
                                        e instanceof Error
                                          ? e.message
                                          : "Failed to stop watching section",
                                      );
                                    }
                                  }}
                                >
                                  Stop watching
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
