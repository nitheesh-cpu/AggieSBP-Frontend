import {
  COURSES_PER_SITEMAP,
  getCachedCourseIds,
  getCachedProfessorIds,
  PROFESSORS_PER_SITEMAP,
  sitemapIds,
} from '@/lib/sitemap-utils'
import { SITE_URL } from '@/lib/site-url'

// Rebuild daily, matching the child sitemaps
export const revalidate = 86400

// Sitemap index: Next.js has no built-in index for generateSitemaps(), so this
// lists the static-page sitemap plus every course/professor sitemap chunk.
export async function GET() {
  const [courseIds, professorIds] = await Promise.all([
    getCachedCourseIds(),
    getCachedProfessorIds(),
  ])

  const locs = [
    `${SITE_URL}/static/sitemap.xml`,
    ...sitemapIds(courseIds.length, COURSES_PER_SITEMAP).map(
      ({ id }) => `${SITE_URL}/courses/sitemap/${id}.xml`
    ),
    ...sitemapIds(professorIds.length, PROFESSORS_PER_SITEMAP).map(
      ({ id }) => `${SITE_URL}/professors/sitemap/${id}.xml`
    ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <sitemap>\n    <loc>${loc}</loc>\n  </sitemap>`).join('\n')}
</sitemapindex>
`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
