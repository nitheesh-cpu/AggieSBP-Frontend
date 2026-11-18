"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { pageFrom, track } from "@/lib/analytics";

interface ComparisonState {
  selectedCourses: string[]; // course IDs
  addCourse: (courseId: string) => boolean;
  removeCourse: (courseId: string) => void;
  clearAll: () => void;
  isSelected: (courseId: string) => boolean;
  canAddMore: () => boolean;
  maxCourses: number;
  hydrated: boolean;
}

const ComparisonContext = createContext<ComparisonState | undefined>(undefined);

const MAX_COURSES = 4;
const STORAGE_KEY = "aggie-rmp-comparison";

/**
 * The id the course API expects: "ACCT 327" -> "ACCT327". Course pages pass
 * the display code (with a space); storing that made /course/ACCT 327 fail
 * with a 400 on the compare page.
 */
export function toCourseId(code: string): string {
  return code.replace(/\s+/g, "").toUpperCase();
}

interface ComparisonProviderProps {
  children: ReactNode;
}

export function ComparisonProvider({ children }: ComparisonProviderProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length <= MAX_COURSES) {
          // Normalize ids saved before toCourseId existed ("ACCT 327").
          const ids = parsed
            .filter((id): id is string => typeof id === "string")
            .map(toCourseId);
          setSelectedCourses([...new Set(ids)]);
        }
      } catch (error) {
        console.error("Failed to parse stored comparison data:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setHydrated(true);
  }, []);

  // Save to localStorage whenever selectedCourses changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCourses));
  }, [selectedCourses]);

  const addCourse = (code: string): boolean => {
    const courseId = toCourseId(code);
    if (
      selectedCourses.length >= MAX_COURSES ||
      selectedCourses.includes(courseId)
    ) {
      return false;
    }
    setSelectedCourses((prev) => [...prev, courseId]);
    track("compare-add", {
      type: "course",
      from: pageFrom(window.location.pathname),
      count: selectedCourses.length + 1,
    });
    return true;
  };

  const removeCourse = (code: string): void => {
    const courseId = toCourseId(code);
    if (!selectedCourses.includes(courseId)) return;
    setSelectedCourses((prev) => prev.filter((id) => id !== courseId));
    track("compare-remove", {
      type: "course",
      from: pageFrom(window.location.pathname),
      count: selectedCourses.length - 1,
    });
  };

  const clearAll = (): void => {
    setSelectedCourses([]);
  };

  const isSelected = (code: string): boolean => {
    return selectedCourses.includes(toCourseId(code));
  };

  const canAddMore = (): boolean => {
    return selectedCourses.length < MAX_COURSES;
  };

  const value: ComparisonState = {
    selectedCourses,
    addCourse,
    removeCourse,
    clearAll,
    isSelected,
    canAddMore,
    maxCourses: MAX_COURSES,
    hydrated,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
