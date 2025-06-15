"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

interface HeroSectionProps {
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className = "" }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client-side flag to prevent hydration mismatch
    setIsClient(true);

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Set initial value
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  return (
    <section
      className={`w-full flex justify-center px-4 ${className}`}
      style={{ marginTop: "80px" }}
    >
      <div className="relative w-full max-w-[1040px] bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        {/* Content Container */}
        <div className="relative z-10 px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10">
          {/* Main Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-semibold text-[var(--color-text-heading)] leading-[1.25] text-center mb-4 sm:mb-6 max-w-4xl mx-auto">
            The fastest way to choose the best learning experience for you.
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base md:text-lg text-[var(--color-text-body)] text-center mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
            Compare teaching quality, course workload, historical data and more
            in one elegant dashboard.
          </p>

          {/* Button Group */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Link href="/compare" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-button-primary text-button-primary-text hover:bg-maroon-light font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base transition-colors duration-normal">
                  Start comparing
                </button>
              </Link>
              <Link href="/about" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto text-[var(--color-text-heading)] px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-medium border border-[var(--color-border)] transition-all duration-[var(--animate-duration-normal)] hover:bg-[var(--color-button-hover)]">
                  See how it works
                </button>
              </Link>
            </div>
          </div>

          {/* Static Info Card */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4 sm:p-6 w-full max-w-[560px] min-h-[80px] sm:h-[120px] flex items-center justify-center mx-4">
              <p className="text-[var(--color-text-body)] text-center text-xs sm:text-sm leading-relaxed">
                Search by course • View grade distributions • Read student
                reviews
              </p>
            </div>
          </div>
        </div>

        {/* Animated Background Bars */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 sm:h-1/3 overflow-hidden">
          <div className="relative w-full h-full">
            {/* Dynamic gradient bars with animation - Only render on client to prevent hydration mismatch */}
            <div className="absolute inset-0 flex items-end justify-center gap-0.5 sm:gap-1 px-4 sm:px-10">
              {isClient &&
                Array.from({ length: isMobile ? 30 : 60 }, (_, i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-t-sm"
                    style={{
                      width: isMobile ? "8px" : "12px",
                      height: `${Math.random() * 80 + 20}%`,
                      background: `linear-gradient(${Math.random() * 360}deg, #500000, #FFCF3F, #35E08F, #39A8FF, #FF359F)`,
                      animation: `pulse ${2 + Math.random() * 3}s infinite ease-in-out`,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  >
                    {/* Grain overlay */}
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        mixBlendMode: "multiply",
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Additional grain overlay for the entire card */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scaleY(1);
            opacity: 0.8;
          }
          50% {
            transform: scaleY(1.3);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
};
