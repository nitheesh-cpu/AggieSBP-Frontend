"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { timestamp } from "@/components/admin/admin-ui";
import {
  AdminKeyError,
  getInstructorAiReport,
  type InstructorAiReport,
} from "@/lib/admin-api";

const PAGE_SIZE = 30;

export function AiReviewPanel({
  adminKey,
  onSignOut,
  onReview,
}: {
  adminKey: string;
  onSignOut: () => void;
  onReview: (key: string, tab: "proposed" | "conflict") => void;
}) {
  const [report, setReport] = useState<InstructorAiReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [confidence, setConfidence] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    const controller = new AbortController();
    getInstructorAiReport(adminKey, controller.signal)
      .then(setReport)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof AdminKeyError) onSignOut();
        else
          setError(
            err instanceof Error
              ? err.message
              : "Could not load the AI review report.",
          );
      });
    return () => controller.abort();
  }, [adminKey, onSignOut]);

  const search = query.trim().toLowerCase();
  const matches =
    report?.reviews.filter(
      (review) =>
        (confidence === "all" || review.confidence === confidence) &&
        review.title.toLowerCase().includes(search),
    ) ?? [];

  return (
    <section
      aria-label="AI review report"
      className="space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <div>
        <h2 className="text-lg font-medium text-text-heading">
          AI review report
        </h2>
        {report && (
          <p className="text-sm text-text-muted">
            {report.reviews.length.toLocaleString()} recommendations · Report
            saved {timestamp(report.updatedAt)}
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      {!report && !error && (
        <p role="status" className="text-sm text-text-muted">
          Loading report…
        </p>
      )}
      {report && (
        <>
          {report.errors.length > 0 && (
            <details className="rounded-lg border border-border p-3 text-sm">
              <summary className="cursor-pointer">
                {report.errors.length} report errors
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {report.errors.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </details>
          )}
          <div className="flex flex-wrap gap-3">
            <Input
              className="w-full sm:w-64"
              type="search"
              aria-label="Search report names"
              placeholder="Search report names"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisible(PAGE_SIZE);
              }}
            />
            <select
              className="h-9 rounded-md border border-input bg-card px-3 text-sm"
              aria-label="Report confidence"
              value={confidence}
              onChange={(event) => {
                setConfidence(event.target.value);
                setVisible(PAGE_SIZE);
              }}
            >
              <option value="all">All confidence levels</option>
              <option value="high">High confidence</option>
              <option value="possible">Possible</option>
              <option value="unclear">Unclear</option>
              <option value="unlikely">Unlikely</option>
            </select>
          </div>
          {matches.length === 0 && (
            <p className="text-sm text-text-muted">
              No recommendations match this view.
            </p>
          )}
          <ul className="divide-y divide-border">
            {matches.slice(0, visible).map((review, index) => (
              <li
                key={`${review.key}:${review.title}:${index}`}
                className="space-y-2 py-4 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-text-heading">
                    {review.title}
                  </h3>
                  <Badge
                    variant={
                      review.confidence === "high" ? "default" : "outline"
                    }
                    className="capitalize"
                  >
                    {review.confidence}
                  </Badge>
                </div>
                <p>{review.reason}</p>
                {review.details.map((detail) => (
                  <p key={detail} className="text-text-muted">
                    {detail}
                  </p>
                ))}
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReview(review.key, review.tab)}
                  >
                    Open admin review
                  </Button>
                  {review.rmpUrl && (
                    <a
                      className="underline underline-offset-4"
                      href={review.rmpUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      RMP profile
                    </a>
                  )}
                </div>
                {review.sources.length > 0 && (
                  <ul className="list-disc space-y-1 pl-5 text-text-muted">
                    {review.sources.map((source, sourceIndex) => (
                      <li key={`${source.url}:${sourceIndex}`}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-4"
                        >
                          {source.title}
                        </a>{" "}
                        {source.snippet}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          {matches.length > visible && (
            <Button
              variant="outline"
              onClick={() => setVisible((count) => count + PAGE_SIZE)}
            >
              Show more ({(matches.length - visible).toLocaleString()}{" "}
              remaining)
            </Button>
          )}
        </>
      )}
    </section>
  );
}
