// Canonical public origin used for sitemaps, robots.txt and metadata URLs.
// Never derive this from VERCEL_URL: that is the per-deployment host
// (e.g. aggie-schedulebuilder-plus-<hash>.vercel.app), and Google rejects
// sitemap URLs that don't match the property's host.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://aggieschedulebuilderplus.vercel.app'
).replace(/\/+$/, '')
