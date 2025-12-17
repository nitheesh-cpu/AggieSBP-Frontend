"use client";

import React from "react";
import Image from "next/image";

interface HeroSectionProps {
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className = "" }) => {
  return (
    <section
      className={`w-full flex justify-center ${className}`}
      style={{ marginTop: "70px" }}
      data-oid="w5wfup6"
    >
      <div
        className="relative w-full bg-gradient-to-b from-[#1a1a1a] via-[#111111] to-[#0f0f0f] overflow-hidden"
        data-oid="ro_tmvv"
      >
        {/* Image with bottom-quarter overlay for content */}
        <div className="relative z-0 w-full" data-oid="image-container">
          <Image
            src="/academic-plaza2.png"
            alt="Academic Plaza"
            width={1920}
            height={1080}
            className="w-full h-auto"
            priority
            data-oid="academic-plaza-img"
          />

          {/* Text overlay blended into bottom quarter of the image */}
          <div
            className="absolute inset-x-0 bottom-0 px-6 sm:px-10 pb-10 pt-8"
            style={{
              background:
                "linear-gradient(to top, #330000 0%, #330000 40%, transparent 100%)",
            }}
            data-oid="i-mqogn"
          >
            {/* Main Heading */}
            <h1
              className="text-[20px] sm:text-[24px] md:text-[28px] text-white leading-[1.4] text-center mb-4 max-w-3xl mx-auto"
              style={{ fontFamily: "var(--font-press-start-2p)" }}
              data-oid="8vjvdyl"
            >
              THE FASTEST WAY TO CHOOSE THE LEARNING ENVIRONMENT FOR YOU.
            </h1>

            {/* Subheading in pill-like dark bar */}
            <div
              className="flex justify-center mb-4"
              data-oid="subheading-pill"
            >
              <p
                className="text-[9px] sm:text-[10px] md:text-[11px] text-white tracking-[0.08em] px-6 py-3 rounded-full bg-black/70 inline-block text-center"
                style={{ fontFamily: "var(--font-press-start-2p)" }}
                data-oid="9te.dl5"
              >
                COMPARE TEACHING QUALITY, RESEARCH IMPACT, AND COURSE WORKLOAD
                IN ONE ELEGANT DASHBOARD.
              </p>
            </div>

            {/* Button Group */}
            <div
              className="flex items-center justify-center gap-4 mb-4"
              data-oid="kegyp8i"
            >
              <div
                className="flex flex-col sm:flex-row gap-4"
                data-oid="sth5z5v"
              >
                <button
                  className="bg-[#FFCF3F] text-[#0f0f0f] hover:bg-[#FFD966] px-8 py-4 rounded-full transition-all duration-normal transform hover:scale-105"
                  style={{
                    fontFamily: "var(--font-press-start-2p)",
                    fontSize: "10px",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
                  }}
                  data-oid="dqg5s21"
                >
                  START COMPARING
                </button>
                <button
                  className="text-white px-6 py-3 rounded-full border-2 border-[#FFCF3F] transition-all duration-normal hover:bg-[#FFCF3F] hover:text-[#0f0f0f] transform hover:scale-105"
                  style={{
                    fontFamily: "var(--font-press-start-2p)",
                    fontSize: "9px",
                  }}
                  data-oid="tofv:js"
                >
                  SEE HOW IT WORKS
                </button>
              </div>
            </div>

            {/* Functionalities Text */}
            <div
              className="flex flex-col items-center gap-1"
              data-oid="7cg2r8-"
            >
              <p
                className="text-white/80 text-center leading-[1.8] flex items-center gap-2"
                style={{
                  fontFamily: "var(--font-press-start-2p)",
                  fontSize: "9px",
                }}
                data-oid="6gyv.qu"
              >
                <span className="text-[#FFCF3F]">🔍</span>
                <span>SEARCH BY COURSE</span>
                <span className="mx-1">·</span>
                <span className="text-[#FFCF3F]">📊</span>
                <span>VIEW DISTRIBUTIONS</span>
                <span className="mx-1">·</span>
                <span className="text-[#FFCF3F]">💬</span>
                <span>STUDENT INSIGHTS</span>
              </p>
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
          data-oid="wupvru1"
        />
      </div>

      <style jsx data-oid="n8rx46u">{`
        @keyframes pulse {
          0%,
          100% {
            transform: scaleY(1);
            opacity: 0.9;
          }
          50% {
            transform: scaleY(1.4);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
};
