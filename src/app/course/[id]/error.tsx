"use client";

import { startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// The API was unreachable, rate-limited or erroring while this page rendered.
// Missing courses never land here; they get not-found.tsx and a 404.
export default function CourseError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <div className="min-h-dvh relative" style={{ background: "var(--app-bg-gradient)" }}>
      <Navigation variant="glass" />
      <main className="pt-24 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Card className="p-8 rounded-2xl shadow-none bg-card border-border text-center">
            <h1 className="text-xl font-medium text-text-heading">
              Course details are temporarily unavailable
            </h1>
            <p className="text-text-body">
              We couldn&apos;t reach our course data just now. Please try again in a moment.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={retry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try again
              </Button>
              <Button asChild variant="outline">
                <Link href="/courses">Browse courses</Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
