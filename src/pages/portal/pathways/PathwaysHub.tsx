import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, FileText, Palette } from "lucide-react";
import { useOpportunities, useStudioSubmissions, useEssays } from "@/hooks/portal/usePathways";
import { portalRoutes } from "@/routes/portal";
import {
  CategoryBadge,
  PortalCard,
  PortalPageHeader,
  PortalSection,
  QueryStatus,
  portalButtonPrimary,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { portalCopy } from "@/lib/portalCopy";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";
import InterestPillBar from "@/components/portal/InterestPillBar";

const MODULES = [
  {
    title: "Opportunity Board",
    description: "Internships, programs, and project roles — filter by type and save listings.",
    href: `${portalRoutes.pathways}/opportunities`,
    icon: Briefcase,
    accent: "from-amber-500/20 to-amber-600/5 text-amber-300",
  },
  {
    title: "Studios",
    description: "Student-built finance projects — repos, demos, models, and design sprints.",
    href: portalRoutes.pathwaysStudios,
    icon: Palette,
    accent: "from-purple-500/20 to-purple-600/5 text-purple-300",
  },
  {
    title: "Essays",
    description: "Opinion and market analysis with community upvotes and editorial review.",
    href: portalRoutes.pathwaysEssays,
    icon: FileText,
    accent: "from-blue-500/20 to-blue-600/5 text-blue-300",
  },
];

export default function PathwaysHub() {
  useDocumentTitle("Pathways");
  const { data: opps, isLoading: oppsLoading, error: oppsError, refetch: refetchOpps } = useOpportunities();
  const { data: studios, isLoading: studiosLoading, error: studiosError, refetch: refetchStudios } =
    useStudioSubmissions();
  const { data: essays, isLoading: essaysLoading, error: essaysError, refetch: refetchEssays } = useEssays();

  return (
    <div className="space-y-8">
      <PortalAnimatedSection>
        <PortalPageHeader
          eyebrow={portalCopy.pathways.eyebrow}
          title={portalCopy.pathways.title}
          description={portalCopy.pathways.description}
        />
      </PortalAnimatedSection>

      <InterestPillBar />

      <div className="grid gap-4 md:grid-cols-3">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} to={mod.href}>
              <PortalCard hover className="group relative h-full overflow-hidden p-6">
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-60 blur-3xl transition group-hover:opacity-100 ${mod.accent}`}
                />
                <div className={`inline-flex rounded-xl bg-gradient-to-br p-3 ring-1 ring-white/10 ${mod.accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{mod.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{mod.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-emerald-400">
                  Explore <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </PortalCard>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <PortalSection title="Latest opportunities">
          <QueryStatus
            isLoading={oppsLoading}
            error={oppsError}
            onRetry={() => refetchOpps()}
            isEmpty={!opps?.length}
            emptyMessage={portalCopy.pathways.emptyOpportunities}
          >
            <div className="space-y-2">
              {opps?.slice(0, 4).map((o) => (
                <Link key={o.id} to={`${portalRoutes.pathways}/opportunities`}>
                  <PortalCard hover className="p-3">
                    <p className="truncate text-sm font-medium text-white">{o.title}</p>
                    <p className="text-xs text-white/45">{o.organization}</p>
                  </PortalCard>
                </Link>
              ))}
            </div>
          </QueryStatus>
          <Link to={`${portalRoutes.pathways}/opportunities`} className="mt-2 inline-block text-xs text-emerald-400 hover:underline">
            View all →
          </Link>
        </PortalSection>

        <PortalSection title="Studio submissions">
          <QueryStatus
            isLoading={studiosLoading}
            error={studiosError}
            onRetry={() => refetchStudios()}
            isEmpty={!studios?.length}
            emptyMessage={portalCopy.pathways.emptyStudios}
          >
            <div className="space-y-2">
              {studios?.slice(0, 4).map((s) => (
                <Link key={s.id} to={portalRoutes.pathwaysStudios}>
                  <PortalCard hover className="p-3">
                    <p className="truncate text-sm font-medium text-white">{s.title}</p>
                    <p className="line-clamp-1 text-xs text-white/45">{s.writeup}</p>
                  </PortalCard>
                </Link>
              ))}
            </div>
          </QueryStatus>
        </PortalSection>

        <PortalSection title="Essay picks">
          <QueryStatus
            isLoading={essaysLoading}
            error={essaysError}
            onRetry={() => refetchEssays()}
            isEmpty={!essays?.length}
            emptyMessage={portalCopy.pathways.emptyEssays}
          >
            <div className="space-y-2">
              {essays?.slice(0, 4).map((e) => (
                <Link key={e.id} to={portalRoutes.pathwaysEssays}>
                  <PortalCard hover className="p-3">
                    <p className="truncate text-sm font-medium text-white">{e.title}</p>
                    {e.isEditorialPick && <CategoryBadge>Editorial pick</CategoryBadge>}
                  </PortalCard>
                </Link>
              ))}
            </div>
          </QueryStatus>
        </PortalSection>
      </div>

      <PortalCard className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-medium text-white">{portalCopy.pathways.hubCtaTitle}</p>
          <p className="text-sm text-white/50">{portalCopy.pathways.hubCtaDescription}</p>
        </div>
        <Button asChild className={portalButtonPrimary}>
          <Link to={`${portalRoutes.pathways}/opportunities`}>Open opportunity board</Link>
        </Button>
      </PortalCard>
    </div>
  );
}
