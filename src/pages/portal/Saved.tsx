import { Link } from "react-router-dom";
import { Bookmark, Briefcase, ExternalLink, FlaskConical, Newspaper, X } from "lucide-react";
import {
  useSavedArticles,
  useSavedOpportunities,
  useSavedProjects,
} from "@/hooks/portal/useBookmarks";
import { useToggleOpportunityInterest } from "@/hooks/portal/usePathways";
import { portalRoutes } from "@/routes/portal";
import {
  CategoryBadge,
  PortalCard,
  PortalPageHeader,
  QueryStatus,
  portalButtonOutline,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { toast } from "sonner";

export default function Saved() {
  useDocumentTitle("Saved");
  const {
    data: articles,
    isLoading: articlesLoading,
    error: articlesError,
    refetch: refetchArticles,
  } = useSavedArticles();
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useSavedProjects();
  const {
    data: opportunities,
    isLoading: oppsLoading,
    error: oppsError,
    refetch: refetchOpps,
  } = useSavedOpportunities();
  const toggleOpp = useToggleOpportunityInterest();

  const isEmpty = !articles?.length && !projects?.length && !opportunities?.length;
  const isLoading = articlesLoading || projectsLoading || oppsLoading;
  const error = articlesError ?? projectsError ?? oppsError;

  const handleRemoveOpp = async (opportunityId: string) => {
    try {
      await toggleOpp.mutateAsync({ opportunityId, interested: true });
      toast.success("Removed from saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove");
    }
  };

  return (
    <div>
      <PortalPageHeader
        eyebrow="Your library"
        title="Saved items"
        description="Articles, lab projects, and pathways opportunities you've bookmarked."
      />

      <QueryStatus
        isLoading={isLoading}
        error={error}
        isEmpty={isEmpty}
        emptyMessage="Nothing saved yet. Bookmark news on Debriefed, save lab projects in Meta Labs, or mark opportunities in Pathways."
        onRetry={() => {
          refetchArticles();
          refetchProjects();
          refetchOpps();
        }}
        skeletonCount={2}
      >
        {articles && articles.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Newspaper className="h-4 w-4 text-emerald-400" />
              News articles
            </h2>
            <div className="space-y-3">
              {articles.map(({ article, savedAt }) => (
                <PortalCard key={article.id} hover className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CategoryBadge>{article.category}</CategoryBadge>
                      <h3 className="mt-2 font-semibold text-white">{article.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-white/55">{article.summary}</p>
                      <p className="mt-2 text-xs text-white/35">
                        Saved {new Date(savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={portalRoutes.debriefed}>
                        <Button size="sm" variant="outline" className={portalButtonOutline}>
                          Open feed
                        </Button>
                      </Link>
                      {article.sourceUrl && (
                        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className={portalButtonOutline}>
                            Source <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </PortalCard>
              ))}
            </div>
          </section>
        )}

        {projects && projects.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <FlaskConical className="h-4 w-4 text-blue-400" />
              Lab projects
            </h2>
            <div className="space-y-3">
              {projects.map(({ project, savedAt }) => (
                <Link key={project.id} to={`${portalRoutes.labs}/${project.id}`}>
                  <PortalCard hover className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                          {project.status.replace("_", " ")}
                        </Badge>
                        <h3 className="mt-2 font-semibold text-white">{project.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-white/55">{project.description}</p>
                        <p className="mt-2 text-xs text-white/35">
                          Saved {new Date(savedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </PortalCard>
                </Link>
              ))}
            </div>
          </section>
        )}

        {opportunities && opportunities.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Briefcase className="h-4 w-4 text-amber-400" />
              Pathways opportunities
            </h2>
            <div className="space-y-3">
              {opportunities.map(({ opportunity, savedAt }) => (
                <PortalCard key={opportunity.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                        {opportunity.type.replace("_", " ")}
                      </Badge>
                      <h3 className="mt-2 font-semibold text-white">{opportunity.title}</h3>
                      <p className="mt-1 text-sm text-white/55">{opportunity.organization}</p>
                      <p className="mt-2 text-xs text-white/35">
                        Saved {new Date(savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={portalRoutes.pathways}>
                        <Button size="sm" variant="outline" className={portalButtonOutline}>
                          Open Pathways
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className={portalButtonOutline}
                        disabled={toggleOpp.isPending}
                        onClick={() => handleRemoveOpp(opportunity.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </PortalCard>
              ))}
            </div>
          </section>
        )}
      </QueryStatus>
    </div>
  );
}
