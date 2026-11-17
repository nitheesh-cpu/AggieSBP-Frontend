import type { Metadata } from "next";

// Sign-in pages have nothing worth a search result. Not disallowed in
// robots.txt: Google has to crawl them to see this noindex.
export const metadata: Metadata = {
  robots: { index: false },
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
