import type { LucideIcon } from "lucide-react";
import {
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
    label: "Dashboard",
    path: portalRoutes.dashboard,
    icon: LayoutDashboard,
    description: "Overview of your Finance4All activity",
  },
  {
    label: "Debriefed",
    path: portalRoutes.debriefed,
    icon: Newspaper,
    description: "News feed, explainers, and weekly digest",
    children: [
      { label: "News Feed", path: portalRoutes.debriefed },
      { label: "Explainers", path: portalRoutes.debriefedExplainers },
    ],
  },
  {
    label: "Meta Labs",
    path: portalRoutes.labs,
    icon: FlaskConical,
    description: "Research projects and applications",
    children: [
      { label: "Projects", path: portalRoutes.labs },
      { label: "Reviewer Dashboard", path: portalRoutes.labsReview },
    ],
  },
  {
    label: "Pathways",
    path: portalRoutes.pathways,
    icon: Route,
    description: "Opportunities, studios, and essay challenges",
    children: [
      { label: "Opportunity Board", path: portalRoutes.pathways },
      { label: "Studios", path: portalRoutes.pathwaysStudios },
      { label: "Essays", path: portalRoutes.pathwaysEssays },
    ],
  },
  {
    label: "Events",
    path: portalRoutes.events,
    icon: CalendarDays,
    description: "Chapters, local events, and registration",
  },
  {
    label: "Network",
    path: portalRoutes.network,
    icon: Users,
    description: "Profiles, connections, and introductions",
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
