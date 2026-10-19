import { MetadataRoute } from 'next'
import { COURSES_PER_SITEMAP, getCachedCourseIds, logSitemapGeneration, sitemapIds } from '@/lib/sitemap-utils'
import { SITE_URL } from '@/lib/site-url'

// Rebuild daily so new courses show up without a redeploy
export const revalidate = 86400

// Generate multiple sitemaps if we have too many courses
export async function generateSitemaps() {
  const courseIds = await getCachedCourseIds()
  return sitemapIds(courseIds.length, COURSES_PER_SITEMAP)
}

export default async function sitemap(props: {
  id: Promise<string>
}): Promise<MetadataRoute.Sitemap> {
  // Next 16 passes the id as a Promise<string>
  const id = Number(await props.id)
  try {
    const courseIds = await getCachedCourseIds()

    // Calculate pagination
    const start = id * COURSES_PER_SITEMAP
    const end = start + COURSES_PER_SITEMAP
    const paginatedCourses = courseIds.slice(start, end)

    // Generate sitemap entries for this batch (no lastModified: the API has no
    // real per-course update date)
    const sitemapEntries: MetadataRoute.Sitemap = paginatedCourses.map((course) => ({
      url: `${SITE_URL}/course/${course.id}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    logSitemapGeneration('course', sitemapEntries.length, id)
    return sitemapEntries

  } catch (error) {
    console.error(`Error generating course sitemap ${id}:`, error)
    return []
  }
}
