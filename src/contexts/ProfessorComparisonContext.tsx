"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface ProfessorComparisonContextType {
  selectedProfessors: string[]; // professor IDs
  addProfessor: (professorId: string) => boolean;
  removeProfessor: (professorId: string) => void;
  isSelected: (professorId: string) => boolean;
  canAddMore: () => boolean;
  clearAll: () => void;
  maxProfessors: number;
}

const ProfessorComparisonContext = createContext<
  ProfessorComparisonContextType | undefined
>(undefined);

const MAX_PROFESSORS = 4;
const STORAGE_KEY = "aggie-rmp-professor-comparison";

export function ProfessorComparisonProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length <= MAX_PROFESSORS) {
          setSelectedProfessors(parsed);
        }
      } catch (error) {
        console.error(
          "Failed to parse stored professor comparison data:",
          error,
        );
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save to localStorage whenever selectedProfessors changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedProfessors));
  }, [selectedProfessors]);

  const addProfessor = (professorId: string): boolean => {
    if (
      selectedProfessors.length >= MAX_PROFESSORS ||
      selectedProfessors.includes(professorId)
    ) {
      return false;
    }
    setSelectedProfessors((prev) => [...prev, professorId]);
    return true;
  };

  const removeProfessor = (professorId: string) => {
    setSelectedProfessors((prev) => prev.filter((id) => id !== professorId));
  };

  const isSelected = (professorId: string) => {
    return selectedProfessors.includes(professorId);
  };

  const canAddMore = () => {
    return selectedProfessors.length < MAX_PROFESSORS;
  };

  const clearAll = () => {
    setSelectedProfessors([]);
  };

  return (
    <ProfessorComparisonContext.Provider
      value={{
        selectedProfessors,
        addProfessor,
        removeProfessor,
        isSelected,
        canAddMore,
        clearAll,
        maxProfessors: MAX_PROFESSORS,
      }}
    >
      {children}
    </ProfessorComparisonContext.Provider>
  );
}

export function useProfessorComparison() {
  const context = useContext(ProfessorComparisonContext);
  if (context === undefined) {
    throw new Error(
      "useProfessorComparison must be used within a ProfessorComparisonProvider",
    );
  }
  return context;
}
