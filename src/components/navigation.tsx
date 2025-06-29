"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Menu } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavigationProps {
  className?: string;
}

export const Navigation = ({ className = "" }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: "Departments", href: "/departments" },
    { name: "Courses", href: "/courses" },
    { name: "Professors", href: "/professors" },
    { name: "Compare", href: "/compare" },
    { name: "About", href: "/about" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-canvas border-b border-border ${className}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" onClick={closeMobileMenu}>
                <div className="flex items-center space-x-3">
                  <Image
                    src="/favicon.ico"
                    alt="AggieRMP Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                  <span className="text-xl font-semibold text-heading tracking-tight">
                    AggieSB+
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Items */}
            <nav className="hidden md:flex items-center space-x-8 ml-16">
              {navigationItems.map((item) => (
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

            {/* Desktop CTA Button and Theme Toggle */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              <Link href="/compare">
                <button className="bg-button-primary text-button-primary-text hover:bg-maroon-light transition-colors duration-normal font-medium px-6 py-2 text-sm rounded-full">
                  Start comparing
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button and Theme Toggle */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={toggleMobileMenu}
                className="text-body hover:text-heading transition-colors duration-normal p-2"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-sm bg-canvas border-l border-border z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <Image
                src="/favicon.ico"
                alt="AggieRMP Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-lg font-semibold text-heading">
                AggieSB+
              </span>
            </div>
            <button
              onClick={closeMobileMenu}
              className="text-body hover:text-heading transition-colors duration-normal p-1"
              aria-label="Close mobile menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile Navigation Items */}
          <nav className="flex-1 px-6 py-6">
            <div className="space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="block text-body hover:text-heading text-lg font-medium transition-colors duration-normal py-2"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile CTA Button */}
          <div className="p-6 border-t border-border">
            <Link href="/compare" onClick={closeMobileMenu}>
              <button className="w-full bg-button-primary text-button-primary-text hover:bg-maroon-light transition-colors duration-normal font-medium px-6 py-3 text-sm rounded-full">
                Start comparing
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
