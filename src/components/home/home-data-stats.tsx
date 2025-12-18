"use client";

import React from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

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
  const shouldReduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.7 });

  const { prefix, suffix, target } = React.useMemo(
    () => parseValue(value),
    [value]
  );
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = React.useState(
    () => `${prefix}${formatNumber(0)}${suffix}`
  );

  React.useEffect(() => {
    if (!isInView) return;

    if (shouldReduceMotion) {
      setDisplay(`${prefix}${formatNumber(target)}${suffix}`);
      return;
    }

    const controls = animate(motionValue, target, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        setDisplay(`${prefix}${formatNumber(latest)}${suffix}`);
      },
    });

    return () => controls.stop();
  }, [isInView, motionValue, prefix, suffix, target, shouldReduceMotion]);

  return (
    <span ref={ref} aria-label={value}>
      {display}
    </span>
  );
}

const STATS: Stat[] = [
  {
    value: "80,000+",
    label: "reviews summarized",
    helper: "student feedback distilled into insights",
  },
  {
    value: "~6,000",
    label: "courses indexed",
    helper: "searchable across departments",
  },
  {
    value: "~6,000",
    label: "professors tracked",
    helper: "ratings, tags, and outcomes",
  },
  {
    value: "110,000+",
    label: "GPA data points",
    helper: "grade distributions & outcomes",
  },
];

export function HomeDataStats() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full py-10 bg-card border-y border-border dark:bg-black/20 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-canvas px-4 py-2 text-text-body text-xs tracking-wide dark:border-white/15 dark:bg-black/40 dark:text-white/80">
            Data at a glance
          </div>
          <div className="mt-3 text-text-heading dark:text-white text-lg sm:text-xl font-semibold tracking-tight">
            Built on real outcomes, not vibes.
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
        >
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              className="rounded-2xl border border-border bg-canvas px-4 py-4 dark:border-white/10 dark:bg-black/45 dark:backdrop-blur-sm"
            >
              <div className="text-accent text-xl sm:text-2xl font-semibold tracking-tight">
                <CountUp value={s.value} />
              </div>
              <div className="mt-1 text-text-heading dark:text-white/90 text-sm font-medium">
                {s.label}
              </div>
              {s.helper ? (
                <div className="mt-1 text-text-body text-xs leading-relaxed dark:text-white/60">
                  {s.helper}
                </div>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
