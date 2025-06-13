"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, BarChart3, ArrowRight } from 'lucide-react';
import { useComparison } from '@/contexts/ComparisonContext';
import { useRouter } from 'next/navigation';

export function ComparisonWidget() {
  const { selectedCourses, removeCourse, clearAll } = useComparison();
  const router = useRouter();

  console.log('ComparisonWidget - selectedCourses:', selectedCourses);
  console.log('ComparisonWidget - selectedCourses.length:', selectedCourses.length);

  // Don't render if no courses selected
  if (selectedCourses.length === 0) {
    console.log('ComparisonWidget - not rendering, no courses selected');
    return null;
  }

  const handleCompare = () => {
    router.push('/courses/compare');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <Card className="bg-card border-border shadow-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#500000]" />
            <span className="font-semibold text-text-heading">
              Compare Courses ({selectedCourses.length}/4)
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 w-6 p-0 hover:bg-red-100"
          >
            <X className="w-4 h-4" />
          </Button>
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

        <Button
          onClick={handleCompare}
          disabled={selectedCourses.length < 2}
          className="w-full bg-[#500000] hover:bg-[#600000] text-white"
        >
          Compare Selected
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        {selectedCourses.length < 2 && (
          <p className="text-xs text-text-body mt-2 text-center">
            Select at least 2 courses to compare
          </p>
        )}
      </Card>
    </div>
  );
} 