"use client";

import React from "react";

import { getCourseDetail, type CourseDetail } from "@/lib/api";

export const EXTENSIONS = {
  chrome: {
    browser: "chrome",
    label: "Add to Chrome",
    href: "https://chromewebstore.google.com/detail/aggiesb+-registration-ass/glckdcnecomhlmlegmjdceblibmaljpm",
  },
  firefox: {
    browser: "firefox",
    label: "Add to Firefox",
    href: "https://addons.mozilla.org/en-US/firefox/addon/aggie-schedule-builder-plus/",
  },
} as const;

export type ExtensionLink = (typeof EXTENSIONS)[keyof typeof EXTENSIONS];

function isFirefox() {
  return /Firefox|FxiOS/i.test(navigator.userAgent);
}

/**
 * Store link for the visitor's browser. Firefox gets the Firefox add-on;
 * Chrome and the other Chromium browsers (Edge, Brave, Opera, Arc) install
 * from the Chrome Web Store, and so does anything else as the safer default.
 *
 * Returns null until it has run in the browser: the server can't tell, and
 * guessing would flash "Add to Chrome" for Firefox users.
 */
export function useExtensionLink(): ExtensionLink | null {
  const [link, setLink] = React.useState<ExtensionLink | null>(null);
  React.useEffect(() => {
    setLink(isFirefox() ? EXTENSIONS.firefox : EXTENSIONS.chrome);
  }, []);
  return link;
}

export const EXAMPLE_COURSE_ID = "CSCE120";
let exampleCourse: Promise<CourseDetail> | undefined;

/**
 * CSCE 120 is the example course on the home page. The hero and the extension
 * preview both show it, so they share one request.
 */
export function useExampleCourse() {
  // undefined while loading, null if the request failed
  const [course, setCourse] = React.useState<CourseDetail | null>();
  React.useEffect(() => {
    let cancelled = false;
    exampleCourse ??= getCourseDetail(EXAMPLE_COURSE_ID);
    exampleCourse.then(
      (result) => {
        if (!cancelled) setCourse(result);
      },
      () => {
        exampleCourse = undefined;
        if (!cancelled) setCourse(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);
  return course;
}

/** Professors on a course with grade data, best-rated first. */
export function gradedProfessors(course: CourseDetail | null | undefined) {
  const graded = course?.professors?.filter((p) => p.gradeDistribution) ?? [];
  const rated = graded.filter((p) => p.overallRating != null);
  return rated.length >= 2 ? rated : graded;
}
