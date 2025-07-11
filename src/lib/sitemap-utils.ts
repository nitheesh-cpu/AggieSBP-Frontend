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

// Utility to get the base URL with fallback
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Default fallback
  return 'https://aggiermp.com'
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