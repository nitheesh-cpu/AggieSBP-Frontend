import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /_next/ is deliberately not blocked: Google needs the JS/CSS to render pages
      disallow: ['/api/', '/admin/'],
    },
    // /sitemap.xml is an index that points at the static, course and professor sitemaps
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
