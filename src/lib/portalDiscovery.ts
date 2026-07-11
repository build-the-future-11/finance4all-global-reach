import { Briefcase, Calendar, FlaskConical, Newspaper, Users } from "lucide-react";
import { portalRoutes } from "@/routes/portal";
import { portalCopy } from "@/lib/portalCopy";
import type { DiscoveryItem } from "@/components/portal/PortalDiscoveryRail";

const { discovery } = portalCopy;

export const PORTAL_DISCOVERY_ITEMS: DiscoveryItem[] = [
  {
    title: discovery.debriefed.title,
    description: discovery.debriefed.description,
    href: portalRoutes.debriefed,
    icon: Newspaper,
    accent: "emerald",
  },
  {
    title: discovery.labs.title,
    description: discovery.labs.description,
    href: portalRoutes.labs,
    icon: FlaskConical,
    accent: "blue",
  },
  {
    title: discovery.network.title,
    description: discovery.network.description,
    href: portalRoutes.network,
    icon: Users,
    accent: "purple",
  },
  {
    title: discovery.events.title,
    description: discovery.events.description,
    href: portalRoutes.events,
    icon: Calendar,
    accent: "amber",
  },
];

export const SAVED_DISCOVERY_ITEMS: DiscoveryItem[] = [
  {
    title: discovery.savedDebriefed.title,
    description: discovery.savedDebriefed.description,
    href: portalRoutes.debriefed,
    icon: Newspaper,
    accent: "emerald",
  },
  {
    title: discovery.savedLabs.title,
    description: discovery.savedLabs.description,
    href: portalRoutes.labs,
    icon: FlaskConical,
    accent: "blue",
  },
  {
    title: discovery.savedPathways.title,
    description: discovery.savedPathways.description,
    href: portalRoutes.pathwaysOpportunities,
    icon: Briefcase,
    accent: "amber",
  },
];
