import { SITE_URL } from "@/lib/site-url";

// /llms.txt: a short Markdown guide for AI agents that fetch pages for a user
// (llmstxt.org). It is a separate URL on purpose: serving Markdown from the
// page URLs by Accept header would mix the two in the Cloudflare cache, which
// keys on the URL only (D-050). Crawler access is set in robots.ts (D-028,
// D-055). Keep claims to what the site states elsewhere (privacy page data
// sources).
export const dynamic = "force-static";

const body = `# AggieSB+ (Aggie Schedule Builder Plus)

> Unofficial, student-built companion to Texas A&M University's Aggie Schedule Builder: grade distributions, professor ratings and reviews, and seat alerts for full classes. Not affiliated with Texas A&M University or RateMyProfessors.

Data sources: grade distributions come from public Texas A&M grade data (via anex.us), professor ratings and reviews come from RateMyProfessors, and course and section information comes from the public Texas A&M catalog and class schedule. Review summaries on professor pages are AI-generated from those reviews. Missing data is shown as missing, never estimated.

## Courses

- [Course search](${SITE_URL}/courses): find a course by code or name.
- Course pages: ${SITE_URL}/course/{SUBJECT}{NUMBER}, for example [CSCE 121](${SITE_URL}/course/CSCE121). Each shows the catalog description, prerequisites, average GPA and grade distribution by professor, and professor ratings for that course.
- [Departments](${SITE_URL}/departments): every department with course data, for example [MATH](${SITE_URL}/departments/MATH).
- [Browse by department](${SITE_URL}/browse): departments with grade data.
- [University Core Curriculum](${SITE_URL}/discover/ucc): core curriculum courses compared by grades and ratings.

## Professors

- [Professor search](${SITE_URL}/professors): find a professor by name.
- Professor pages: ${SITE_URL}/professor/{id}, linked from course pages and search. Each shows the RateMyProfessors rating, recent reviews, a review summary, and official grade data per course.
- [Compare](${SITE_URL}/compare): compare courses or professors side by side.

## Planning

- [Fit My Schedule](${SITE_URL}/discover/fit): find course sections that fit around existing time blocks.
- [Schedule Builder](${SITE_URL}/planner): a quick supplemental tool for planning a term's schedule.
- [Seat alerts](${SITE_URL}/alerts): get notified when a full class section has an open seat (sign-in required).

## About

- [About](${SITE_URL}/about)
- [Privacy](${SITE_URL}/privacy): what data the site and browser extension collect, and the data sources.
- [Terms](${SITE_URL}/terms)
- [Sitemap](${SITE_URL}/sitemap.xml): every course and professor page.
`;

export function GET() {
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
