import type { Metadata } from "next";
import { HomePageMotion } from "@/components/home/home-page";

// Many visitors arrive searching for TAMU's official Aggie Schedule Builder,
// so say what this site adds and that it's an unofficial companion. Other
// pages without their own title keep the root layout's default.
export const metadata: Metadata = {
  // Google shows about 60 characters of a title; keep the key words in them.
  title: "Aggie Schedule Builder Plus: TAMU Grades, Ratings & Seat Alerts",
  description:
    "Unofficial companion to Texas A&M's Aggie Schedule Builder: grade distributions, professor ratings and reviews, and seat alerts when a full section opens.",
};

export default function HomePage() {
  return <HomePageMotion />;
}
