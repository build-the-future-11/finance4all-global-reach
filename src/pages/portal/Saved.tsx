import { Link } from "react-router-dom";
import { Bookmark, ExternalLink } from "lucide-react";
import { useSavedArticles, useSavedProjects } from "@/hooks/portal/useBookmarks";
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

  const isEmpty = !articles?.length && !projects?.length;
  const isLoading = articlesLoading || projectsLoading;

  return (
    <div>
      <PortalPageHeader
        eyebrow="Your library"
        title="Saved items"
        description="Articles and lab projects you've bookmarked for later."
      />

      <QueryStatus
        isLoading={isLoading}
        error={articlesError ?? projectsError}
        isEmpty={isEmpty}
        emptyMessage="Nothing saved yet. Bookmark news articles or lab projects as you browse."
        onRetry={() => {
          refetchArticles();
          refetchProjects();
        }}
        skeletonCount={2}
      >
        {articles && articles.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Bookmark className="h-4 w-4 text-emerald-400" />
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
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Bookmark className="h-4 w-4 text-blue-400" />
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
      </QueryStatus>
    </div>
  );
}
