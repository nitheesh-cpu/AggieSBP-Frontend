import { MetadataRoute } from 'next'
import { getCachedCourseIds, getBaseUrl, logSitemapGeneration } from '@/lib/sitemap-utils'

const BASE_URL = getBaseUrl()

// Generate multiple sitemaps if we have too many courses
export async function generateSitemaps() {
  try {
    const courseIds = await getCachedCourseIds()
    const COURSES_PER_SITEMAP = 50000 // Google's limit per sitemap
    
    const sitemapCount = Math.ceil(courseIds.length / COURSES_PER_SITEMAP)
    
    return Array.from({ length: sitemapCount }, (_, i) => ({
      id: i
    }))
  } catch (error) {
    console.error('Error generating course sitemaps:', error)
    return [{ id: 0 }]
  }
}

export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  try {
    const courseIds = await getCachedCourseIds()
    const COURSES_PER_SITEMAP = 50000
    
    // Calculate pagination
    const start = id * COURSES_PER_SITEMAP
    const end = start + COURSES_PER_SITEMAP
    const paginatedCourses = courseIds.slice(start, end)
    
    // Generate sitemap entries for this batch
    const sitemapEntries: MetadataRoute.Sitemap = paginatedCourses.map((course) => ({
      url: `${BASE_URL}/course/${course.id}`,
      lastModified: course.lastModified,
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