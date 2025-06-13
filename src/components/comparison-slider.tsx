"use client";

import React, { useState, useRef, useCallback } from "react";

export const ComparisonSlider = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderValue(percentage);
    },
    [isDragging],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderValue(percentage);
    },
    [isDragging],
  );

  React.useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderValue(percentage);
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("mousemove", handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isDragging]);

  return (
    <section className="w-full py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-semibold text-white leading-tight mb-4">
            Teaching & research at a glance
          </h2>
          <p className="text-lg text-[#e6e6e6] max-w-2xl mx-auto">
            Drag to compare a professor&apos;s teaching focus against research
            intensity.
          </p>
        </div>

        <div className="relative mb-12">
          {/* Main Slider Container */}
          <div
            ref={sliderRef}
            className="relative w-full h-[220px] mx-auto max-w-[900px] rounded-xl overflow-hidden cursor-pointer"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            style={{
              background: `linear-gradient(90deg, 
                rgba(139, 69, 69, 1) 0%, 
                rgba(80, 0, 0, 1) ${sliderValue}%, 
                rgba(255, 207, 63, 1) ${sliderValue}%, 
                rgba(255, 182, 193, 1) 100%)`,
            }}
          >
            {/* Grain Overlay */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: "256px 256px",
              }}
            />

            {/* Left Gradient Section */}
            <div
              className="absolute left-0 top-0 h-full transition-all duration-200"
              style={{ width: `${sliderValue}%` }}
            >
              <div
                className="w-full h-full"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(139, 69, 69, 0.8) 0%, rgba(80, 0, 0, 1) 100%)",
                }}
              />
            </div>

            {/* Right Gradient Section */}
            <div
              className="absolute right-0 top-0 h-full transition-all duration-200"
              style={{ width: `${100 - sliderValue}%` }}
            >
              <div
                className="w-full h-full"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255, 182, 193, 0.8) 0%, rgba(255, 207, 63, 1) 100%)",
                }}
              />
            </div>

            {/* Draggable Handle */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing transition-all duration-220 hover:scale-110 z-10"
              style={{ left: `${sliderValue}%` }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
            >
              <div className="absolute inset-2 bg-gray-800 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>

            {/* Section Labels */}
            <div className="absolute top-6 left-6">
              <div className="text-xs font-medium text-white uppercase tracking-wider opacity-80">
                Teaching
              </div>
            </div>
            <div className="absolute top-6 right-6">
              <div className="text-xs font-medium text-white uppercase tracking-wider opacity-80">
                Research
              </div>
            </div>
          </div>

          {/* Description Text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-[900px] mx-auto">
            <div>
              <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-3 opacity-80">
                Teaching
              </h3>
              <p className="text-[#e6e6e6] leading-relaxed">
                Lecture clarity, engagement & student feedback.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-3 opacity-80">
                Research
              </h3>
              <p className="text-[#e6e6e6] leading-relaxed">
                Publication record, grants & citations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
