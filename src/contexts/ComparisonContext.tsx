"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface ComparisonState {
  selectedCourses: string[]; // course IDs
  addCourse: (courseId: string) => boolean;
  removeCourse: (courseId: string) => void;
  clearAll: () => void;
  isSelected: (courseId: string) => boolean;
  canAddMore: () => boolean;
  maxCourses: number;
}

const ComparisonContext = createContext<ComparisonState | undefined>(undefined);

const MAX_COURSES = 4;
const STORAGE_KEY = "aggie-rmp-comparison";

interface ComparisonProviderProps {
  children: ReactNode;
}

export function ComparisonProvider({ children }: ComparisonProviderProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length <= MAX_COURSES) {
          setSelectedCourses(parsed);
        }
      } catch (error) {
        console.error("Failed to parse stored comparison data:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save to localStorage whenever selectedCourses changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCourses));
  }, [selectedCourses]);

  const addCourse = (courseId: string): boolean => {
    if (
      selectedCourses.length >= MAX_COURSES ||
      selectedCourses.includes(courseId)
    ) {
      return false;
    }
    setSelectedCourses((prev) => [...prev, courseId]);
    return true;
  };

  const removeCourse = (courseId: string): void => {
    setSelectedCourses((prev) => prev.filter((id) => id !== courseId));
  };

  const clearAll = (): void => {
    setSelectedCourses([]);
  };

  const isSelected = (courseId: string): boolean => {
    return selectedCourses.includes(courseId);
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
