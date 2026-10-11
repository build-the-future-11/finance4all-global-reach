import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  BookOpenText,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Newspaper,
  Settings,
  Shield,
  UsersRound,
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
  group: "Workspace" | "Explore" | "Account";
  adminOnly?: boolean;
  children?: { label: string; path: string }[];
}

export const portalNav: PortalNavItem[] = [
  { group: "Workspace", label: "Home", path: portalRoutes.dashboard, icon: LayoutDashboard, description: "Your priorities and recent activity" },
  { group: "Workspace", label: "Learning", path: portalRoutes.learning, icon: GraduationCap, description: "Reading progress and private notes" },
  { group: "Workspace", label: "My research", path: portalRoutes.myResearch, icon: FlaskConical, description: "Projects you lead or have joined" },
  { group: "Workspace", label: "Collaboration", path: portalRoutes.collaboration, icon: UsersRound, description: "Invitations, tasks and milestones" },
  { group: "Workspace", label: "Applications", path: portalRoutes.apply, icon: FileText, description: "Private submissions and receipts" },
  { group: "Explore", label: "Projects", path: portalRoutes.labs, icon: BriefcaseBusiness, description: "Research questions and applications", children: [
    { label: "All projects", path: portalRoutes.labs }, { label: "Review workspace", path: portalRoutes.labsReview },
  ] },
  { group: "Explore", label: "Programs", path: portalRoutes.pathways, icon: BookOpenText, description: "Programs, opportunities and challenges", children: [
    { label: "Opportunity board", path: portalRoutes.pathways }, { label: "Project studio", path: portalRoutes.pathwaysStudios }, { label: "Writing challenges", path: portalRoutes.pathwaysEssays },
  ] },
  { group: "Explore", label: "News & explainers", path: portalRoutes.debriefed, icon: Newspaper, description: "Evidence-led finance reading" },
  { group: "Explore", label: "Events", path: portalRoutes.events, icon: CalendarDays, description: "Events and school chapters" },
  { group: "Explore", label: "People", path: portalRoutes.network, icon: UsersRound, description: "Members and introductions" },
  { group: "Explore", label: "Saved", path: portalRoutes.saved, icon: Bookmark, description: "Saved articles and research" },
  { group: "Account", label: "Settings", path: portalRoutes.settings, icon: Settings, description: "Profile and account preferences" },
  { group: "Account", label: "Intake review", path: portalRoutes.intakeReview, icon: Shield, description: "Platform submissions and availability", adminOnly: true },
  { group: "Account", label: "Admin", path: portalRoutes.admin, icon: Shield, description: "Content administration", adminOnly: true },
];
