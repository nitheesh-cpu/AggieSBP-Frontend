import type { Metadata } from "next";
import { HomePageMotion } from "@/components/home/home-page";
import { SITE_URL } from "@/lib/site-url";

// Many visitors arrive searching for TAMU's official Aggie Schedule Builder,
// so say what this site adds and that it's an unofficial companion. Other
// pages without their own title keep the root layout's default.
const TITLE = "Aggie Schedule Builder Plus: TAMU Professor Grades & Ratings";
const DESCRIPTION =
  "Unofficial companion to Texas A&M's Aggie Schedule Builder. See every professor's grade distribution and student reviews, and get an alert when a full class opens.";

export const metadata: Metadata = {
  // Google shows about 60 characters of a title; keep the key words in them.
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "Aggie Schedule Builder Plus",
    type: "website",
  },
};

// Tells Google the site's name and its short forms ("AggieSB+"), so brand
// searches and the name shown above the result match what people type.
const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Aggie Schedule Builder Plus",
  alternateName: ["AggieSB+", "AggieSB Plus", "Aggie SB+"],
  url: SITE_URL,
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // "<" escaped so the JSON can never close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(WEBSITE_JSON_LD).replace(/</g, "\\u003c"),
        }}
      />
      <HomePageMotion />
    </>
  );
}
