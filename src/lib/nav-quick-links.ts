export type AppQuickLink = {
  name: string;
  href: string;
  /** Full-width primary tile (e.g. My alerts). */
  emphasis?: boolean;
};

/**
 * Same destinations for: mobile nav menu, PWA / standalone dashboard shortcuts.
 */
export const MOBILE_APP_QUICK_LINKS: AppQuickLink[] = [
  { name: "Seat Alerts", href: "/alerts", emphasis: true },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Departments", href: "/departments" },
  { name: "Courses", href: "/courses" },
  { name: "Professors", href: "/professors" },
  { name: "Fit My Schedule", href: "/discover/fit" },
  { name: "Core Curriculum", href: "/discover/ucc" },
  { name: "Explore Easy Courses", href: "/discover/dept" },
];
