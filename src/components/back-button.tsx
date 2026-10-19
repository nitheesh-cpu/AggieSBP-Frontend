"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Goes back to wherever the student came from inside the site (a course, the
 * professor list, search results). Opened from outside, it links to the
 * fallback page instead, labelled with where it goes.
 */
export function BackButton({
  fallbackHref,
  fallbackLabel,
}: {
  fallbackHref: string;
  fallbackLabel: string;
}) {
  const router = useRouter();
  const [cameFromSite, setCameFromSite] = React.useState(false);

  React.useEffect(() => {
    try {
      const ref = document.referrer ? new URL(document.referrer) : null;
      setCameFromSite(
        !!ref &&
          ref.origin === window.location.origin &&
          ref.pathname !== window.location.pathname &&
          window.history.length > 1
      );
    } catch {
      setCameFromSite(false);
    }
  }, []);

  if (cameFromSite) {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2 mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
    );
  }

  return (
    <Link href={fallbackHref}>
      <Button variant="outline" className="flex items-center gap-2 mb-4">
        <ArrowLeft className="w-4 h-4" />
        {fallbackLabel}
      </Button>
    </Link>
  );
}
