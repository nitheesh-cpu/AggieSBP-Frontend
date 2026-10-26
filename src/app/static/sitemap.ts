import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

// Top-level pages. Course and professor pages live in /courses/sitemap/[id].xml
// and /professors/sitemap/[id].xml; /sitemap.xml is the index that lists all three.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
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
}
