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
// Unknown departments never land here; they get a 404.
export default function DepartmentError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <div className="min-h-dvh bg-canvas">
      <Navigation variant="glass" />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Card className="space-y-4 rounded-2xl border-border bg-card p-8 text-center shadow-none">
            <h1 className="text-xl font-medium text-text-heading">
              This department page is temporarily unavailable
            </h1>
            <p className="text-text-body">
              We couldn&apos;t reach our course data just now. Please try again in a moment.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={retry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
              <Button asChild variant="outline">
                <Link href="/browse">All departments</Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
