import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

// Crawlers that take pages for AI training or SEO tools and send no visitors
// back. meta-externalagent alone was over half of all CDN requests; after it
// stopped, Amazonbot and meta-webindexer were about half (D-028).
// Google-Extended and Applebot-Extended only opt out of AI training; normal
// Google and Apple search crawling (Googlebot, Applebot) is unaffected.
const BLOCKED_BOTS = [
  'meta-externalagent',
  'meta-webindexer',
  'Amazonbot',
  'SERankingBacklinksBot',
  'SemrushBot',
  'CCBot',
  'GPTBot',
  'ClaudeBot',
  'Bytespider',
  'Google-Extended',
  'Applebot-Extended',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: BLOCKED_BOTS, disallow: '/' },
      {
        userAgent: '*',
        allow: '/',
        // /_next/ is deliberately not blocked: Google needs the JS/CSS to render pages
        disallow: ['/api/', '/admin/'],
      },
    ],
    // /sitemap.xml is an index that points at the static, course and professor sitemaps
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
