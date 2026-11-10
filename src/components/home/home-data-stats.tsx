"use client";

import React from "react";
import { getDataStats, type DataStats } from "@/lib/api";

type Stat = {
  value: string;
  label: string;
  helper?: string;
};

type ParsedValue = {
  prefix: string;
  suffix: string;
  target: number;
};

function parseValue(value: string): ParsedValue {
  const trimmed = value.trim();
  const prefix = trimmed.startsWith("~") ? "~" : "";
  const suffix = trimmed.endsWith("+") ? "+" : "";
  const numeric = trimmed.replace(/[^\d]/g, "");
  const target = numeric ? Number(numeric) : 0;
  return { prefix, suffix, target };
}

function formatNumber(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function CountUp({ value }: { value: string }) {
  const { prefix, suffix, target } = parseValue(value);
  return (
    <span className="tabular-nums">
      {`${prefix}${formatNumber(target)}${suffix}`}
    </span>
  );
}

// Default fallback stats
const DEFAULT_STATS: Stat[] = [
  {
    value: "80,000+",
    label: "Reviews summarized",
    helper: "student feedback distilled into insights",
  },
  {
    value: "~6,000",
    label: "Courses indexed across terms",
    helper: "searchable across departments",
  },
  {
    value: "~6,000",
    label: "Professors indexed",
    helper: "ratings, tags, and outcomes",
  },
  {
    value: "110,000+",
    label: "GPA data points",
    helper: "grade distributions and outcomes",
  },
];

function mapDataStatsToStats(data: DataStats | Record<string, unknown>): {
  stats: Stat[];
  lastUpdated: string;
} {
  // Use the correct field names from the API response
  const reviewsCount = (data as DataStats).reviews_count;
  const coursesCount = (data as DataStats).courses_count;
  const professorsCount = (data as DataStats).professors_count;
  const gpaDataCount = (data as DataStats).gpa_data_count;
  const lastUpdated = (data as DataStats).last_updated;

  return {
    stats: [
      {
        value: formatNumber(reviewsCount as number),
        label: "Reviews summarized",
        helper: "student feedback distilled into insights",
      },
      {
        value: formatNumber(coursesCount as number),
        label: "Courses indexed across terms",
        helper: "searchable across departments",
      },
      {
        value: formatNumber(professorsCount as number),
        label: "Professors indexed",
        helper: "ratings, tags, and outcomes",
      },
      {
        value: formatNumber(gpaDataCount as number),
        label: "GPA data points",
        helper: "grade distributions and outcomes",
      },
    ],
    lastUpdated: (lastUpdated as string) || "",
  };
}

export function HomeDataStats() {
  const [stats, setStats] = React.useState<Stat[]>(DEFAULT_STATS);
  const [lastUpdated, setLastUpdated] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        const data = await getDataStats();
        const mappedData = mapDataStatsToStats(data);
        setStats(mappedData.stats);
        setLastUpdated(mappedData.lastUpdated);
      } catch (error) {
        console.error("Failed to fetch data stats:", error);
        // Keep default stats on error
        setStats(DEFAULT_STATS);
        setLastUpdated("");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <section className="w-full py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl text-text-heading">AggieSB+ index</h2>
          {lastUpdated && (
            <p className="font-mono text-xs text-text-muted">
              Updated{" "}
              {new Date(lastUpdated).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <dt className="text-sm text-text-body">{s.label}</dt>
              <dd className="mt-3 font-mono text-[28px] font-medium leading-none text-accent">
                {isLoading ? (
                  <span className="text-text-muted">—</span>
                ) : (
                  <CountUp key={`${s.label}-${s.value}`} value={s.value} />
                )}
              </dd>
              {s.helper ? (
                <dd className="mt-3 text-xs leading-4 text-text-muted">{s.helper}</dd>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
