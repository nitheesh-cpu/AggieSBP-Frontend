import NotFound from "@/app/not-found";
import { CourseMissingTracker } from "./course-missing-tracker";

// Rendered with a real 404 status when the API has no such course.
export default function CourseNotFound() {
  return (
    <>
      <CourseMissingTracker />
      <NotFound />
    </>
  );
}
