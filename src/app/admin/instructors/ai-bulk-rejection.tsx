"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AdminKeyError,
  applyAiRejection,
  previewAiRejection,
  type AiRejectionPreview,
} from "@/lib/admin-api";

export function AiBulkRejection({
  adminKey,
  onSignOut,
  onApplied,
}: {
  adminKey: string;
  onSignOut: () => void;
  onApplied: () => void;
}) {
  const [preview, setPreview] = useState<AiRejectionPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run(confirm: boolean) {
    setBusy(true);
    setMessage(null);
    try {
      if (confirm && preview) {
        const result = await applyAiRejection(adminKey, preview.token);
        setPreview(null);
        setMessage(
          `Rejected ${result.rejected.toLocaleString()} pending profiles.`,
        );
        onApplied();
      } else {
        setPreview(await previewAiRejection(adminKey));
      }
    } catch (error) {
      setPreview(null);
      if (error instanceof AdminKeyError) onSignOut();
      else
        setMessage(
          error instanceof Error ? error.message : "Bulk rejection failed.",
        );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-sm space-y-2 text-sm">
      {!preview && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => void run(false)}
        >
          {busy ? "Checking mismatches…" : "Bulk reject mismatches"}
        </Button>
      )}
      {preview && (
        <div className="space-y-2">
          <p role="status">
            {preview.candidates > 0
              ? `${preview.candidates.toLocaleString()} pending profiles across ${preview.instructors.toLocaleString()} instructors qualify. This applies across the full queue.`
              : "No pending profiles qualify for bulk rejection."}
          </p>
          <p className="text-text-muted">
            Includes clear department mismatches and matches the AI rated
            unlikely or very unlikely. Rejections can be undone.
          </p>
          <div className="flex flex-wrap gap-2">
            {preview.candidates > 0 && (
              <Button
                size="sm"
                variant="destructive"
                disabled={busy}
                onClick={() => void run(true)}
              >
                {busy
                  ? "Rejecting…"
                  : `Reject ${preview.candidates.toLocaleString()} profiles`}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => setPreview(null)}
            >
              {preview.candidates > 0 ? "Cancel" : "Close"}
            </Button>
          </div>
        </div>
      )}
      {message && (
        <p role="status" className="text-text-muted">
          {message}
        </p>
      )}
    </div>
  );
}
