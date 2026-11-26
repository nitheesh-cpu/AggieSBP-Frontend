import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

// Crawlers for products students don't use to find classes, and SEO tools.
// They send no visitors back. meta-externalagent alone was over half of all
// CDN requests; after it stopped, Amazonbot and meta-webindexer were about
// half (D-028).
// Training crawlers for the assistants students do ask (GPTBot, ClaudeBot,
// Google-Extended, Applebot-Extended, CCBot) are allowed since the move off
// Vercel's CDN quota, so those models can learn the site exists (D-055).
// Search and on-demand bots (OAI-SearchBot, ChatGPT-User, PerplexityBot,
// Claude-User, Googlebot) were never blocked.
const BLOCKED_BOTS = [
  'meta-externalagent',
  'meta-webindexer',
  'Amazonbot',
  'SERankingBacklinksBot',
  'SemrushBot',
  'Bytespider',
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
