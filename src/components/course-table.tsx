import React from "react";
import { Button } from "./ui/button";

interface CourseRow {
  icon: string;
  course: string;
  avgGPA: string;
  workload: string;
  rating: string;
}

const courseData: CourseRow[] = [
  {
    icon: "💻",
    course: "CSCE121",
    avgGPA: "3.18",
    workload: "Medium",
    rating: "4.6/5",
  },
  {
    icon: "⚡",
    course: "ECEN248",
    avgGPA: "2.95",
    workload: "High",
    rating: "4.2/5",
  },
  {
    icon: "📐",
    course: "MATH251",
    avgGPA: "2.87",
    workload: "High",
    rating: "3.9/5",
  },
  {
    icon: "⚙️",
    course: "ENGR102",
    avgGPA: "3.45",
    workload: "Light",
    rating: "4.8/5",
  },
  {
    icon: "🧬",
    course: "BIOL111",
    avgGPA: "3.22",
    workload: "Medium",
    rating: "4.4/5",
  },
  {
    icon: "📚",
    course: "HIST105",
    avgGPA: "3.67",
    workload: "Light",
    rating: "4.7/5",
  },
  {
    icon: "💻",
    course: "CSCE314",
    avgGPA: "3.05",
    workload: "High",
    rating: "4.1/5",
  },
  {
    icon: "⚡",
    course: "ECEN303",
    avgGPA: "2.78",
    workload: "High",
    rating: "3.8/5",
  },
  {
    icon: "📐",
    course: "MATH308",
    avgGPA: "3.12",
    workload: "Medium",
    rating: "4.3/5",
  },
  {
    icon: "⚙️",
    course: "ENGR216",
    avgGPA: "3.38",
    workload: "Medium",
    rating: "4.5/5",
  },
  {
    icon: "🧬",
    course: "BIOL212",
    avgGPA: "2.94",
    workload: "High",
    rating: "4.0/5",
  },
  {
    icon: "📚",
    course: "HIST202",
    avgGPA: "3.52",
    workload: "Light",
    rating: "4.6/5",
  },
];

export const CourseTable: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Compare courses before you enroll
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Credit hours, average GPA, and professor rating—all side by side.
          </p>

          <div className="bg-card border border-border rounded-lg p-8 max-w-[740px]">
            <div className="space-y-1 mb-6">
              {courseData.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center py-3 px-4 rounded-md hover:bg-white/5 transition-colors duration-200 group cursor-pointer"
                >
                  <div className="flex items-center flex-1 space-x-4">
                    <span className="text-xl w-8 flex justify-center">
                      {course.icon}
                    </span>
                    <span className="text-white font-medium min-w-[80px]">
                      {course.course}
                    </span>
                    <span className="text-gray-300 min-w-[60px]">
                      {course.avgGPA}
                    </span>
                    <span className="text-gray-300 min-w-[80px]">
                      {course.workload}
                    </span>
                    <span className="text-gray-300 flex-1">
                      {course.rating}
                    </span>
                  </div>

                  <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-white ml-4">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <Button variant="outline" className="mt-4">
              Try a sample search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
