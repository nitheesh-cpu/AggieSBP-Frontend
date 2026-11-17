import type { Metadata } from "next";

// Account pages (/profile, /profile/alerts) need sign-in and show only the
// visitor's own data, so keep them out of search results. Not disallowed in
// robots.txt: Google has to crawl them to see this noindex.
export const metadata: Metadata = {
  robots: { index: false },
};

export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
