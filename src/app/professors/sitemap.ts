import { MetadataRoute } from 'next'
import { getCachedProfessorIds, logSitemapGeneration, PROFESSORS_PER_SITEMAP, sitemapIds } from '@/lib/sitemap-utils'
import { SITE_URL } from '@/lib/site-url'

// Rebuild daily so new professors show up without a redeploy
export const revalidate = 86400

// Generate multiple sitemaps if we have too many professors
export async function generateSitemaps() {
  const professorIds = await getCachedProfessorIds()
  return sitemapIds(professorIds.length, PROFESSORS_PER_SITEMAP)
}

export default async function sitemap(props: {
  id: Promise<string>
}): Promise<MetadataRoute.Sitemap> {
  // Next 16 passes the id as a Promise<string>
  const id = Number(await props.id)
  try {
    const professorIds = await getCachedProfessorIds()

    // Calculate pagination
    const start = id * PROFESSORS_PER_SITEMAP
    const end = start + PROFESSORS_PER_SITEMAP
    const paginatedProfessors = professorIds.slice(start, end)

    // Generate sitemap entries for this batch - both professor pages and review pages.
    // No lastModified: the API has no real per-professor update date, and a fake
    // "now" on every URL teaches Google to ignore lastmod.
    const professorPages: MetadataRoute.Sitemap = paginatedProfessors.map((professor) => ({
      url: `${SITE_URL}/professor/${professor.id}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const reviewPages: MetadataRoute.Sitemap = paginatedProfessors.map((professor) => ({
      url: `${SITE_URL}/professor/${professor.id}/reviews`,
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
