import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  BookOpenText,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  FlaskConical,
  GraduationCap,
  Globe2,
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
  chapters: `${PORTAL_BASE}/chapters`,
  programs: `${PORTAL_BASE}/programs`,
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
  { group: "Workspace", label: "Dashboard", path: portalRoutes.dashboard, icon: LayoutDashboard, description: "Your priorities and recent activity" },
  { group: "Workspace", label: "My Learning", path: portalRoutes.learning, icon: GraduationCap, description: "Reading progress and private notes" },
  { group: "Workspace", label: "My Research", path: portalRoutes.myResearch, icon: FlaskConical, description: "Projects you lead or have joined" },
  { group: "Workspace", label: "Collaboration", path: portalRoutes.collaboration, icon: UsersRound, description: "Invitations, tasks and milestones" },
  { group: "Workspace", label: "Applications", path: portalRoutes.apply, icon: FileText, description: "Private submissions and receipts" },
  { group: "Explore", label: "Research & Labs", path: portalRoutes.labs, icon: BriefcaseBusiness, description: "Research questions and applications", children: [
    { label: "All projects", path: portalRoutes.labs }, { label: "Review workspace", path: portalRoutes.labsReview },
  ] },
  { group: "Explore", label: "Programs & Opportunities", path: portalRoutes.programs, icon: BookOpenText, description: "Programs, opportunities and challenges", children: [
    { label: "Opportunity board", path: portalRoutes.pathways }, { label: "Project studio", path: portalRoutes.pathwaysStudios }, { label: "Writing challenges", path: portalRoutes.pathwaysEssays },
  ] },
  { group: "Explore", label: "Finance Debriefed", path: portalRoutes.debriefed, icon: Newspaper, description: "Evidence-led finance reading" },
  { group: "Explore", label: "Events & Calendar", path: portalRoutes.events, icon: CalendarDays, description: "Events and school chapters" },
  { group: "Explore", label: "Global Chapters", path: portalRoutes.chapters, icon: Globe2, description: "Local communities and expansion locations" },
  { group: "Explore", label: "Community & Networking", path: portalRoutes.network, icon: UsersRound, description: "Members and introductions" },
  { group: "Explore", label: "Saved Content", path: portalRoutes.saved, icon: Bookmark, description: "Saved articles and research" },
  { group: "Account", label: "Profile & Settings", path: portalRoutes.settings, icon: Settings, description: "Profile and account preferences" },
  { group: "Account", label: "Intake review", path: portalRoutes.intakeReview, icon: Shield, description: "Platform submissions and availability", adminOnly: true },
  { group: "Account", label: "Admin", path: portalRoutes.admin, icon: Shield, description: "Content administration", adminOnly: true },
];
