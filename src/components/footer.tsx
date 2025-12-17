import React from "react";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer
      className="border-t border-border"
      style={{ backgroundColor: "#1a0000" }}
      data-oid="x3o5j7z"
    >
      <div className="max-w-7xl mx-auto px-4 py-12" data-oid="9riodxo">
        {/* Main footer content */}
        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-14"
          data-oid="k68_ktr"
        >
          {/* Brand section */}
          <div className="lg:col-span-2" data-oid="d_5kmjd">
            <div
              className="flex items-center space-x-3 mb-6"
              data-oid="9smvtgl"
            >
              <img
                src="/favicon.ico"
                alt="AggieRMP Logo"
                className="w-6 h-6"
                data-oid="6:-wdhz"
              />

              <span
                className="text-xl font-semibold text-text-heading"
                data-oid="yebenmf"
              >
                AggieProf
              </span>
            </div>
            <p className="text-text-body mb-8 max-w-sm" data-oid="zod__aw">
              Real-time, multidimensional professor intelligence for every
              Aggie.
            </p>
            <div className="flex space-x-4" data-oid="i8xzpzf">
              <Link
                href="#"
                className="w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-text-body hover:text-text-heading hover:border-text-body transition-colors duration-[220ms]"
                data-oid="vk4qpz9"
              >
                <Github size={18} data-oid="r.rhzvc" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-text-body hover:text-text-heading hover:border-text-body transition-colors duration-[220ms]"
                data-oid="j30.u4n"
              >
                <Linkedin size={18} data-oid="tp.0-ah" />
              </Link>
            </div>
          </div>

          {/* Features column */}
          <div data-oid="-qgojod">
            <h3
              className="text-text-heading font-medium mb-6"
              data-oid="g6_071s"
            >
              Features
            </h3>
            <div className="space-y-4" data-oid="eqjkr9z">
              {["Grade Data", "Reviews"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="block text-text-body hover:text-text-heading transition-colors duration-[220ms]"
                  data-oid="i6rf8_k"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources column */}
          <div data-oid="5i5q5gq">
            <h3
              className="text-text-heading font-medium mb-6"
              data-oid="b7cc_:r"
            >
              Resources
            </h3>
            <div className="space-y-4" data-oid="abi51h:">
              {["Docs", "Blog"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="block text-text-body hover:text-text-heading transition-colors duration-[220ms]"
                  data-oid="em71fu0"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Company column */}
          <div data-oid="nbf01by">
            <h3
              className="text-text-heading font-medium mb-6"
              data-oid="os9k3y4"
            >
              Company
            </h3>
            <div className="space-y-4" data-oid="show.we">
              {["About", "Contact"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="block text-text-body hover:text-text-heading transition-colors duration-[220ms]"
                  data-oid="65o593q"
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
