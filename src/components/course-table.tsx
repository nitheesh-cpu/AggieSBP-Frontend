import React from "react";
import Link from "next/link";
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
    course: "CSCE120",
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
    course: "BIOL213",
    avgGPA: "2.94",
    workload: "High",
    rating: "4.0/5",
  },
  {
    icon: "📚",
    course: "HIST201",
    avgGPA: "3.52",
    workload: "Light",
    rating: "4.6/5",
  },
];

export const CourseTable: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-semibold dark:text-white text-black mb-3 sm:mb-4">
            Compare courses before you enroll
          </h2>
          <p className="text-base sm:text-lg dark:text-gray-300 text-gray-700 mb-6 sm:mb-8">
            Credit hours, average GPA, and professor rating—all side by side.
          </p>

          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 md:p-8 max-w-full">
            {/* Mobile: Card Layout */}
            <div className="block sm:hidden space-y-3 mb-6">
              {courseData.slice(0, 6).map((course, index) => (
                <Link
                  key={index}
                  href={`/course/${course.course}`}
                  className="block"
                >
                  <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors duration-200 cursor-pointer border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{course.icon}</span>
                        <span className="dark:text-white text-black font-medium text-lg">
                          {course.course}
                        </span>
                      </div>
                      <div className="text-gray-400">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                        </svg>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-gray-400 text-xs mb-1">GPA</div>
                        <div className="dark:text-white text-black font-medium">
                          {course.avgGPA}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">
                          Workload
                        </div>
                        <div className="dark:text-white text-black font-medium">
                          {course.workload}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Rating</div>
                        <div className="dark:text-white text-black font-medium">
                          {course.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden sm:block">
              <div className="overflow-x-auto">
                <div className="space-y-1 mb-6 min-w-[600px]">
                  {courseData.map((course, index) => (
                    <Link
                      key={index}
                      href={`/course/${course.course}`}
                      className="block"
                    >
                      <div className="flex items-center py-3 px-4 rounded-md hover:bg-white/5 transition-colors duration-200 group cursor-pointer">
                        <div className="flex items-center flex-1 space-x-4">
                          <span className="text-xl w-8 flex justify-center">
                            {course.icon}
                          </span>
                          <span className="dark:text-white text-black font-medium min-w-[80px]">
                            {course.course}
                          </span>
                          <span className="dark:text-gray-300 text-gray-700 min-w-[60px]">
                            {course.avgGPA}
                          </span>
                          <span className="dark:text-gray-300 text-gray-700 min-w-[80px]">
                            {course.workload}
                          </span>
                          <span className="dark:text-gray-300 text-gray-700 flex-1">
                            {course.rating}
                          </span>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 dark:text-gray-400 text-gray-700 hover:text-white ml-4">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/courses">
              <Button variant="outline" className="mt-4 w-full sm:w-auto">
                Try a sample search
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
