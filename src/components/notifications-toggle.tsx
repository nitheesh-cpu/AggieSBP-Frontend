"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function NotificationsToggle() {
  const { isLoggedIn, permission, requestAndSubscribe } = usePushNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnable = async () => {
    setError(null);
    setLoading(true);
    try {
      await requestAndSubscribe();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to enable notifications";
      console.error("Push subscription error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  const granted = permission === "granted";

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleEnable}
        disabled={loading || granted}
      >
        {granted ? "Alerts enabled" : loading ? "Enabling..." : "Enable alerts"}
      </Button>
      {error && (
        <span className="text-xs text-red-500 max-w-xs text-right">
          {error}
        </span>
      )}
    </div>
  );
}

