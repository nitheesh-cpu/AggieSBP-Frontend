import Link from "next/link";
import Image from "next/image";
import { House, LayoutDashboard } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ background: "var(--app-bg-gradient)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{ background: "var(--app-bg-ambient)" }}
      />

      <Navigation variant="glass" />

      <main className="relative z-10 flex flex-1 flex-col items-center px-4 pb-16 pt-28 text-center sm:pt-32">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-body/70 dark:text-white/50">
          Error 404
        </p>
        <h1
          className="mt-3 max-w-xl text-2xl font-bold tracking-tight text-text-heading dark:text-white lg:text-3xl"
          style={{ fontFamily: "var(--font-press-start-2p), system-ui, sans-serif" }}
        >
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-body dark:text-white/70">
          Even Reveille couldn&apos;t track down this page. The link may be wrong, or the page
          may have moved.
        </p>

        <div className="relative mx-auto mt-10 aspect-square w-full max-w-xs lg:max-w-sm">
          {/* unoptimized: serve /sad-rev.png directly so Next image cache does not stick to an old file */}
          <Image
            src="/sad-rev.png"
            alt="Sad Reveille, the Texas A&M mascot, with tears—this page does not exist."
            fill
            className="object-contain object-center drop-shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
            priority
            sizes="(max-width: 640px) 85vw, 384px"
            unoptimized
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#500000] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3d0000] dark:bg-[#FFCF3F] dark:text-black dark:hover:bg-[#FFD966]"
          >
            <House className="h-4 w-4 shrink-0" aria-hidden />
            Go home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-5 py-2.5 text-sm font-medium text-text-heading backdrop-blur-sm transition-colors hover:bg-white/90 dark:border-white/20 dark:bg-black/40 dark:text-white dark:hover:bg-black/55"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
            Dashboard
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
