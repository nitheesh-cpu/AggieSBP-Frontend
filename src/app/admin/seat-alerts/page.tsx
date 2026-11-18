"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useAdmin } from "@/components/admin/admin-shell";
import { AdminError } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AdminKeyError,
  getSeatAlertHistory,
  type SeatAlertHistory,
  type SeatAlertPeriod,
} from "@/lib/admin-api";

const periods = {
  day: { label: "Day", window: "Last 24 hours", bucket: "Hourly" },
  week: { label: "Week", window: "Last 7 days", bucket: "Daily" },
  month: { label: "Month", window: "Last 30 days", bucket: "Daily" },
} as const;
const chartConfig = {
  sent: { label: "Alerts sent", color: "var(--color-primary)" },
} satisfies ChartConfig;

function AlertHistoryChart({
  history,
  period,
}: {
  history: SeatAlertHistory;
  period: SeatAlertPeriod;
}) {
  const { buckets, timeZone } = history;
  const hourly = period === "day";
  const axisDate = new Intl.DateTimeFormat(undefined, {
    timeZone,
    ...(hourly ? { hour: "numeric" } : { month: "short", day: "numeric" }),
  });
  const detailDate = new Intl.DateTimeFormat(undefined, {
    timeZone,
    month: "short",
    day: "numeric",
    ...(hourly && {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }),
  });
  const total = buckets.reduce((sum, bucket) => sum + bucket.sent, 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-text-muted">Alerts sent</p>
          <p className="text-3xl font-semibold tabular-nums text-text-heading">
            {total.toLocaleString()}
          </p>
        </div>
        {total === 0 && (
          <p className="text-sm text-text-muted">
            No sent alerts recorded in this period.
          </p>
        )}
      </div>
      <ChartContainer
        config={chartConfig}
        className="mt-5 aspect-auto h-56 w-full sm:h-72"
      >
        <BarChart
          accessibilityLayer
          data={buckets}
          margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="startAt"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={18}
            tickFormatter={(value: string) => axisDate.format(new Date(value))}
          />
          <YAxis
            allowDecimals={false}
            domain={[0, (max: number) => Math.max(1, max)]}
            tickLine={false}
            axisLine={false}
            width={42}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => detailDate.format(new Date(value))}
              />
            }
          />
          <Bar
            dataKey="sent"
            fill="var(--color-sent)"
            maxBarSize={48}
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
      <details className="mt-4 border-t border-border pt-3">
        <summary className="cursor-pointer text-sm font-medium text-text-heading">
          View counts by {hourly ? "hour" : "date"}
        </summary>
        <table className="mt-2 w-full text-sm text-text-body">
          <thead className="text-left text-xs text-text-muted">
            <tr>
              <th scope="col" className="py-2 font-medium">
                {hourly ? "Hour" : "Date"}
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Alerts sent
              </th>
            </tr>
          </thead>
          <tbody>
            {buckets.map(({ startAt, sent }) => (
              <tr key={startAt} className="border-t border-border">
                <td className="py-2">
                  <time dateTime={startAt}>
                    {detailDate.format(new Date(startAt))}
                  </time>
                </td>
                <td className="py-2 text-right tabular-nums">
                  {sent.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}

export default function AdminSeatAlerts() {
  const { adminKey, signOut } = useAdmin();
  const [period, setPeriod] = useState<SeatAlertPeriod>("week");
  const [history, setHistory] = useState<SeatAlertHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getSeatAlertHistory(adminKey, period, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setHistory(data);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        if (reason instanceof AdminKeyError) signOut();
        else
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load seat alerts.",
          );
      });
    return () => controller.abort();
  }, [adminKey, attempt, period, signOut]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-text-heading">Seat Alerts</h1>
      <section
        className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5"
        aria-labelledby="seat-history-heading"
      >
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2
              id="seat-history-heading"
              className="text-base font-semibold text-text-heading"
            >
              Alerts sent over time
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              {periods[period].window} · {periods[period].bucket} · Central time
            </p>
          </div>
          <div
            role="group"
            aria-label="Date range"
            className="flex gap-0.5 rounded-xl border border-border bg-raised p-0.5"
          >
            {(Object.keys(periods) as SeatAlertPeriod[]).map((key) => (
              <Button
                key={key}
                variant={key === period ? "default" : "ghost"}
                size="sm"
                aria-pressed={key === period}
                onClick={() => {
                  if (key === period) return;
                  setHistory(null);
                  setError(null);
                  setPeriod(key);
                }}
              >
                {periods[key].label}
              </Button>
            ))}
          </div>
        </header>
        {error ? (
          <>
            <AdminError message={error} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                setAttempt((value) => value + 1);
              }}
            >
              Retry
            </Button>
          </>
        ) : history ? (
          <AlertHistoryChart history={history} period={period} />
        ) : (
          <p className="text-sm text-text-muted" role="status">
            Loading seat alerts…
          </p>
        )}
      </section>
    </div>
  );
}
