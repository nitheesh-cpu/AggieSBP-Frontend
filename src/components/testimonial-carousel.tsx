"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TestimonialCard {
  id: number;
  tag: string;
  role: string;
  quote: string;
  link: string;
  color: "blue" | "pink" | "orange";
  image: string;
}

const testimonials: TestimonialCard[] = [
  {
    id: 1,
    tag: "@Aggie_Engineer",
    role: "Sophomore, CSCE",
    quote:
      "Using AggieProf, I quickly saw which CSCE221 sections had the lightest curve. Ended up with Prof. Chen and loved every minute.",
    link: "Read the full story",
    color: "blue",
    image: "/api/placeholder/280/320",
  },
  {
    id: 2,
    tag: "@MathMajorAg",
    role: "Junior, MATH",
    quote:
      "The grade distribution data helped me pick the perfect calc professor. Finally understood derivatives for the first time!",
    link: "Read the full story",
    color: "pink",
    image: "/api/placeholder/280/320",
  },
  {
    id: 3,
    tag: "@BioAggie22",
    role: "Senior, BIOL",
    quote:
      "Research ratings showed me which professors actually mentor undergrads. Now I'm co-author on two papers.",
    link: "Read the full story",
    color: "orange",
    image: "/api/placeholder/280/320",
  },
];

const colorStyles = {
  blue: {
    gradient: "linear-gradient(135deg, #39a8ff 0%, #1e40af 100%)",
    duotone: "sepia(100%) hue-rotate(200deg) saturate(150%) brightness(0.9)",
  },
  pink: {
    gradient: "linear-gradient(135deg, #ff359f 0%, #be185d 100%)",
    duotone: "sepia(100%) hue-rotate(300deg) saturate(150%) brightness(0.9)",
  },
  orange: {
    gradient: "linear-gradient(135deg, #ffcf3f 0%, #f97316 100%)",
    duotone: "sepia(100%) hue-rotate(30deg) saturate(150%) brightness(0.9)",
  },
};

export const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const getVisibleCards = () => {
    const cards = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      cards.push(testimonials[index]);
    }
    return cards;
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-white mb-4">
            Meet the students we empower
          </h2>
          <button className="px-6 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-100 transition-all duration-220">
            Discover success stories
          </button>
        </div>

        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-220 group"
          >
            <ChevronLeft className="w-5 h-5 text-white group-hover:text-white/90" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-220 group"
          >
            <ChevronRight className="w-5 h-5 text-white group-hover:text-white/90" />
          </button>

          {/* Carousel Container */}
          <div className="flex gap-6 justify-center">
            {getVisibleCards().map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${currentIndex}-${index}`}
                className="w-80 h-96 rounded-2xl overflow-hidden relative group cursor-pointer transform hover:scale-102 transition-all duration-220 hover:shadow-lg"
                style={{
                  background: colorStyles[testimonial.color].gradient,
                }}
              >
                {/* Portrait Image */}
                <div className="absolute inset-0 z-0">
                  <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${testimonial.image})`,
                      filter: colorStyles[testimonial.color].duotone,
                      opacity: 0.7,
                    }}
                  />
                  {/* Grain overlay */}
                  <div
                    className="absolute inset-0 mix-blend-overlay opacity-20"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white">
                  <div className="mb-4">
                    <div className="text-sm font-medium opacity-90 mb-1">
                      {testimonial.tag}
                    </div>
                    <div className="text-xs opacity-75 mb-4">
                      {testimonial.role}
                    </div>
                    <blockquote className="text-base leading-relaxed mb-4">
                      `&quot;{testimonial.quote}&quot;`
                    </blockquote>
                  </div>

                  <button className="text-sm underline underline-offset-2 hover:no-underline transition-all duration-150 self-start opacity-90 hover:opacity-100">
                    {testimonial.link}
                  </button>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-220" />
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-220 ${
                  index === currentIndex
                    ? "bg-white"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
