"use client";

import React, { useState } from "react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { motion } from "motion/react";
import { Bell, Smartphone, Share2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { savePushSubscription, sendTestNotification } from "@/lib/api";

export default function MyAlertsPage() {
  return (
    <SessionAuth>
      <MyAlertsContent />
    </SessionAuth>
  );
}

function MyAlertsContent() {
  const { isStandalone, permission, requestAndSubscribe } = usePushNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const handleEnable = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const subscription = await requestAndSubscribe();
      if (subscription && typeof subscription === "object") {
        await savePushSubscription(subscription as { endpoint: string; keys?: { p256dh?: string; auth?: string } });
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

  const sendTestIn5 = () => {
    setTestStatus("Will send in 5 seconds...");
    setTestError(null);
    setTimeout(() => void sendTestNow(), 5000);
  };

  const granted = permission === "granted";

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
            className="bg-white/50 dark:bg-black/50 backdrop-blur-md border border-[#500000]/10 dark:border-[#FFCF3F]/10 rounded-2xl p-8 flex items-center gap-6 shadow-sm"
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

          {/* Step-by-step instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/50 dark:bg-black/50 backdrop-blur-md border border-[#500000]/10 dark:border-[#FFCF3F]/10 rounded-2xl p-8 shadow-sm space-y-8"
          >
            <h2 className="text-lg font-semibold text-heading dark:text-white flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Set up on your phone
            </h2>

            {/* Step 1: Add to Home Screen */}
            <div className="space-y-4">
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
            <div className="space-y-4">
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
                    watching opens up.
                  </p>
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
            <div className="space-y-4">
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
                <Button
                  onClick={sendTestIn5}
                  disabled={testLoading || !granted}
                  variant="outline"
                  className="border-[#500000] dark:border-[#FFCF3F] text-[#500000] dark:text-[#FFCF3F] hover:bg-[#500000]/10 dark:hover:bg-[#FFCF3F]/10"
                >
                  Send test in 5 seconds
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
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
