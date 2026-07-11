import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { portalRoutes } from "@/routes/portal";
import { portalCopy } from "@/lib/portalCopy";
import { EDUCATION_MODULES } from "@/data/educationModules";
import { RESOURCE_GUIDES } from "@/data/resourceGuides";

interface Crumb {
  label: string;
  href?: string;
}

function buildCrumbs(pathname: string): Crumb[] | null {
  const c = portalCopy.breadcrumbs;

  if (pathname === portalRoutes.dashboard) return null;

  if (pathname.startsWith(`${portalRoutes.education}/`)) {
    const lessonId = pathname.split("/").pop();
    const lesson = EDUCATION_MODULES.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
    return [
      { label: c.dashboard, href: portalRoutes.dashboard },
      { label: c.education, href: portalRoutes.education },
      { label: lesson?.title ?? c.lesson },
    ];
  }

  if (pathname.startsWith(`${portalRoutes.networkProfile}/`)) {
    return [
      { label: c.dashboard, href: portalRoutes.dashboard },
      { label: c.network, href: portalRoutes.network },
      { label: c.profile },
    ];
  }

  if (pathname.startsWith(`${portalRoutes.resources}/`)) {
    const guideId = pathname.split("/").pop();
    const guide = guideId ? RESOURCE_GUIDES[guideId] : undefined;
    return [
      { label: c.dashboard, href: portalRoutes.dashboard },
      { label: c.resources, href: portalRoutes.resources },
      { label: guide?.title ?? c.guide },
    ];
  }

  if (pathname.startsWith(`${portalRoutes.labs}/`) && pathname !== portalRoutes.labsReview) {
    return [
      { label: c.dashboard, href: portalRoutes.dashboard },
      { label: c.labs, href: portalRoutes.labs },
      { label: c.project },
    ];
  }

  if (pathname.startsWith(`${portalRoutes.debriefedExplainers}/`)) {
    return [
      { label: c.dashboard, href: portalRoutes.dashboard },
      { label: c.debriefed, href: portalRoutes.debriefed },
      { label: c.explainers, href: portalRoutes.debriefedExplainers },
      { label: c.explainer },
    ];
  }

  return null;
}

export default function PortalBreadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = buildCrumbs(pathname);

  if (!crumbs) return null;

  return (
    <Breadcrumb className="mb-5 hidden lg:block" aria-label="Breadcrumb">
      <BreadcrumbList className="text-white/45">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={`${crumb.label}-${i}`} className="contents">
              {i > 0 && <BreadcrumbSeparator className="text-white/25" />}
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className="max-w-[240px] truncate font-medium text-white/70">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={crumb.href}
                      className="portal-focus-ring rounded-sm text-white/50 transition-colors duration-portal hover:text-emerald-300"
                    >
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
