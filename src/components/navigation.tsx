"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  GraduationCap,
  Bell,
  BookOpenCheck,
  Building2,
  CalendarClock,
  ChevronDown,
  Gauge,
} from "lucide-react";
import { UserMenu } from "@/components/user-menu";
import { MOBILE_APP_QUICK_LINKS } from "@/lib/nav-quick-links";

interface NavigationProps {
  className?: string;
  variant?: "default" | "transparent" | "glass";
}

export const Navigation = ({
  className = "",
  variant = "default",
}: NavigationProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = React.useState(false);

  // IMPORTANT: Don't compute theme-dependent inline styles here.
  // When using next-themes, JS theme resolution can shift during hydration,
  // causing the navbar to flash the wrong color on refresh. Use CSS `dark:`
  // classes so the correct theme is applied immediately from <html class="dark">.
  const headerClassName =
    variant === "transparent"
      ? "bg-transparent border-b-0 text-white"
      : "bg-maroon-nav border-b border-black/20 text-white shadow-[0_1px_0_rgba(255,207,63,0.18)]";

  const linkClassName =
    "relative flex h-8 items-center rounded-md px-3 text-sm text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white";

  // Close the mobile menu on route change.
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while menu is open.
  React.useEffect(() => {
    if (!isMobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Courses", href: "/courses" },
    { name: "Professors", href: "/professors" },
    { name: "Compare", href: "/compare" },
  ] as const;

  const discoverItems = [
    {
      name: "Schedule builder",
      description: "Find electives you can take and schedules that fit",
      href: "/planner",
      icon: GraduationCap,
    },
    {
      name: "Fit my schedule",
      description: "Find sections that work with your availability",
      href: "/discover/fit",
      icon: CalendarClock,
    },
    {
      name: "Core curriculum",
      description: "Compare options for every UCC requirement",
      href: "/discover/ucc",
      icon: BookOpenCheck,
    },
    {
      name: "Easiest courses",
      description: "Highest GPA, lowest difficulty in each department",
      href: "/discover/dept",
      icon: Gauge,
    },
    {
      name: "Departments",
      description: "Course counts, GPA, and ratings for every department",
      href: "/departments",
      icon: Building2,
    },
  ] as const;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] ${headerClassName} ${className}`}
        data-oid="ilaa0s3"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6" data-oid="6.rinbi">
          <div
            className="flex items-center justify-between h-14"
            data-oid="l4-iau1"
          >
            {/* Logo */}
            <Link href="/" prefetch={false} className="flex items-center" data-oid="h31:j-4">
              <span
                className="text-[17px] font-medium leading-none text-white"
                data-oid="riswfct"
              >
                AggieSB<span className="text-accent-gold">+</span>
              </span>
            </Link>

            {/* Desktop Navigation Items */}
            <nav
              aria-label="Primary navigation"
              className="hidden lg:flex items-center gap-1 ml-8 mr-auto"
              data-oid="sjsqv.s"
            >
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={false}
                    aria-current={isActive ? "page" : undefined}
                    className={`${linkClassName} ${
                      isActive ? "bg-white/15 text-white" : ""
                    }`}
                    data-oid="hxkolsn"
                  >
                    {item.name}
                  </Link>
                );
              })}

              {/* Discover Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsDiscoverOpen(true)}
                onMouseLeave={() => setIsDiscoverOpen(false)}
              >
                <button
                  type="button"
                  aria-expanded={isDiscoverOpen}
                  aria-haspopup="menu"
                  className={`${linkClassName} gap-1 ${
                    pathname.startsWith("/discover") ||
                    pathname.startsWith("/planner") ||
                    pathname.startsWith("/departments")
                      ? "bg-white/15 text-white"
                      : ""
                  }`}
                  onClick={() => setIsDiscoverOpen(!isDiscoverOpen)}
                >
                  Discover
                  <ChevronDown strokeWidth={1.5} className={`w-4 h-4 text-white/60 transition-transform duration-150 ${isDiscoverOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isDiscoverOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16 }}
                      className="absolute left-0 top-full w-80 pt-2"
                    >
                      <div className="rounded-2xl border border-border bg-popover p-2 shadow-xl">
                        {discoverItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              role="menuitem"
                              key={item.name}
                              href={item.href}
                              prefetch={false}
                              onClick={() => setIsDiscoverOpen(false)}
                              className="flex items-start gap-3 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-raised"
                            >
                              <Icon strokeWidth={1.5} className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                              <span>
                                <span className="block text-sm font-medium text-text-heading">
                                  {item.name}
                                </span>
                                <span className="mt-0.5 block text-xs leading-4 text-text-body">
                                  {item.description}
                                </span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Desktop CTA */}
            <div
              className="hidden lg:flex items-center gap-2"
              data-oid="llrkwuz"
            >
              <ThemeToggle />
              <UserMenu />
              <Link href="/alerts" prefetch={false}>
                <Button size="sm" className="ml-1 bg-accent-gold text-[#1d1305] hover:bg-accent-gold/90 dark:bg-accent-gold dark:text-[#1d1305]">
                  Seat alerts
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden" data-oid="xc2k1nn">
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="-mr-2 grid h-10 w-10 place-items-center rounded-lg text-white transition-colors duration-150 hover:bg-white/10"
                data-oid="u5.szs3"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="1b7bsr2"
                >
                  {isMobileMenuOpen ? (
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      d="M4 6H20M4 12H20M4 18H20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      data-oid="wfi87ae"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/50"
            />

            {/* Panel */}
            <motion.div
              id="mobile-menu"
              className="absolute top-[calc(3.5rem+env(safe-area-inset-top))] left-0 right-0 border-b border-border bg-canvas text-text-heading"
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 py-4 max-h-[min(70vh,calc(100dvh-5.5rem-env(safe-area-inset-top)))] overflow-y-auto">
                <p className="text-xs text-text-muted mb-2 px-1">
                  Navigation
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {MOBILE_APP_QUICK_LINKS.map((item) => (
                    <Link
                      key={`${item.href}-${item.name}`}
                      href={item.href}
                      prefetch={false}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={
                        item.emphasis
                          ? "col-span-2 flex items-center justify-center gap-2 h-11 rounded-lg px-4 text-sm font-medium text-center transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                          : "flex items-center justify-center h-11 rounded-lg px-2 text-sm text-center transition-colors border border-border bg-card text-text-heading hover:bg-raised"
                      }
                    >
                      {item.emphasis ? (
                        <>
                          <Bell strokeWidth={1.5} className="w-4 h-4 shrink-0" aria-hidden />
                          {item.name}
                        </>
                      ) : (
                        item.name
                      )}
                    </Link>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-text-body">Account</span>
                    <UserMenu />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-text-body">Theme</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};
