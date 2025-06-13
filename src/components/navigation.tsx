"use client";

import React from "react";

interface NavigationProps {
  className?: string;
}

export const Navigation = ({ className = "" }: NavigationProps) => {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-canvas border-b border-border ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <img src="/favicon.ico" alt="AggieRMP Logo" className="w-8 h-8" />
              <span className="text-xl font-semibold text-heading tracking-tight">
                AggieSB+
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-8 ml-16">
            {[
              { name: "Departments", href: "/departments" },
              { name: "Courses", href: "/courses" },
              { name: "Compare", href: "/compare" },
              { name: "Support", href: "#" },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="relative text-body text-sm font-medium transition-all duration-normal ease-in-out hover:text-heading group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-heading transition-all duration-normal ease-in-out group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="flex items-center">
            <button className="bg-button-primary text-button-primary-text hover:bg-maroon-light transition-colors duration-normal font-medium px-6 py-2 text-sm rounded-full">
              Start comparing
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-body hover:text-heading transition-colors duration-normal">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6H20M4 12H20M4 18H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
