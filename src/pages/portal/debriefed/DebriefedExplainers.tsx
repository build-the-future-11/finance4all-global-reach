import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpenText, CalendarDays, Clock3 } from "lucide-react";
import { useExplainerBySlug, useExplainers } from "@/hooks/portal/useDebriefed";
import { portalRoutes } from "@/routes/portal";
import MarkdownContent from "@/components/portal/MarkdownContent";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  QueryStatus,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import SaveExplainer from "@/components/portal/SaveExplainer";
import { findEditorialExplainer } from "@/content/editorial";

function ExplainerDetail({ slug }: { slug: string }) {
  const { data: explainer, isLoading, error, refetch } = useExplainerBySlug(slug);
  useDocumentTitle(explainer?.title ?? "Explainer");

  return (
    <QueryStatus
      isLoading={isLoading}
      error={error}
      isEmpty={!explainer}
      emptyMessage="Explainer not found."
      onRetry={() => refetch()}
      skeletonCount={1}
    >
      {explainer && (
        <div>
          <Link
            to={portalRoutes.debriefedExplainers}
            className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-300 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> All explainers
          </Link>
          <div className="max-w-4xl">
            <Badge variant="outline" className="border-border capitalize text-muted-foreground">
              {explainer.difficulty}
            </Badge>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">{explainer.title}</h1>
            <p className="portal-muted mt-5 max-w-3xl text-lg leading-relaxed">{explainer.summary}</p>
            {"readMinutes" in explainer && (
              <div className="portal-muted mt-5 flex flex-wrap gap-4 text-xs">
                <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {explainer.readMinutes} minute read</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Reviewed {new Date(`${explainer.reviewedAt}T00:00:00`).toLocaleDateString()}</span>
                <span className="inline-flex items-center gap-1.5"><BookOpenText className="h-3.5 w-3.5" /> {explainer.sourceLabel}</span>
              </div>
            )}
          </div>
          {findEditorialExplainer(slug) && <div className="mt-5"><SaveExplainer slug={findEditorialExplainer(slug)!.slug} /></div>}
          <PortalCard className="mt-8 p-6 sm:p-10">
            <MarkdownContent content={explainer.body} titleAlreadyRendered className="editorial-prose mx-auto max-w-3xl text-base" />
            {explainer.relatedTerms.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                {explainer.relatedTerms.map((term) => (
                    <span key={term} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {term}
                  </span>
                ))}
              </div>
            )}
          </PortalCard>
        </div>
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
      <PortalPageHeader
        eyebrow="Finance Debriefed"
        title="The explainer library"
        description="Built to take you from a headline to the actual mechanism. Every editorial guide includes assumptions, primary reading, and a clear advice boundary."
      />

      <QueryStatus
        isLoading={isLoading}
        error={error}
        isEmpty={!explainers?.length}
        emptyMessage="No explainers yet. Admins can publish them from the admin panel."
        onRetry={() => refetch()}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {explainers?.map((card) => (
            <Link key={card.id} to={`${portalRoutes.debriefedExplainers}/${card.slug}`}>
              <PortalCard hover className="group flex h-full min-h-64 flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                <Badge variant="outline" className="border-border capitalize text-muted-foreground">
                  {card.difficulty}
                </Badge>
                {"readMinutes" in card && <span className="portal-muted inline-flex items-center gap-1 text-xs"><Clock3 className="h-3.5 w-3.5" /> {card.readMinutes} min</span>}
                </div>
                <h3 className="mt-8 font-serif text-2xl font-semibold leading-tight text-foreground transition group-hover:text-emerald-500">{card.title}</h3>
                <p className="portal-muted mt-3 text-sm leading-relaxed">{card.summary}</p>
                <span className="mt-auto pt-6 text-sm font-semibold text-emerald-500">Read guide →</span>
              </PortalCard>
            </Link>
          ))}
        </div>
      </QueryStatus>
    </div>
  );
}
