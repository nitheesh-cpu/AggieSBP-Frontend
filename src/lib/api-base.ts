/**
 * Base URL for API calls.
 *
 * In the browser this is always the public API. On the server it is
 * API_INTERNAL_URL when set: the site and the API run on the same VM, so
 * server rendering calls the API over localhost instead of going out through
 * Cloudflare and back (D-051). API_INTERNAL_URL has no NEXT_PUBLIC_ prefix,
 * so Next never puts it in the browser bundle.
 *
 * Never pass this value to the browser (props, links, JSON): on the server it
 * can be a localhost address.
 */
export const PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000";

export const API_BASE_URL =
  (typeof window === "undefined" && process.env.API_INTERNAL_URL?.trim()) ||
  PUBLIC_API_BASE_URL;
