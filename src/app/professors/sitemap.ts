import { MetadataRoute } from 'next'
import { getCachedProfessorIds, getBaseUrl, logSitemapGeneration } from '@/lib/sitemap-utils'

const BASE_URL = getBaseUrl()

// Generate multiple sitemaps if we have too many professors
export async function generateSitemaps() {
  try {
    const professorIds = await getCachedProfessorIds()
    const PROFESSORS_PER_SITEMAP = 25000 // Half of Google's limit since we include both professor pages and review pages
    
    const sitemapCount = Math.ceil(professorIds.length / PROFESSORS_PER_SITEMAP)
    
    return Array.from({ length: sitemapCount }, (_, i) => ({
      id: i
    }))
  } catch (error) {
    console.error('Error generating professor sitemaps:', error)
    return [{ id: 0 }]
  }
}

export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  try {
    const professorIds = await getCachedProfessorIds()
    const PROFESSORS_PER_SITEMAP = 25000
    
    // Calculate pagination
    const start = id * PROFESSORS_PER_SITEMAP
    const end = start + PROFESSORS_PER_SITEMAP
    const paginatedProfessors = professorIds.slice(start, end)
    
    // Generate sitemap entries for this batch - both professor pages and review pages
    const professorPages: MetadataRoute.Sitemap = paginatedProfessors.map((professor) => ({
      url: `${BASE_URL}/professor/${professor.id}`,
      lastModified: professor.lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
    
    const reviewPages: MetadataRoute.Sitemap = paginatedProfessors.map((professor) => ({
      url: `${BASE_URL}/professor/${professor.id}/reviews`,
      lastModified: professor.lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
    
    const allPages = [...professorPages, ...reviewPages]
    
    logSitemapGeneration('professor', allPages.length, id)
    return allPages
    
  } catch (error) {
    console.error(`Error generating professor sitemap ${id}:`, error)
    return []
  }
} 