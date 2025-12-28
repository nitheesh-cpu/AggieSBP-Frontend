import { MetadataRoute } from 'next'
import { getCachedCourseIds, getCachedProfessorIds, logSitemapGeneration } from '@/lib/sitemap-utils'

const BASE_URL = "https://aggieschedulebuilderplus.vercel.app"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/departments`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/courses`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/courses/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/professors`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/compare`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/discover/ucc`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  try {
    // Fetch dynamic content IDs (cached)
    const [courseIds, professorIds] = await Promise.all([
      getCachedCourseIds(),
      getCachedProfessorIds(),
    ])

    // Generate dynamic pages
    const coursePages: MetadataRoute.Sitemap = courseIds.map((course) => ({
      url: `${BASE_URL}/course/${course.id}`,
      lastModified: course.lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const professorPages: MetadataRoute.Sitemap = professorIds.map((professor) => ({
      url: `${BASE_URL}/professor/${professor.id}`,
      lastModified: professor.lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const professorReviewPages: MetadataRoute.Sitemap = professorIds.map((professor) => ({
      url: `${BASE_URL}/professor/${professor.id}/reviews`,
      lastModified: professor.lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Combine all pages
    const allPages = [
      ...staticPages,
      ...coursePages.slice(0, 1000), // Limit to prevent overly large sitemaps
      ...professorPages.slice(0, 1000),
      ...professorReviewPages.slice(0, 1000),
    ]

    logSitemapGeneration('main', allPages.length)
    return allPages

  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages if dynamic content fails
    return staticPages
  }
} 