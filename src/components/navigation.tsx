"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

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
    { name: "Departments", href: "/departments" },
    { name: "Courses", href: "/courses" },
    { name: "Professors", href: "/professors" },
    { name: "Compare", href: "/compare" },
  ] as const;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 ${headerClassName} ${className}`}
        data-oid="ilaa0s3"
      >
        <div className="max-w-7xl mx-auto px-6" data-oid="6.rinbi">
          <div
            className="flex items-center justify-between h-16"
            data-oid="l4-iau1"
          >
            {/* Logo */}
            <Link href="/" className="flex items-center" data-oid="h31:j-4">
              <div className="flex items-center space-x-3" data-oid="p5rzkzk">
                <img
                  src="/favicon.ico"
                  alt="AggieRMP Logo"
                  className="w-8 h-8"
                  data-oid="bybc6ok"
                />

                <span
                  className={`text-xl font-semibold tracking-tight ${
                    isOverlay
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
            </nav>

            {/* Desktop CTA */}
            <div
              className="hidden md:flex items-center gap-2"
              data-oid="llrkwuz"
            >
              <ThemeToggle />
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
                className={`${
                  isOverlay
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
              className="absolute top-16 left-0 right-0 border-b border-border bg-white/90 dark:border-white/10 dark:bg-black/85 backdrop-blur-md"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-6 py-5 space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-heading hover:text-heading dark:text-white/90 dark:hover:text-white text-base font-medium"
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="pt-2">
                  <div className="flex items-center justify-between gap-3 pb-3">
                    <span className="text-sm text-body dark:text-white/70">
                      Theme
                    </span>
                    <ThemeToggle />
                  </div>
                  <Link
                    href="/compare"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
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
