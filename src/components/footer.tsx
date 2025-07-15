import React from "react";
import Link from "next/link";
// import { Github, Linkedin } from "lucide-react";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="bg-canvas border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Image
                src="/favicon.ico"
                alt="AggieRMP Logo"
                width={30}
                height={30}
                className="w-8 h-8"
              />
              <span className="text-xl font-semibold text-text-heading">
                AggieSB+
              </span>
            </div>
            <p className="text-text-body mb-8 max-w-sm">
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
          <div>
            <h3 className="text-text-heading font-medium mb-6">Support</h3>
            <div className="space-y-4">
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
          <div>
            <h3 className="text-text-heading font-medium mb-6">Tools</h3>
            <div className="space-y-4">
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
          <div>
            <h3 className="text-text-heading font-medium mb-6">Website</h3>
            <div className="space-y-4">
              {/* {["About", "API Docs"].map((item) => ( */}
              <Link
                key={"About"}
                href="/about"
                className="block text-text-body hover:text-text-heading transition-colors duration-[220ms]"
              >
                About
              </Link>
              {/* ))} */}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-text-body text-sm">
            © 2024 Nitheesh Kodarapu. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link
              href="/terms"
              className="text-text-body hover:text-text-heading transition-colors duration-[220ms]"
            >
              Terms of Service
            </Link>
            <Link
              href="/about"
              className="text-text-body hover:text-text-heading transition-colors duration-[220ms]"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
