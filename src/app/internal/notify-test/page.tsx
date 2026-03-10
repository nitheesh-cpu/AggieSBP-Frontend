"use client";

import { useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000";

export default function NotifyTestPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendNow = async () => {
    setStatus("Sending now...");
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/users/test-notification`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `HTTP ${res.status}`);
      }
      setStatus("Test notification sent. Check this device.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to send notification";
      setError(msg);
      setStatus(null);
    }
  };

  const sendAfterDelay = () => {
    setStatus("Will send in 5 seconds...");
    setError(null);
    setTimeout(() => {
      void sendNow();
    }, 5000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md w-full p-6 border border-yellow-400/50 rounded-xl bg-black/80 space-y-4">
        <h1 className="text-xl font-semibold">AggieSB+ Notification Test</h1>
        <p className="text-sm text-gray-300">
          This secret page lets you verify that push notifications are working on
          this specific device. Make sure you are logged in and have enabled
          alerts in the main UI.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={sendNow}
            className="w-full rounded-md bg-yellow-400 text-black py-2 text-sm font-medium hover:bg-yellow-300 transition-colors"
          >
            Send test notification now
          </button>
          <button
            onClick={sendAfterDelay}
            className="w-full rounded-md border border-yellow-400 py-2 text-sm font-medium hover:bg-yellow-400/10 transition-colors"
          >
            Send test notification in 5 seconds
          </button>
        </div>
        {status && <p className="text-sm text-green-400">{status}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </main>
  );
}

