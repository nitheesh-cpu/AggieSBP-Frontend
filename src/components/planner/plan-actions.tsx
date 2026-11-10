"use client";

import { ListPlus, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  activeBuckets,
  addToWatchlist,
  isWatchedIn,
  removeFromWatchlist,
  updateBucket,
  type DegreePlan,
} from "@/lib/planner/plan";
import { topicLabel } from "@/lib/planner/topics";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export type PlanUpdate = (edit: (plan: DegreePlan) => DegreePlan) => void;

export function isWatched(plan: DegreePlan, code: string, topic?: string | null): boolean {
  return isWatchedIn(plan, code, topic);
}

/** Star toggle for the watchlist; `topic` stars one topic of a special topics course. */
export function WatchButton({
  plan,
  update,
  code,
  topic,
}: {
  plan: DegreePlan;
  update: PlanUpdate;
  code: string;
  topic?: string | null;
}) {
  const watched = isWatched(plan, code, topic);
  const label = topicLabel(code, topic);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => {
        track(watched ? "course-unstar" : "course-star", { course: label });
        update((p) =>
          watched
            ? removeFromWatchlist(p, code, new Date(), topic)
            : addToWatchlist(p, code, new Date(), topic),
        );
      }}
      aria-pressed={watched}
      aria-label={watched ? `Remove ${label} from watchlist` : `Add ${label} to watchlist`}
      title={watched ? `${label} is on your watchlist` : `Add ${label} to watchlist`}
    >
      <Star
        className={cn("h-4 w-4", watched ? "fill-amber-400 text-amber-500" : "text-text-muted")}
      />
    </Button>
  );
}

/** Add a course to a requirement as its own option ("or this course"). */
export function AddToRequirementMenu({
  plan,
  update,
  code,
  onCreateNew,
}: {
  plan: DegreePlan;
  update: PlanUpdate;
  code: string;
  /** Called to start a new requirement containing this course. */
  onCreateNew?: (code: string) => void;
}) {
  const buckets = activeBuckets(plan);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-text-muted"
          aria-label={`Add ${code} to a requirement`}
          title="Add to a requirement"
        >
          <ListPlus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 bg-white dark:bg-card">
        <DropdownMenuLabel>Add {code} to…</DropdownMenuLabel>
        {buckets.length === 0 && (
          <p className="px-2 py-1.5 text-xs text-text-body">No requirements yet.</p>
        )}
        {buckets.map((b) => {
          const already = b.options.some((o) => o.courses.includes(code));
          return (
            <DropdownMenuItem
              key={b.id}
              disabled={already}
              onSelect={() =>
                update((p) => {
                  const current = activeBuckets(p).find((x) => x.id === b.id);
                  if (!current || current.options.some((o) => o.courses.includes(code))) return p;
                  return updateBucket(p, b.id, {
                    options: [...current.options.map((o) => o.courses), [code]],
                  });
                })
              }
            >
              <span className="truncate">{b.name || "Untitled requirement"}</span>
              {already && <span className="ml-auto text-xs text-text-muted">added</span>}
            </DropdownMenuItem>
          );
        })}
        {onCreateNew && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onCreateNew(code)}>
              New requirement with {code}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
