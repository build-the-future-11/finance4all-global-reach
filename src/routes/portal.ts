import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  CalendarDays,
  FlaskConical,
  LayoutDashboard,
  Route,
  Settings,
  Shield,
} from "lucide-react";

export const PORTAL_BASE = "/portal";

export const portalRoutes = {
  dashboard: PORTAL_BASE,
  collaboration: `${PORTAL_BASE}/collaboration`,
  learning: `${PORTAL_BASE}/learning`,
  myResearch: `${PORTAL_BASE}/my-research`,
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
  apply: `${PORTAL_BASE}/apply`,
  intakeReview: `${PORTAL_BASE}/intake-review`,
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
  { label: "Home", path: portalRoutes.dashboard, icon: LayoutDashboard, description: "Your work and next commitments" },
  { label: "Learning", path: portalRoutes.learning, icon: Route, description: "Reading progress and private notes" },
  { label: "Collaboration", path: portalRoutes.collaboration, icon: FlaskConical, description: "Invitations, tasks and milestones" },
  { label: "My Research", path: portalRoutes.myResearch, icon: FlaskConical, description: "Projects you lead or have joined" },
  { label: "Projects", path: portalRoutes.labs, icon: FlaskConical, description: "Research questions and applications", children: [
    { label: "Explore projects", path: portalRoutes.labs }, { label: "Review workspace", path: portalRoutes.labsReview },
  ] },
  { label: "Programs", path: portalRoutes.pathways, icon: Route, description: "Programs, project opportunities and challenges", children: [
    { label: "Opportunity board", path: portalRoutes.pathways }, { label: "Project studio", path: portalRoutes.pathwaysStudios }, { label: "Writing challenges", path: portalRoutes.pathwaysEssays },
  ] },
  { label: "Applications", path: portalRoutes.apply, icon: FlaskConical, description: "Private submissions and receipts" },
  { label: "Events", path: portalRoutes.events, icon: CalendarDays, description: "Events and school chapters" },
  { label: "Saved", path: portalRoutes.saved, icon: Bookmark, description: "Saved articles and research" },
  { label: "Settings", path: portalRoutes.settings, icon: Settings, description: "Profile and account preferences", children: [
    { label: "People", path: portalRoutes.network }, { label: "Learn & read", path: portalRoutes.debriefed },
  ] },
  { label: "Intake review", path: portalRoutes.intakeReview, icon: Shield, description: "Platform submissions and availability", adminOnly: true },
  { label: "Admin", path: portalRoutes.admin, icon: Shield, description: "Content administration", adminOnly: true },
];
