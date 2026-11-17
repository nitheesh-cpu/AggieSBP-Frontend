import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Aggie Schedule Builder Plus",
  description:
    "What the AggieSB+ website and browser extension collect, why, who can see it, and how to opt out or have your data deleted.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
