import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bookmark,
  BookOpen,
  CalendarDays,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Library,
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
  pathwaysOpportunities: `${PORTAL_BASE}/pathways/opportunities`,
  pathwaysStudios: `${PORTAL_BASE}/pathways/studios`,
  pathwaysEssays: `${PORTAL_BASE}/pathways/essays`,
  events: `${PORTAL_BASE}/events`,
  network: `${PORTAL_BASE}/network`,
  networkProfile: `${PORTAL_BASE}/network/profile`,
  memberProfile: (id: string) => `${PORTAL_BASE}/network/profile/${id}`,
  settings: `${PORTAL_BASE}/settings`,
  saved: `${PORTAL_BASE}/saved`,
  activity: `${PORTAL_BASE}/activity`,
  education: `${PORTAL_BASE}/education`,
  resources: `${PORTAL_BASE}/resources`,
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
    description: "Your briefing, activity, and module shortcuts",
  },
  {
    label: "Debriefed",
    path: portalRoutes.debriefed,
    icon: Newspaper,
    description: "Curated news, explainers, and digest settings",
    children: [
      { label: "News Feed", path: portalRoutes.debriefed },
      { label: "Explainers", path: portalRoutes.debriefedExplainers },
    ],
  },
  {
    label: "Meta Labs",
    path: portalRoutes.labs,
    icon: FlaskConical,
    description: "Open research roles — each listing names a lead and deliverables",
    children: [
      { label: "Projects", path: portalRoutes.labs },
      { label: "Reviewer Dashboard", path: portalRoutes.labsReview },
    ],
  },
  {
    label: "Opportunities",
    path: portalRoutes.pathways,
    icon: Route,
    description: "Internships, studio projects, and essay challenges",
    children: [
      { label: "Overview", path: portalRoutes.pathways },
      { label: "Opportunity Board", path: portalRoutes.pathwaysOpportunities },
      { label: "Studios", path: portalRoutes.pathwaysStudios },
      { label: "Essays", path: portalRoutes.pathwaysEssays },
    ],
  },
  {
    label: "Events & Chapters",
    path: portalRoutes.events,
    icon: CalendarDays,
    description: "Chapter meetups, workshops, and registration",
  },
  {
    label: "Network",
    path: portalRoutes.network,
    icon: Users,
    description: "Member profiles, connections, and introductions",
  },
  {
    label: "Learn",
    path: portalRoutes.education,
    icon: GraduationCap,
    description: "Catalyst curriculum, lessons, and glossary",
  },
  {
    label: "Resources",
    path: portalRoutes.resources,
    icon: Library,
    description: "Facilitator guides, journal standards, and club toolkits",
  },
  {
    label: "Saved",
    path: portalRoutes.saved,
    icon: Bookmark,
    description: "Bookmarked articles, labs, and opportunities",
  },
  {
    label: "Activity",
    path: portalRoutes.activity,
    icon: Activity,
    description: "Saves, applications, connections, and RSVPs",
  },
  {
    label: "Profile",
    path: portalRoutes.settings,
    icon: Settings,
    description: "Profile, interests, and notification preferences",
  },
  {
    label: "Admin",
    path: portalRoutes.admin,
    icon: Shield,
    description: "Content management (admin only)",
    adminOnly: true,
  },
];
