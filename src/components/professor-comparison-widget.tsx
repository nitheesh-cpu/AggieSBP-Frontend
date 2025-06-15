"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfessorComparison } from "@/contexts/ProfessorComparisonContext";
import { getProfessors, type Professor } from "@/lib/api";
import { X, Star, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ProfessorComparisonWidget() {
  const { selectedProfessors, removeProfessor, clearAll } =
    useProfessorComparison();
  const [professorData, setProfessorData] = useState<Professor[]>([]);

  // Load professor data when selected professors change
  useEffect(() => {
    const loadProfessorData = async () => {
      if (selectedProfessors.length > 0) {
        try {
          // Get all professors and filter for selected ones
          const allProfessors = await getProfessors({ limit: 1000 });
          const selectedData = allProfessors.filter((prof) =>
            selectedProfessors.includes(prof.id),
          );
          setProfessorData(selectedData);
        } catch (err) {
          console.error("Failed to load professor data for widget:", err);
        }
      } else {
        setProfessorData([]);
      }
    };

    loadProfessorData();
  }, [selectedProfessors]);

  if (selectedProfessors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-text-body" />
              <span className="font-medium text-text-heading">
                Comparing {selectedProfessors.length} Professor
                {selectedProfessors.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-2 max-w-2xl overflow-x-auto">
              {professorData.map((professor) => (
                <Card
                  key={professor.id}
                  className="flex items-center gap-2 px-3 py-2 bg-canvas border-border min-w-fit"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-[#500000] to-[#800000] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {professor.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-heading line-clamp-1">
                        {professor.name.split(" ").slice(-1)[0]}{" "}
                        {/* Show last name */}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-text-body">
                          {professor.overall_rating
                            ? professor.overall_rating.toFixed(1)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeProfessor(professor.id)}
                    className="p-1 h-auto text-text-body hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="text-text-body hover:text-red-500"
            >
              Clear All
            </Button>
            <Link href="/compare?tab=professors">
              <Button
                size="sm"
                className="bg-[#500000] hover:bg-[#600000] text-white flex items-center gap-2"
              >
                Compare Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
