import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useExplainerBySlug, useExplainers } from "@/hooks/portal/useDebriefed";
import { portalRoutes } from "@/routes/portal";
import MarkdownContent from "@/components/portal/MarkdownContent";
import GlossarySearch from "@/components/portal/GlossarySearch";
import {
  PortalCard,
  PortalPageHeader,
  QueryStatus,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { portalCopy } from "@/lib/portalCopy";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";

function ExplainerDetail({ slug }: { slug: string }) {
  const { data: explainer, isLoading, error, refetch } = useExplainerBySlug(slug);
  useDocumentTitle(explainer?.title ?? "Explainer");

  return (
    <QueryStatus
      isLoading={isLoading}
      error={error}
      isEmpty={!explainer}
      emptyMessage={portalCopy.explainers.notFound}
      onRetry={() => refetch()}
      skeletonCount={1}
    >
      {explainer && (
        <PortalAnimatedSection>
          <div>
            <Link
              to={portalRoutes.debriefedExplainers}
              className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-300 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> All explainers
            </Link>
            <Badge variant="outline" className="border-white/20 capitalize text-white/60">
              {explainer.difficulty}
            </Badge>
            <h1 className="mt-3 text-3xl font-bold text-white">{explainer.title}</h1>
            <p className="mt-2 text-white/60">{explainer.summary}</p>
            <PortalCard className="mt-6 p-6">
              <MarkdownContent content={explainer.body} />
              {explainer.relatedTerms.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  {explainer.relatedTerms.map((term) => (
                    <span key={term} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                      {term}
                    </span>
                  ))}
                </div>
              )}
            </PortalCard>
            <div className="mt-6">
              <GlossarySearch compact />
            </div>
          </div>
        </PortalAnimatedSection>
      )}
    </QueryStatus>
  );
}

export default function DebriefedExplainers() {
  const { slug } = useParams();
  const { data: explainers, isLoading, error, refetch } = useExplainers();
  useDocumentTitle(slug ? "Explainer" : "Explainers");

  if (slug) return <ExplainerDetail slug={slug} />;

  return (
    <div>
      <PortalAnimatedSection>
        <PortalPageHeader
          eyebrow={portalCopy.explainers.eyebrow}
          title={portalCopy.explainers.title}
          description={portalCopy.explainers.description}
        />
      </PortalAnimatedSection>

      <div className="mb-8">
        <GlossarySearch />
      </div>

      <QueryStatus
        isLoading={isLoading}
        error={error}
        isEmpty={!explainers?.length}
        emptyMessage={portalCopy.explainers.empty}
        onRetry={() => refetch()}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {explainers?.map((card) => (
            <Link key={card.id} to={`${portalRoutes.debriefedExplainers}/${card.slug}`}>
              <PortalCard className="h-full p-5 transition hover:border-white/30 hover:bg-white/[0.07]">
                <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                  {card.difficulty}
                </Badge>
                <h3 className="mt-3 text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-2 text-sm text-white/60">{card.summary}</p>
              </PortalCard>
            </Link>
          ))}
        </div>
      </QueryStatus>
    </div>
  );
}
