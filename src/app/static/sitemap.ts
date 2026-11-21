import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'
import { getDepartmentsServer } from '@/lib/server-api'
import { publishedDepartments } from '@/lib/department-pages'
import { departmentCanonicalPath } from '@/lib/seo-metadata'

// Rebuild daily so new departments show up without a redeploy
export const revalidate = 86400

// Top-level pages and department pages. Course and professor pages live in
// /courses/sitemap/[id].xml and /professors/sitemap/[id].xml; /sitemap.xml is
// the index that lists all three.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/browse`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/departments`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/courses`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/professors`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/compare`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/discover/ucc`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Same rule as the pages themselves: only departments with course data.
  // If the API is down the static pages still ship.
  try {
    const departments = publishedDepartments(await getDepartmentsServer())
    for (const dept of departments) {
      pages.push({
        url: `${SITE_URL}${departmentCanonicalPath(dept.code)}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  } catch (error) {
    console.error('Error fetching departments for sitemap:', error)
  }

  return pages
}
