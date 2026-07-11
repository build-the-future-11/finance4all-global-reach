import { Link } from "react-router-dom";
import { ArrowRight, FlaskConical } from "lucide-react";
import { useMyLabApplications, useResearchProjects } from "@/hooks/portal/useLabs";
import { portalRoutes } from "@/routes/portal";
import { portalCopy } from "@/lib/portalCopy";
import type { LabApplicationStatus } from "@/types/domain";
import {
  CategoryBadge,
  PortalCard,
  PortalSection,
  portalButtonPrimary,
} from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_COPY: Record<LabApplicationStatus, string> = portalCopy.labTracker.status;

const STATUS_ACCENT: Record<LabApplicationStatus, string> = {
  pending: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  under_review: "border-blue-400/30 bg-blue-500/10 text-blue-200",
  accepted: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  rejected: "border-white/20 bg-white/[0.04] text-white/50",
};

export default function LabApplicationsPanel() {
  const { data: apps } = useMyLabApplications();
  const { data: projects } = useResearchProjects("all");

  const projectTitleMap = Object.fromEntries(projects?.map((p) => [p.id, p.title]) ?? []);

  if (!apps?.length) {
    return (
      <PortalCard className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-500/15 p-2 text-blue-300">
            <FlaskConical className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-white">{portalCopy.dashboard.labEmptyTitle}</p>
            <p className="text-sm text-white/50">{portalCopy.dashboard.labEmptyDescription}</p>
          </div>
        </div>
        <Link to={portalRoutes.labs}>
          <Button size="sm" className={cn("portal-btn-press", portalButtonPrimary)}>
            {portalCopy.labTracker.browseLabs} <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </PortalCard>
    );
  }

  return (
    <PortalSection title={portalCopy.labTracker.title}>
      <div className="space-y-3">
        {apps.map((app) => (
          <PortalCard key={app.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Link
                  to={`${portalRoutes.labs}/${app.projectId}`}
                  className="font-medium text-white hover:text-emerald-300"
                >
                  {projectTitleMap[app.projectId] ?? portalCopy.labTracker.fallbackTitle}
                </Link>
                <p className="mt-1 text-xs text-white/40">
                  {portalCopy.labTracker.submitted.replace(
                    "{date}",
                    new Date(app.submittedAt).toLocaleDateString(),
                  )}
                </p>
                <p className="mt-2 text-sm text-white/55">{STATUS_COPY[app.status]}</p>
              </div>
              <CategoryBadge className={STATUS_ACCENT[app.status]}>
                {app.status.replace("_", " ")}
              </CategoryBadge>
            </div>
            <Link
              to={`${portalRoutes.labs}/${app.projectId}`}
              className="mt-3 inline-block text-xs text-emerald-400 hover:underline"
            >
              {portalCopy.labTracker.viewProject} →
            </Link>
          </PortalCard>
        ))}
      </div>
    </PortalSection>
  );
}
