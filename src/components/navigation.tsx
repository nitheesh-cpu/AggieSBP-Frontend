"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, ChevronDown } from "lucide-react";
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
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const isOverlay = variant === "transparent" || variant === "glass";

  // IMPORTANT: Don't compute theme-dependent inline styles here.
  // When using next-themes, JS theme resolution can shift during hydration,
  // causing the navbar to flash the wrong color on refresh. Use CSS `dark:`
  // classes so the correct theme is applied immediately from <html class="dark">.
  const headerClassName =
    variant === "transparent"
      ? "bg-transparent border-b-0"
      : variant === "glass"
        ? "bg-white/80 dark:bg-black/80 border-b border-[#500000]/25 dark:border-[#FFCF3F]/50 backdrop-blur-md"
        : "bg-white dark:bg-black border-b-2 border-[#500000] dark:border-[#FFCF3F]";

  const linkClassName = isOverlay
    ? "relative text-heading hover:text-heading dark:text-white/90 dark:hover:text-white text-sm font-medium transition-all duration-normal ease-in-out group"
    : "relative text-body text-sm font-medium transition-all duration-normal ease-in-out hover:text-heading group";

  const underlineClassName = isOverlay
    ? "absolute -bottom-1 left-0 w-0 h-px bg-heading dark:bg-white transition-all duration-normal ease-in-out group-hover:w-full"
    : "absolute -bottom-1 left-0 w-0 h-px bg-heading transition-all duration-normal ease-in-out group-hover:w-full";

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
  ] as const;

  const searchItems = [
    { name: "Departments", href: "/departments" },
    { name: "Courses", href: "/courses" },
    { name: "Professors", href: "/professors" },
  ] as const;

  const discoverItems = [
    { name: "Fit My Schedule", href: "/discover/fit" },
    { name: "Core Curriculum", href: "/discover/ucc" },
    { name: "By Department", href: "/discover/dept" },
  ] as const;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 ${headerClassName} ${className}`}
        data-oid="ilaa0s3"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6" data-oid="6.rinbi">
          <div
            className="flex items-center justify-between h-14 sm:h-16"
            data-oid="l4-iau1"
          >
            {/* Logo */}
            <Link href="/" className="flex items-center" data-oid="h31:j-4">
              <div className="flex items-center space-x-2 sm:space-x-3" data-oid="p5rzkzk">
                <img
                  src="/favicon.ico"
                  alt="AggieRMP Logo"
                  className="w-6 h-6 sm:w-8 sm:h-8"
                  data-oid="bybc6ok"
                />

                <span
                  className={`text-lg sm:text-xl font-semibold tracking-tight ${isOverlay
                    ? "text-heading dark:text-white"
                    : "text-heading dark:text-white"
                    }`}
                  data-oid="riswfct"
                >
                  AggieSB+
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Items */}
            <nav
              className="hidden md:flex items-center space-x-8 ml-16"
              data-oid="sjsqv.s"
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={linkClassName}
                  data-oid="hxkolsn"
                >
                  {item.name}
                  <span className={underlineClassName} data-oid="m-f3_qo" />
                </Link>
              ))}

              {/* Discover Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsSearchOpen(true)}
                onMouseLeave={() => setIsSearchOpen(false)}
              >
                <button
                  className={`${linkClassName} flex items-center gap-1`}
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  Search
                  <ChevronDown className={`w-4 h-4 transition-transform ${isSearchOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-black/95 border-2 border-[#500000] dark:border-[#FFCF3F] rounded-lg shadow-lg overflow-hidden"
                    >
                      {searchItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-3 text-sm text-body hover:text-heading hover:bg-gray-100 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Discover Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsDiscoverOpen(true)}
                onMouseLeave={() => setIsDiscoverOpen(false)}
              >
                <button
                  className={`${linkClassName} flex items-center gap-1`}
                  onClick={() => setIsDiscoverOpen(!isDiscoverOpen)}
                >
                  Discover
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDiscoverOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isDiscoverOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-black/95 border-2 border-[#500000] dark:border-[#FFCF3F] rounded-lg shadow-lg overflow-hidden"
                    >
                      {discoverItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-3 text-sm text-body hover:text-heading hover:bg-gray-100 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/compare" className={linkClassName} data-oid="hxkolsn">
                Compare
                <span className={underlineClassName} data-oid="m-f3_qo" />
              </Link>
            </nav>

            {/* Desktop CTA */}
            <div
              className="hidden md:flex items-center gap-4"
              data-oid="llrkwuz"
            >
              <ThemeToggle />
              <UserMenu />
              <Link href="/compare">
                <Button className="bg-[#FFCF3F] text-[#0f0f0f] hover:bg-[#FFD966] rounded-full px-6">
                  Start comparing
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden" data-oid="xc2k1nn">
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className={`${isOverlay
                  ? "text-text-heading hover:text-text-heading dark:text-white/90 dark:hover:text-white"
                  : "text-text-heading hover:text-text-heading dark:text-white/90 dark:hover:text-white"
                  } transition-colors duration-normal p-2`}
                data-oid="u5.szs3"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="1b7bsr2"
                >
                  {isMobileMenuOpen ? (
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      d="M4 6H20M4 12H20M4 18H20"
                      stroke="currentColor"
                      strokeWidth="2"
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
            className="fixed inset-0 z-40 md:hidden"
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
              className="absolute top-14 sm:top-16 left-0 right-0 border-b border-border bg-white/90 dark:border-white/10 dark:bg-black/85 backdrop-blur-md"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 py-4 max-h-[min(70vh,calc(100dvh-5.5rem))] overflow-y-auto">
                <p className="text-xs font-medium text-text-body dark:text-white/60 mb-3 px-1">
                  Quick links
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {MOBILE_APP_QUICK_LINKS.map((item) => (
                    <Link
                      key={`${item.href}-${item.name}`}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={
                        item.emphasis
                          ? "col-span-2 flex items-center justify-center gap-2 min-h-[52px] rounded-xl px-4 py-3 text-sm font-semibold text-center transition-colors bg-[#500000] text-white border border-[#500000] hover:bg-[#3d0000] dark:bg-[#FFCF3F] dark:text-black dark:border-[#FFCF3F] dark:hover:bg-[#FFD966]"
                          : "flex items-center justify-center min-h-[48px] rounded-xl px-2 py-2.5 text-sm font-medium text-center transition-colors border bg-white/90 text-heading border-[#500000]/20 hover:bg-[#500000]/5 dark:bg-black/50 dark:text-white/90 dark:border-[#FFCF3F]/25 dark:hover:bg-white/10"
                      }
                    >
                      {item.emphasis ? (
                        <>
                          <Bell className="w-4 h-4 shrink-0" aria-hidden />
                          {item.name}
                        </>
                      ) : (
                        item.name
                      )}
                    </Link>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-border/20 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-body dark:text-white/70">Account</span>
                    <UserMenu />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-body dark:text-white/70">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Link href="/compare" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#FFCF3F] text-[#0f0f0f] hover:bg-[#FFD966] rounded-full">
                      Start comparing
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};
