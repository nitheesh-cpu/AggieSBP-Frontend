import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * next/link with viewport prefetch off by default. Each prefetch is a billed
 * Vercel edge request, and list pages (a department page has ~150 course
 * links) fired 60+ of them per view (D-049). Pages still load on click; pass
 * prefetch explicitly to opt a link back in.
 */
export default function Link({ prefetch = false, ...props }: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={prefetch} {...props} />;
}
