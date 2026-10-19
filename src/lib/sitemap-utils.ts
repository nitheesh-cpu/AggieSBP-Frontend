import { unstable_cache } from 'next/cache'
import { getAllCourseIds, getAllProfessorIds, getAllDepartmentIds, getSitemapCounts } from './api'

// Cache sitemap data for better performance
export const getCachedCourseIds = unstable_cache(
  async () => getAllCourseIds(),
  ['sitemap-courses'],
  {
    revalidate: 3600, // Revalidate every hour
    tags: ['sitemap', 'courses']
  }
)

export const getCachedProfessorIds = unstable_cache(
  async () => getAllProfessorIds(),
  ['sitemap-professors'],
  {
    revalidate: 3600, // Revalidate every hour
    tags: ['sitemap', 'professors']
  }
)

export const getCachedDepartmentIds = unstable_cache(
  async () => getAllDepartmentIds(),
  ['sitemap-departments'],
  {
    revalidate: 3600, // Revalidate every hour
    tags: ['sitemap', 'departments']
  }
)

export const getCachedSitemapCounts = unstable_cache(
  async () => getSitemapCounts(),
  ['sitemap-counts'],
  {
    revalidate: 3600, // Revalidate every hour
    tags: ['sitemap']
  }
)

// Google allows 50,000 URLs per sitemap. Each professor yields two URLs
// (profile + reviews), so professors get half the budget per file.
export const COURSES_PER_SITEMAP = 50000
export const PROFESSORS_PER_SITEMAP = 25000

// Sitemap ids for `count` items; always at least one so /…/sitemap/0.xml exists.
export function sitemapIds(count: number, perSitemap: number): { id: number }[] {
  const sitemapCount = Math.max(1, Math.ceil(count / perSitemap))
  return Array.from({ length: sitemapCount }, (_, i) => ({ id: i }))
}

// Utility to determine if large sitemaps are needed
export async function shouldUseLargeSitemaps(): Promise<{
  courses: boolean
  professors: boolean
  totalSize: number
}> {
  try {
    const counts = await getCachedSitemapCounts()
    const LARGE_SITEMAP_THRESHOLD = 1000

    return {
      courses: counts.courses > LARGE_SITEMAP_THRESHOLD,
      professors: counts.professors > LARGE_SITEMAP_THRESHOLD,
      totalSize: counts.courses + counts.professors + counts.departments
    }
  } catch (error) {
    console.error('Error checking sitemap sizes:', error)
    return {
      courses: false,
      professors: false,
      totalSize: 0
    }
  }
}

// Utility to log sitemap generation info
export function logSitemapGeneration(type: string, count: number, sitemapId?: number) {
  const timestamp = new Date().toISOString()
  const message = sitemapId !== undefined
    ? `[${timestamp}] Generated ${type} sitemap ${sitemapId} with ${count} URLs`
    : `[${timestamp}] Generated ${type} sitemap with ${count} URLs`

  console.log(message)
} 