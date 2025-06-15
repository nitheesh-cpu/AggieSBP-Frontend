const API_BASE_URL = "https://api-aggiesbp.servehttp.com";
// const API_BASE_URL = "http://localhost:8000";

// Development mode - set to true to use mock data
// const USE_MOCK_DATA = false; // Set to true if you want to use mock data

export interface Department {
  id: string;
  code: string;
  name: string;
  category: "stem" | "liberal-arts" | "business" | "agriculture";
  courses: number;
  professors: number;
  avgGpa: number;
  rating: number;
  topCourses: string[];
  description: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: {
    id: string;
    name: string;
  };
  credits: number;
  avgGPA: number;
  difficulty: string;
  enrollment: number;
  sections: number;
  rating: number;
  description: string;
  tags: string[];
  sectionAttributes: string[];
}

export interface CourseDetail {
  code: string;
  name: string;
  description: string;
  credits: number;
  avgGPA: number;
  difficulty: string;
  enrollment?: number;
  sections?: number;
  rating?: number;
  professors?: Array<{
    id: string;
    name: string;
    rating: number;
    reviews: number;
    gradeDistribution?: {
      A: number;
      B: number;
      C: number;
      D: number;
      F: number;
    };
    teachingStyle?: string;
    description?: string;
    tag_frequencies?: { [tag: string]: number }; // Dictionary of tags and their frequencies
  }>;
  prerequisites?: string[];
  relatedCourses?: Array<{
    code: string;
    name: string;
    similarity: number;
  }>;
  sectionAttributes?: string[];
}

export interface Review {
  id: string;
  clarity_rating: number;
  difficulty_rating: number;
  helpful_rating: number;
  overall_rating: number;
  would_take_again: boolean;
  grade: string;
  review_text: string;
  review_date: string;
  tags: string[];
  thumbs_up: number;
  thumbs_down: number;
  attendance_mandatory: string;
  textbook_use: string;
}

export interface CourseReviews {
  course: {
    id: string;
    code: string;
    name: string;
  };
  professor: {
    id: string;
    name: string;
  };
  summary: {
    total_reviews: number;
    avg_clarity: number;
    avg_difficulty: number;
    avg_helpfulness: number;
    avg_overall: number;
    would_take_again_percent: number;
  };
  reviews: Review[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    has_more: boolean;
  };
}

export interface DepartmentsInfo {
  summary: {
    total_departments: number;
    total_courses: number;
    total_professors: number;
    overall_avg_gpa: number;
    overall_avg_rating: number;
    stem_departments: number;
    liberal_arts_departments: number;
  };
  top_departments_by_courses: Array<{
    code: string;
    name: string;
    courses: number;
    professors: number;
    avgGpa: number;
    rating: number;
  }>;
  recent_semesters: Array<{
    year: string;
    semester: string;
    departments: number;
    courses: number;
    professors: number;
    enrollment: number;
  }>;
  data_sources: {
    gpa_data: string;
    reviews: string;
    course_catalog: string;
    last_updated: string;
  };
}

export interface Professor {
  id: string;
  name: string;
  overall_rating: number;
  total_reviews: number;
  would_take_again_percent: number;
  departments: string[];
  courses_taught: string[];
}

export interface ProfessorDetail {
  id: string;
  name: string;
  overall_rating: number;
  total_reviews: number;
  would_take_again_percent: number;
  departments: string[];
  courses: Array<{
    course_id: string;
    course_name: string;
    reviews_count: number;
    avg_rating: number;
  }>;
  recent_reviews?: Review[];
  tag_frequencies?: { [tag: string]: number }; // Dictionary of tags and their frequencies
}

export interface ProfessorReviews {
  professor: {
    id: string;
    name: string;
  };
  summary: {
    total_reviews: number;
    avg_clarity: number;
    avg_difficulty: number;
    avg_helpfulness: number;
    avg_overall: number;
    would_take_again_percent: number;
  };
  reviews: Array<
    Review & {
      course: {
        id: string;
        code: string;
        name: string;
      };
    }
  >;
  pagination: {
    total: number;
    limit: number;
    skip: number;
    has_more: boolean;
  };
}

export interface CoursesParams {
  department?: string;
  limit?: number;
  skip?: number;
  search?: string;
  difficulty?: string;
  min_gpa?: number;
  max_gpa?: number;
  min_rating?: number;
  max_rating?: number;
}

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "An error occurred" }));
    throw new Error(
      errorData.detail || `HTTP error! status: ${response.status}`,
    );
  }
  return response.json();
}

// Departments API
export async function getDepartments(params?: {
  search?: string;
  limit?: number;
  skip?: number;
}): Promise<Department[]> {
  const url = new URL(`${API_BASE_URL}/departments`);

  if (params?.search) url.searchParams.append("search", params.search);
  if (params?.limit) url.searchParams.append("limit", params.limit.toString());
  if (params?.skip) url.searchParams.append("skip", params.skip.toString());

  const response = await fetch(url.toString());
  return handleResponse<Department[]>(response);
}

// Departments Info API
export async function getDepartmentsInfo(): Promise<DepartmentsInfo> {
  const response = await fetch(`${API_BASE_URL}/departments_info`);
  return handleResponse<DepartmentsInfo>(response);
}

// Courses API
export async function getCourses(
  params: CoursesParams = {},
): Promise<Course[]> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString());
    }
  });

  const url = `${API_BASE_URL}/courses${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch courses: ${response.statusText}`);
  }

  return handleResponse<Course[]>(response);
}

// Course Detail API
export async function getCourseDetail(courseId: string): Promise<CourseDetail> {
  const response = await fetch(`${API_BASE_URL}/course/${courseId}`);
  return handleResponse<CourseDetail>(response);
}

// Course Reviews API
export async function getCourseReviews(
  courseId: string,
  professorId: string,
  params?: {
    limit?: number;
    skip?: number;
  },
): Promise<CourseReviews> {
  const url = new URL(
    `${API_BASE_URL}/course/${courseId}/reviews/${professorId}`,
  );

  if (params?.limit) url.searchParams.append("limit", params.limit.toString());
  if (params?.skip) url.searchParams.append("skip", params.skip.toString());

  const response = await fetch(url.toString());
  return handleResponse<CourseReviews>(response);
}

// Health Check API
export async function getHealthCheck(): Promise<{
  status: string;
  database: unknown;
  api_version: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add timeout for health check
    });

    if (!response.ok) {
      throw new Error(
        `Health check failed: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Health check failed:", error);
    throw new Error(`API server is not reachable at ${API_BASE_URL}`);
  }
}

// Course Comparison API
export async function compareCourses(
  courseIds: string[],
): Promise<CourseDetail[]> {
  if (courseIds.length === 0) {
    return [];
  }

  const params = new URLSearchParams();
  params.append("ids", courseIds.join(","));

  const response = await fetch(`${API_BASE_URL}/courses/compare?${params}`);
  return handleResponse<CourseDetail[]>(response);
}

export async function compareProfessors(
  professorIds: string[],
): Promise<ProfessorDetail[]> {
  if (professorIds.length === 0) {
    return [];
  }

  const params = new URLSearchParams();
  params.append("ids", professorIds.join(","));

  const response = await fetch(`${API_BASE_URL}/professors/compare?${params}`);
  return handleResponse<ProfessorDetail[]>(response);
}

// Professors API
export async function getProfessors(params?: {
  search?: string;
  department?: string;
  min_rating?: number;
  limit?: number;
  skip?: number;
}): Promise<Professor[]> {
  const url = new URL(`${API_BASE_URL}/professors`);

  if (params?.search) url.searchParams.append("search", params.search);
  if (params?.department)
    url.searchParams.append("department", params.department);
  if (params?.min_rating)
    url.searchParams.append("min_rating", params.min_rating.toString());
  if (params?.limit) url.searchParams.append("limit", params.limit.toString());
  if (params?.skip) url.searchParams.append("skip", params.skip.toString());

  const response = await fetch(url.toString());
  return handleResponse<Professor[]>(response);
}

// Professor Detail API
export async function getProfessor(
  professorId: string,
): Promise<ProfessorDetail> {
  try {
    console.log(
      "Fetching professor from URL:",
      `${API_BASE_URL}/professor/${professorId}`,
    );
    const response = await fetch(`${API_BASE_URL}/professor/${professorId}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Professor API error:",
        response.status,
        response.statusText,
        errorText,
      );
      throw new Error(
        `Failed to fetch professor: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    console.log("Professor response:", data);

    // Validate response structure
    if (!data || !data.id || !data.name) {
      console.error("Invalid professor response structure:", data);
      throw new Error("Invalid response format from professor API");
    }

    return data;
  } catch (error) {
    console.error("Error in getProfessor:", error);
    throw error;
  }
}

// Professor Reviews API
export async function getProfessorReviews(
  professorId: string,
  params?: {
    course_filter?: string;
    limit?: number;
    skip?: number;
    sort_by?: "date" | "rating" | "course";
    min_rating?: number;
    max_rating?: number;
  },
): Promise<ProfessorReviews> {
  try {
    const url = new URL(`${API_BASE_URL}/professor/${professorId}/reviews`);

    if (params?.course_filter)
      url.searchParams.append("course_filter", params.course_filter);
    if (params?.limit)
      url.searchParams.append("limit", params.limit.toString());
    if (params?.skip) url.searchParams.append("skip", params.skip.toString());
    if (params?.sort_by) url.searchParams.append("sort_by", params.sort_by);
    if (params?.min_rating)
      url.searchParams.append("min_rating", params.min_rating.toString());
    if (params?.max_rating)
      url.searchParams.append("max_rating", params.max_rating.toString());

    console.log("Fetching professor reviews from URL:", url.toString());
    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Professor reviews API error:",
        response.status,
        response.statusText,
        errorText,
      );
      throw new Error(
        `Failed to fetch professor reviews: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    console.log("Raw professor reviews response type:", typeof data);
    console.log("Raw professor reviews response isArray:", Array.isArray(data));
    console.log(
      "Raw professor reviews response sample:",
      data.length ? data.slice(0, 2) : data,
    );

    // If API returns array format, convert to expected structure
    if (Array.isArray(data)) {
      console.log("Converting array response to ProfessorReviews structure");

      const reviews = data.map((review: Record<string, unknown>) => {
        // Map the actual API fields to the expected structure
        return {
          id: review.id,
          clarity_rating: review.clarity_rating,
          difficulty_rating: review.difficulty_rating,
          helpful_rating: review.helpful_rating,
          overall_rating: review.overall_rating,
          would_take_again: review.would_take_again,
          grade: review.grade,
          review_text: review.review_text,
          review_date: review.review_date,
          tags: review.tags || [],
          thumbs_up: review.thumbs_up,
          thumbs_down: review.thumbs_down,
          attendance_mandatory: review.attendance_mandatory,
          textbook_use: review.textbook_use,
          // Create the course object from the API fields
          course: {
            id: review.course_code, // Using course_code as ID since there's no separate ID
            code: review.course_code,
            name: review.course_name,
          },
        };
      });

      // Calculate summary statistics
      const totalReviews = reviews.length;
      const avgOverall =
        totalReviews > 0
          ? reviews.reduce(
              (sum, r) => sum + ((r.overall_rating as number) || 0),
              0,
            ) / totalReviews
          : 0;
      const avgClarity =
        totalReviews > 0
          ? reviews.reduce(
              (sum, r) => sum + ((r.clarity_rating as number) || 0),
              0,
            ) / totalReviews
          : 0;
      const avgDifficulty =
        totalReviews > 0
          ? reviews.reduce(
              (sum, r) => sum + ((r.difficulty_rating as number) || 0),
              0,
            ) / totalReviews
          : 0;
      const avgHelpfulness =
        totalReviews > 0
          ? reviews.reduce(
              (sum, r) => sum + ((r.helpful_rating as number) || 0),
              0,
            ) / totalReviews
          : 0;
      const wouldTakeAgainCount = reviews.filter(
        (r) => r.would_take_again === true,
      ).length;
      const wouldTakeAgainPercent =
        totalReviews > 0 ? (wouldTakeAgainCount / totalReviews) * 100 : 0;

      const result: ProfessorReviews = {
        professor: {
          id: professorId,
          name: "Loading...", // Will be filled by the professor detail call
        },
        summary: {
          total_reviews: totalReviews,
          avg_clarity: avgClarity,
          avg_difficulty: avgDifficulty,
          avg_helpfulness: avgHelpfulness,
          avg_overall: avgOverall,
          would_take_again_percent: wouldTakeAgainPercent,
        },
        reviews: reviews as unknown as ProfessorReviews["reviews"],
        pagination: {
          total: totalReviews,
          limit: params?.limit || 50,
          skip: params?.skip || 0,
          has_more: false, // We don't have pagination info from array response
        },
      };

      console.log("Converted ProfessorReviews result:", result);
      return result;
    }

    // If API returns object format, validate and return
    if (
      data &&
      typeof data === "object" &&
      data.reviews &&
      Array.isArray(data.reviews)
    ) {
      console.log("API returned expected object structure");
      return data as ProfessorReviews;
    }

    // Unexpected format
    console.error("Unexpected professor reviews response format:", data);
    throw new Error("API returned unexpected response format");
  } catch (error) {
    console.error("Error in getProfessorReviews:", error);
    throw error;
  }
}

// Professor Search API
export async function searchProfessors(params: {
  name?: string;
  department?: string;
  min_rating?: number;
  courses_taught?: string;
  limit?: number;
  skip?: number;
}): Promise<Professor[]> {
  const url = new URL(`${API_BASE_URL}/professors/search`);

  if (params.name) url.searchParams.append("name", params.name);
  if (params.department)
    url.searchParams.append("department", params.department);
  if (params.min_rating)
    url.searchParams.append("min_rating", params.min_rating.toString());
  if (params.courses_taught)
    url.searchParams.append("courses_taught", params.courses_taught);
  if (params.limit) url.searchParams.append("limit", params.limit.toString());
  if (params.skip) url.searchParams.append("skip", params.skip.toString());

  const response = await fetch(url.toString());
  return handleResponse<Professor[]>(response);
}
