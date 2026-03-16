import React from "react";
import Link from "next/link";
// import { Github, Linkedin } from "lucide-react";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="bg-canvas border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        {/* Main footer content */}
        <div className="flex flex-row flex-wrap lg:flex-nowrap justify-between gap-4 sm:gap-6 lg:gap-8 pb-2">
          {/* Brand section */}
          <div className="flex-shrink-0 w-full md:w-1/3 lg:w-auto mb-4 md:mb-0">
            <div className="flex items-center space-x-3 mb-2 sm:mb-3">
              <Image
                src="/favicon.ico"
                alt="AggieRMP Logo"
                width={24}
                height={24}
                className="w-6 h-6 sm:w-7 sm:h-7"
              />
              <span className="text-base sm:text-lg font-semibold text-text-heading">
                AggieSB+
              </span>
            </div>
            <p className="text-text-body text-[11px] sm:text-xs mb-2 sm:mb-3 md:max-w-[200px] lg:max-w-xs">
              Real-time, multidimensional professor intelligence for every
              Aggie.
            </p>
            {/*             <div className="flex space-x-4">
              <Link
                href="https://github.com/nitheesh-cpu"
                className="w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-text-body hover:text-text-heading hover:border-text-body transition-colors duration-[220ms]"
              >
                <Github size={18} />
              </Link>
              <Link
                href="https://www.linkedin.com/in/nitheesh-kodarapu/"
                className="w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-text-body hover:text-text-heading hover:border-text-body transition-colors duration-[220ms]"
              >
                <Linkedin size={18} />
              </Link>
            </div> */}
          </div>

          {/* Features column */}
          {/* <div>
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
          </div> */}

          {/* Resources column */}
          <div className="flex flex-row justify-start md:justify-end gap-x-8 gap-y-4 sm:gap-12 flex-1 flex-wrap">
            <div className="flex-shrink-0 min-w-24">
              <h3 className="text-text-heading font-medium text-sm sm:text-base mb-1.5 sm:mb-2">
                Support
              </h3>
              <div className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs">
                {/* {["Report a Bug", "Request a Feature"].map((item) => ( */}
              <Link
                key={"Report a Bug"}
                href="https://tally.so/r/nWb6re"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-text-body hover:text-text-heading transition-colors duration-[220ms]"
              >
                Report a Bug
              </Link>
              {/* ))} */}
              <Link
                key={"Request a Feature"}
                href="https://tally.so/r/nWb6re"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-text-body hover:text-text-heading transition-colors duration-[220ms]"
              >
                Request a Feature
              </Link>
            </div>
          </div>

          {/* Company column */}
            <div className="flex-shrink-0 min-w-24">
              <h3 className="text-text-heading font-medium text-sm sm:text-base mb-1.5 sm:mb-2">
                Tools
              </h3>
              <div className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs">
                {/* {["About", "API Docs"].map((item) => ( */}
              <Link
                key={"Chrome Extension"}
                href="https://chromewebstore.google.com/detail/aggie-schedule-builder-pl/glckdcnecomhlmlegmjdceblibmaljpm?hl=en"
                className="block text-text-body hover:text-text-heading transition-colors duration-[220ms]"
              >
                Chrome Extension
              </Link>
              <Link
                key={"API Docs"}
                href="https://api-aggiesbp.servehttp.com/docs"
                className="block text-text-body hover:text-text-heading transition-colors duration-[220ms]"
              >
                API Docs
              </Link>
              {/* ))} */}
            </div>
          </div>

          {/* Company column */}
            <div className="flex-shrink-0 min-w-24">
              <h3 className="text-text-heading font-medium text-sm sm:text-base mb-1.5 sm:mb-2">
                Website
              </h3>
              <div className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs">
                {/* {["About", "API Docs"].map((item) => ( */}
              <Link
                key={"About"}
                href="/about"
                className="block text-text-body hover:text-text-heading transition-colors duration-[220ms]"
              >
                About
              </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
