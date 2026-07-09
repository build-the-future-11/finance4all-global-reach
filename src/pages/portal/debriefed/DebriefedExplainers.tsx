import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useExplainerBySlug, useExplainers } from "@/hooks/portal/useDebriefed";
import { portalRoutes } from "@/routes/portal";
import { EmptyState, LoadingState, PortalCard, PortalPageHeader } from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";

function ExplainerDetail({ slug }: { slug: string }) {
  const { data: explainer, isLoading, error } = useExplainerBySlug(slug);

  if (isLoading) return <LoadingState />;
  if (error || !explainer) return <EmptyState message="Explainer not found." />;

  return (
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
        <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm text-white/80">
          {explainer.body}
        </div>
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
    </div>
  );
}

export default function DebriefedExplainers() {
  const { slug } = useParams();
  const { data: explainers, isLoading, error } = useExplainers();

  if (slug) return <ExplainerDetail slug={slug} />;

  return (
    <div>
      <PortalPageHeader
        title="Explain This"
        description="Beginner-friendly cards that decode finance buzzwords and current narratives."
      />

      {isLoading && <LoadingState />}
      {error && <EmptyState message="Could not load explainers." />}

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
    </div>
  );
}
