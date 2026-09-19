import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  CalendarDays,
  FlaskConical,
  LayoutDashboard,
  Newspaper,
  Route,
  Settings,
  Shield,
  Users,
} from "lucide-react";

export const PORTAL_BASE = "/portal";

export const portalRoutes = {
  dashboard: PORTAL_BASE,
  debriefed: `${PORTAL_BASE}/debriefed`,
  debriefedExplainers: `${PORTAL_BASE}/debriefed/explainers`,
  labs: `${PORTAL_BASE}/labs`,
  labsReview: `${PORTAL_BASE}/labs/review`,
  pathways: `${PORTAL_BASE}/pathways`,
  pathwaysStudios: `${PORTAL_BASE}/pathways/studios`,
  pathwaysEssays: `${PORTAL_BASE}/pathways/essays`,
  events: `${PORTAL_BASE}/events`,
  network: `${PORTAL_BASE}/network`,
  networkProfile: `${PORTAL_BASE}/network/profile`,
  settings: `${PORTAL_BASE}/settings`,
  saved: `${PORTAL_BASE}/saved`,
  admin: `${PORTAL_BASE}/admin`,
} as const;

export type PortalRouteKey = keyof typeof portalRoutes;

export interface PortalNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  description: string;
  adminOnly?: boolean;
  children?: { label: string; path: string }[];
}

export const portalNav: PortalNavItem[] = [
  {
    label: "Home",
    path: portalRoutes.dashboard,
    icon: LayoutDashboard,
    description: "Your next actions, progress, and activity",
  },
  {
    label: "Learn & read",
    path: portalRoutes.debriefed,
    icon: Newspaper,
    description: "Lessons, explainers, and Finance Debriefs",
    children: [
      { label: "Finance Debriefs", path: portalRoutes.debriefed },
      { label: "Explainers", path: portalRoutes.debriefedExplainers },
    ],
  },
  {
    label: "Research",
    path: portalRoutes.labs,
    icon: FlaskConical,
    description: "FinanceMeta Labs, projects, and applications",
    children: [
      { label: "Explore projects", path: portalRoutes.labs },
      { label: "Review workspace", path: portalRoutes.labsReview },
    ],
  },
  {
    label: "Opportunities",
    path: portalRoutes.pathways,
    icon: Route,
    description: "Industry projects, roles, and challenges",
    children: [
      { label: "Opportunity board", path: portalRoutes.pathways },
      { label: "Project studio", path: portalRoutes.pathwaysStudios },
      { label: "Writing challenges", path: portalRoutes.pathwaysEssays },
    ],
  },
  {
    label: "Events & clubs",
    path: portalRoutes.events,
    icon: CalendarDays,
    description: "School clubs, chapters, and events",
  },
  {
    label: "People",
    path: portalRoutes.network,
    icon: Users,
    description: "Members, collaborators, and introductions",
  },
  {
    label: "Saved",
    path: portalRoutes.saved,
    icon: Bookmark,
    description: "Bookmarked articles and lab projects",
  },
  {
    label: "Settings",
    path: portalRoutes.settings,
    icon: Settings,
    description: "Profile and account preferences",
  },
  {
    label: "Admin",
    path: portalRoutes.admin,
    icon: Shield,
    description: "Content management (admin only)",
    adminOnly: true,
  },
];
