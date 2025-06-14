"use client";

import React from "react";

interface HeroSectionProps {
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className = "" }) => {
  return (
    <section
      className={`w-full flex justify-center ${className}`}
      style={{ marginTop: "80px" }}
    >
      <div className="relative w-full max-w-[1040px] bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        {/* Content Container */}
        <div className="relative z-10 px-10 py-10">
          {/* Main Heading */}
          <h1 className="text-[48px] font-semibold text-[var(--color-text-heading)] leading-[1.25] text-center mb-6 max-w-4xl mx-auto">
            The fastest way to choose the best learning experience for you.
          </h1>

          {/* Subheading */}
          <p className="text-lg text-[var(--color-text-body)] text-center mb-8 max-w-3xl mx-auto leading-relaxed">
            Compare teaching quality, course workload, historical data and more
            in one elegant dashboard.
          </p>

          {/* Button Group */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-button-primary text-button-primary-text hover:bg-maroon-light font-medium px-8 py-4 rounded-full text-base transition-colors duration-normal">
                Start comparing
              </button>
              <button className="text-[var(--color-text-heading)] px-6 py-3 rounded-full text-sm font-medium border border-[var(--color-border)] transition-all duration-[var(--animate-duration-normal)] hover:bg-[var(--color-button-hover)]">
                See how it works
              </button>
            </div>
          </div>

          {/* Static Info Card */}
          <div className="flex justify-center mb-8">
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 w-[560px] h-[120px] flex items-center justify-center">
              <p className="text-[var(--color-text-body)] text-center text-sm">
                Search by course • View grade distributions • Read student
                reviews
              </p>
            </div>
          </div>
        </div>

        {/* Animated Background Bars */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 overflow-hidden">
          <div className="relative w-full h-full">
            {/* Dynamic gradient bars with animation */}
            <div className="absolute inset-0 flex items-end justify-center gap-1 px-10">
              {Array.from({ length: 60 }, (_, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-t-sm"
                  style={{
                    width: "12px",
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
