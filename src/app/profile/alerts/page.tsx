"use client";

import React, { useEffect, useState } from "react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { motion } from "motion/react";
import {
  Bell,
  BellRing,
  CheckCircle2,
  ChevronDown,
  MonitorSmartphone,
  Smartphone,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  savePushSubscription,
  sendTestNotification,
  getPushSubscriptions,
  removePushSubscription,
  getTrackedSections,
  untrackSection,
  type PushSubscriptionDevice,
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
  const [devicesOpen, setDevicesOpen] = useState(true);
  const [devices, setDevices] = useState<PushSubscriptionDevice[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);

  const saveSubscriptionToBackend = async (
    subscription: { endpoint: string; keys?: { p256dh?: string; auth?: string } },
  ) => {
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const reportedPlatform =
      typeof navigator !== "undefined"
        ? (navigator as Navigator & { userAgentData?: { platform?: string } })
            .userAgentData?.platform || navigator.platform || "Unknown"
        : "Unknown";
    const platform =
      reportedPlatform === "MacIntel" && navigator.maxTouchPoints > 1
        ? "iPad"
        : reportedPlatform;
    const browser = /Edg\//.test(userAgent)
      ? "Edge"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Firefox\//.test(userAgent)
          ? "Firefox"
          : /Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)
            ? "Safari"
            : "Browser";
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const context = standalone ? "Home Screen app" : browser;
    const deviceName = `${platform} · ${context}`;

    await savePushSubscription({
      ...subscription,
      device_name: deviceName,
      user_agent: userAgent,
    });
  };

  const saveAndVerifySubscription = async (
    subscription: { endpoint: string; keys?: { p256dh?: string; auth?: string } },
  ) => {
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await saveSubscriptionToBackend(subscription);
        const refreshedDevices = await getPushSubscriptions();
        if (refreshedDevices.some((device) => device.endpoint === subscription.endpoint)) {
          setCurrentEndpoint(subscription.endpoint);
          setDevices(refreshedDevices);
          return;
        }
        lastError = new Error("This device was not found after saving its subscription");
      } catch (error) {
        lastError = error;
      }

      if (attempt === 0) {
        await new Promise((resolve) => window.setTimeout(resolve, 300));
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("We could not verify this device for notifications");
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

  useEffect(() => {
    let cancelled = false;

    const loadDevices = async () => {
      setDevicesLoading(true);
      setDevicesError(null);
      try {
        const [data, registration] = await Promise.all([
          getPushSubscriptions(),
          "serviceWorker" in navigator
            ? navigator.serviceWorker.ready
            : Promise.resolve(null),
        ]);
        const browserSubscription = registration
          ? await registration.pushManager.getSubscription()
          : null;
        if (!cancelled) {
          setDevices(data);
          setCurrentEndpoint(browserSubscription?.endpoint ?? null);
        }
      } catch (e) {
        if (!cancelled) {
          setDevicesError(
            e instanceof Error ? e.message : "Failed to load connected devices",
          );
        }
      } finally {
        if (!cancelled) setDevicesLoading(false);
      }
    };

    void loadDevices();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEnable = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const subscription =
        permission === "granted" ? await subscribe() : await requestAndSubscribe();
      if (subscription && typeof subscription === "object") {
        await saveAndVerifySubscription(subscription as { endpoint: string; keys?: { p256dh?: string; auth?: string } });
      } else {
        throw new Error("The browser did not create a push subscription");
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

  const granted = permission === "granted";
  const hasDeviceSetup =
    granted &&
    currentEndpoint !== null &&
    devices.some((device) => device.endpoint === currentEndpoint);

  useEffect(() => {
    setSetupOpen(!hasDeviceSetup);
  }, [hasDeviceSetup]);

  useEffect(() => {
    if (isStandalone && hasDeviceSetup) {
      window.localStorage.setItem("aggiesbp:alerts-pwa-configured", "1");
    }
  }, [hasDeviceSetup, isStandalone]);

  const groupedTracked = tracked.reduce<Record<string, TrackedSection[]>>((acc, item) => {
    const parts = item.section_id.split("-");
    const courseCode =
      parts.length >= 4 ? `${parts[2]} ${parts[3]}` : item.section_id;
    acc[courseCode] = acc[courseCode] ?? [];
    acc[courseCode].push(item);
    return acc;
  }, {});

  const getDeviceDisplayName = (device: PushSubscriptionDevice) => {
    const userAgent = device.user_agent ?? "";
    const androidModel = userAgent.match(
      /Android[^;]*;\s*([^;)]+?)(?:\s+Build\/[^;)]+)?[;)]/i,
    )?.[1];

    if (/iPhone/i.test(userAgent)) return "iPhone";
    if (/iPad/i.test(userAgent)) return "iPad";
    if (androidModel) {
      const model = androidModel.replace(/^[a-z]{2}-[A-Z]{2};\s*/i, "").trim();
      if (/^SM-/i.test(model)) return `Samsung phone (${model})`;
      return model;
    }
    if (/Android/i.test(userAgent)) return "Android device";
    if (/CrOS/i.test(userAgent)) return "Chromebook";
    if (/Windows/i.test(userAgent)) return "Windows PC";
    if (/Macintosh|Mac OS X/i.test(userAgent)) return "Mac";
    if (/Linux/i.test(userAgent)) return "Linux computer";
    if (device.device_name?.trim()) return device.device_name.split(" · ")[0];
    return "Unknown device";
  };

  const getDeviceBrowser = (device: PushSubscriptionDevice) => {
    const userAgent = device.user_agent ?? "";
    const browser = /EdgA?\//i.test(userAgent)
      ? "Microsoft Edge"
      : /CriOS|Chrome\//i.test(userAgent)
        ? "Google Chrome"
        : /FxiOS|Firefox\//i.test(userAgent)
          ? "Firefox"
          : /OPR\/|Opera/i.test(userAgent)
            ? "Opera"
            : /Safari\//i.test(userAgent)
              ? "Safari"
              : "Web browser";
    return device.device_name?.includes("Home Screen app")
      ? `${browser} Home Screen app`
      : browser;
  };

  const getDeviceSystem = (device: PushSubscriptionDevice) => {
    const userAgent = device.user_agent ?? "";
    if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS/iPadOS";
    if (/Android/i.test(userAgent)) return "Android";
    if (/CrOS/i.test(userAgent)) return "ChromeOS";
    if (/Windows/i.test(userAgent)) return "Windows";
    if (/Macintosh|Mac OS X/i.test(userAgent)) return "macOS";
    if (/Linux/i.test(userAgent)) return "Linux";
    return null;
  };

  const formatDeviceTime = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    const elapsedSeconds = Math.round((date.getTime() - Date.now()) / 1000);
    const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    if (Math.abs(elapsedSeconds) < 60) return relative.format(elapsedSeconds, "second");
    const elapsedMinutes = Math.round(elapsedSeconds / 60);
    if (Math.abs(elapsedMinutes) < 60) return relative.format(elapsedMinutes, "minute");
    const elapsedHours = Math.round(elapsedMinutes / 60);
    if (Math.abs(elapsedHours) < 24) return relative.format(elapsedHours, "hour");
    const elapsedDays = Math.round(elapsedHours / 24);
    if (Math.abs(elapsedDays) < 30) return relative.format(elapsedDays, "day");
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    });
  };

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
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
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
                Seat Alerts
              </h1>
              <p className="text-body dark:text-gray-400 text-sm">
                Get notified when a watched section opens up
              </p>
            </div>
          </motion.div>

          {/* At-a-glance alert dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06 }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("watched-sections")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="rounded-2xl border border-[#500000]/10 bg-white/55 p-4 text-left shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-black/45 dark:hover:bg-black/65"
            >
              <BellRing className="h-5 w-5 text-[#500000] dark:text-[#FFCF3F]" />
              <p className="mt-3 text-2xl font-semibold text-heading dark:text-white">
                {trackedLoading ? "—" : tracked.length}
              </p>
              <p className="text-xs text-body dark:text-white/55">
                watched section{tracked.length === 1 ? "" : "s"}
              </p>
            </button>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("notification-devices")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="rounded-2xl border border-[#500000]/10 bg-white/55 p-4 text-left shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-black/45 dark:hover:bg-black/65"
            >
              <MonitorSmartphone className="h-5 w-5 text-[#500000] dark:text-[#FFCF3F]" />
              <p className="mt-3 text-2xl font-semibold text-heading dark:text-white">
                {devicesLoading ? "—" : devices.length}
              </p>
              <p className="text-xs text-body dark:text-white/55">
                notification device{devices.length === 1 ? "" : "s"}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setSetupOpen(true)}
              className="rounded-2xl border border-[#500000]/10 bg-white/55 p-4 text-left shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-black/45 dark:hover:bg-black/65"
            >
              <CheckCircle2
                className={`h-5 w-5 ${
                  hasDeviceSetup ? "text-emerald-500" : "text-amber-500"
                }`}
              />
              <p className="mt-3 text-sm font-semibold text-heading dark:text-white">
                {hasDeviceSetup ? "Notifications ready" : "Finish notification setup"}
              </p>
              <p className="mt-1 text-xs text-body dark:text-white/55">
                {hasDeviceSetup ? "This device can receive alerts" : "Required to receive seat alerts"}
              </p>
            </button>
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
                        watching opens up. We&apos;ll verify this device with the server
                        and retry automatically if the first save does not stick.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleEnable}
                          disabled={loading || hasDeviceSetup}
                          className="bg-[#500000] text-white hover:bg-[#330000] dark:bg-[#FFCF3F] dark:text-black dark:hover:bg-[#FFD966]"
                        >
                          {loading
                            ? "Checking connection..."
                            : hasDeviceSetup
                              ? "Alerts enabled"
                              : granted
                                ? "Connect this device"
                                : "Enable alerts"}
                        </Button>
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
                  disabled={testLoading || !hasDeviceSetup}
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

            {/* Notification devices */}
            <div id="notification-devices" className="scroll-mt-24 pt-6 border-t border-[#500000]/10 dark:border-[#FFCF3F]/10 mt-6">
              <Collapsible open={devicesOpen} onOpenChange={setDevicesOpen}>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-heading dark:text-white">
                    Connected devices
                  </h3>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#500000] dark:text-[#FFCF3F] hover:opacity-90 transition-opacity"
                      aria-label={devicesOpen ? "Collapse connected devices" : "Expand connected devices"}
                    >
                      {devicesOpen ? "Hide" : "Show"}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${devicesOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </CollapsibleTrigger>
                </div>
                <p className="text-sm text-body dark:text-gray-400 mb-3">
                  Devices below are currently registered to receive push alerts.
                </p>
                <CollapsibleContent className="space-y-2 mb-6">
                  {devicesLoading && (
                    <p className="text-sm text-body dark:text-gray-400">
                      Loading connected devices...
                    </p>
                  )}
                  {devicesError && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {devicesError}
                    </p>
                  )}
                  {!devicesLoading && !devicesError && devices.length === 0 && (
                    <p className="text-sm text-body dark:text-gray-400">
                      No devices are currently enabled for notifications.
                    </p>
                  )}
                  {!devicesLoading && devices.length > 0 && (
                    <>
                      {devices.map((device) => {
                        const isCurrentDevice = device.endpoint === currentEndpoint;
                        const system = getDeviceSystem(device);
                        const lastActive = formatDeviceTime(
                          device.last_seen_at ?? device.created_at,
                        );
                        const connectedAt = device.created_at
                          ? new Date(device.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : null;

                        return (
                        <div
                          key={device.id}
                          className="rounded-xl border border-border/60 bg-white/60 p-4 dark:border-white/10 dark:bg-black/40"
                        >
                          <div className="flex items-start gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#500000]/10 text-[#500000] dark:bg-[#FFCF3F]/10 dark:text-[#FFCF3F]">
                              {/iPhone|iPad|Android|Mobile/i.test(device.user_agent ?? "") ? (
                                <Smartphone className="h-5 w-5" />
                              ) : (
                                <MonitorSmartphone className="h-5 w-5" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-heading dark:text-white">
                                  {getDeviceDisplayName(device)}
                                </p>
                                {isCurrentDevice && (
                                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                    This device
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-body dark:text-gray-400">
                                {[getDeviceBrowser(device), system]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-body dark:text-gray-400">
                                {lastActive && <span>Active {lastActive}</span>}
                                {connectedAt && <span>Connected {connectedAt}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 sm:pl-[3.25rem]">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[#500000] dark:text-[#FFCF3F] border-[#500000]/40 dark:border-[#FFCF3F]/40"
                              onClick={async () => {
                                try {
                                  await removePushSubscription(device.endpoint);
                                  setDevices((prev) =>
                                    prev.filter((d) => d.id !== device.id),
                                  );
                                } catch (e) {
                                  setDevicesError(
                                    e instanceof Error
                                      ? e.message
                                      : "Failed to remove device",
                                  );
                                }
                              }}
                            >
                              Remove device
                            </Button>
                          </div>
                        </div>
                        );
                      })}
                    </>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>

            <div id="watched-sections" className="scroll-mt-24 pt-6 border-t border-[#500000]/10 dark:border-[#FFCF3F]/10 mt-6">
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
