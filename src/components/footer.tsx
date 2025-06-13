import React from "react";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-canvas border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img src="/favicon.ico" alt="AggieRMP Logo" className="w-6 h-6" />
              <span className="text-xl font-semibold text-text-heading">
                AggieProf
              </span>
            </div>
            <p className="text-text-body mb-8 max-w-sm">
              Real-time, multidimensional professor intelligence for every
              Aggie.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-text-body hover:text-text-heading hover:border-text-body transition-colors duration-[220ms]"
              >
                <Github size={18} />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-text-body hover:text-text-heading hover:border-text-body transition-colors duration-[220ms]"
              >
                <Linkedin size={18} />
              </Link>
            </div>
          </div>

          {/* Features column */}
          <div>
            <h3 className="text-text-heading font-medium mb-6">Features</h3>
            <div className="space-y-4">
              {["Grade Data", "Reviews"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="block text-text-body hover:text-text-heading transition-colors duration-[220ms]"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources column */}
          <div>
            <h3 className="text-text-heading font-medium mb-6">Resources</h3>
            <div className="space-y-4">
              {["Docs", "Blog"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="block text-text-body hover:text-text-heading transition-colors duration-[220ms]"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Company column */}
          <div>
            <h3 className="text-text-heading font-medium mb-6">Company</h3>
            <div className="space-y-4">
              {["About", "Contact"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="block text-text-body hover:text-text-heading transition-colors duration-[220ms]"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section */}
      </div>
    </footer>
  );
};
