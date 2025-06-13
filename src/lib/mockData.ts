// Mock data for development when API server is not available
import { Department, DepartmentsInfo, Course } from "./api";

export const mockDepartmentsInfo: DepartmentsInfo = {
  summary: {
    total_departments: 127,
    total_courses: 4520,
    total_professors: 2840,
    overall_avg_gpa: 3.12,
    overall_avg_rating: 3.8,
    stem_departments: 45,
    liberal_arts_departments: 38,
  },
  top_departments_by_courses: [
    {
      code: "CSCE",
      name: "Computer Science & Engineering",
      courses: 180,
      professors: 95,
      avgGpa: 3.05,
      rating: 3.9,
    },
    {
      code: "MATH",
      name: "Mathematics",
      courses: 165,
      professors: 78,
      avgGpa: 2.95,
      rating: 3.6,
    },
    {
      code: "PHYS",
      name: "Physics & Astronomy",
      courses: 142,
      professors: 65,
      avgGpa: 3.15,
      rating: 3.7,
    },
  ],
  recent_semesters: [],
  data_sources: {
    gpa_data: "Texas A&M Registrar",
    reviews: "Student Submissions",
    course_catalog: "Official Catalog",
    last_updated: "2024-01-15",
  },
};

export const mockDepartments: Department[] = [
  {
    id: "1",
    code: "CSCE",
    name: "Computer Science & Engineering",
    category: "stem",
    courses: 180,
    professors: 95,
    avgGpa: 3.05,
    rating: 3.9,
    topCourses: ["CSCE 121", "CSCE 221", "CSCE 314"],
    description:
      "Department of Computer Science and Engineering offering comprehensive programs in computing and software engineering.",
  },
  {
    id: "2",
    code: "MATH",
    name: "Mathematics",
    category: "stem",
    courses: 165,
    professors: 78,
    avgGpa: 2.95,
    rating: 3.6,
    topCourses: ["MATH 151", "MATH 152", "MATH 251"],
    description:
      "Department of Mathematics providing foundational and advanced mathematical education.",
  },
  {
    id: "3",
    code: "ENGL",
    name: "English",
    category: "liberal-arts",
    courses: 145,
    professors: 65,
    avgGpa: 3.25,
    rating: 3.8,
    topCourses: ["ENGL 104", "ENGL 210", "ENGL 301"],
    description:
      "Department of English focusing on literature, writing, and communication skills.",
  },
  {
    id: "4",
    code: "BUAD",
    name: "Business Administration",
    category: "business",
    courses: 120,
    professors: 55,
    avgGpa: 3.35,
    rating: 3.7,
    topCourses: ["BUAD 301", "BUAD 302", "BUAD 401"],
    description:
      "Mays Business School offering comprehensive business education and leadership development.",
  },
  {
    id: "5",
    code: "AGRI",
    name: "Agriculture",
    category: "agriculture",
    courses: 98,
    professors: 42,
    avgGpa: 3.18,
    rating: 3.9,
    topCourses: ["AGRI 101", "AGRI 205", "AGRI 301"],
    description:
      "College of Agriculture and Life Sciences providing education in agricultural sciences and technology.",
  },
];

export const mockCourses: Course[] = [
  {
    id: "1",
    code: "CSCE 121",
    name: "Introduction to Program Design and Concepts",
    department: { id: "1", name: "Computer Science & Engineering" },
    credits: 4,
    avgGPA: 3.05,
    difficulty: "Moderate",
    enrollment: 450,
    sections: 8,
    rating: 3.8,
    description:
      "Introduction to programming using object-oriented techniques.",
    tags: ["Programming", "Object-Oriented", "C++"],
    sectionAttributes: ["Core Curriculum"],
  },
  {
    id: "2",
    code: "MATH 151",
    name: "Engineering Mathematics I",
    department: { id: "2", name: "Mathematics" },
    credits: 4,
    avgGPA: 2.85,
    difficulty: "Challenging",
    enrollment: 650,
    sections: 12,
    rating: 3.4,
    description: "Differential and integral calculus for engineering students.",
    tags: ["Calculus", "Engineering", "Mathematics"],
    sectionAttributes: ["Core Curriculum", "Math Requirement"],
  },
];

// Function to simulate API delay
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock API functions that mimic the real API
export const mockApi = {
  async getDepartments(): Promise<Department[]> {
    await delay(500); // Simulate network delay
    return mockDepartments;
  },

  async getDepartmentsInfo(): Promise<DepartmentsInfo> {
    await delay(300);
    return mockDepartmentsInfo;
  },

  async getCourses(): Promise<Course[]> {
    await delay(400);
    return mockCourses;
  },
};
