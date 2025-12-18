"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { X, BarChart3, ArrowRight } from "lucide-react";
import { useComparison } from "@/contexts/ComparisonContext";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

export function ComparisonWidget() {
  const { selectedCourses, removeCourse, clearAll } = useComparison();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Don't render if no courses selected
  if (selectedCourses.length === 0) {
    return null;
  }

  const handleCompare = () => {
    setIsSheetOpen(false);
    router.push("/courses/compare");
  };

  const ComparisonContent = () => (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          <span className="font-semibold text-text-heading">
            Compare Courses ({selectedCourses.length}/4)
          </span>
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 w-6 p-0 hover:bg-red-100"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {selectedCourses.map((courseId) => (
          <div
            key={courseId}
            className="flex items-center justify-between bg-canvas/50 rounded-lg p-2"
          >
            <Badge variant="outline" className="text-xs font-medium">
              {courseId}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeCourse(courseId)}
              className="h-6 w-6 p-0 hover:bg-red-100"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleCompare}
          disabled={selectedCourses.length < 2}
          className="w-full bg-[#500000] hover:bg-[#600000] text-white"
        >
          Compare Selected
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        {isMobile && (
          <Button
            variant="outline"
            onClick={clearAll}
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            Clear All
          </Button>
        )}

        {selectedCourses.length < 2 && (
          <p className="text-xs text-text-body text-center">
            Select at least 2 courses to compare
          </p>
        )}
      </div>
    </>
  );

  // Mobile: Use Sheet/Drawer
  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#500000] hover:bg-[#600000] text-white shadow-2xl"
            size="lg"
          >
            <div className="flex flex-col items-center">
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs font-medium">
                {selectedCourses.length}
              </span>
            </div>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="bg-card border-border">
          <SheetHeader>
            <SheetTitle className="text-text-heading">
              Course Comparison
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <ComparisonContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use Card as before
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <Card className="bg-card border-border shadow-2xl p-4">
        <ComparisonContent />
      </Card>
    </div>
  );
}
