import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import {
  useOpportunities,
  useOpportunityInterests,
  useToggleOpportunityInterest,
} from "@/hooks/portal/usePathways";
import {
  EmptyState,
  PortalCard,
  QueryStatus,
  portalButtonOutline,
  portalButtonPrimary,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { portalRoutes } from "@/routes/portal";
import { sanitizeUrl } from "@/lib/security";
import { isSampleContent, programKindLabels, stripSamplePrefix } from "@/lib/programLabels";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: opportunities, isLoading, error, refetch } = useOpportunities();
  const { data: interests } = useOpportunityInterests();
  const toggle = useToggleOpportunityInterest();

  const opp = opportunities?.find((o) => o.id === id);
  useDocumentTitle(opp ? stripSamplePrefix(opp.title) : "Opportunity");

  const handleToggle = async () => {
    if (!opp) return;
    const saved = interests?.has(opp.id) ?? false;
    try {
      await toggle.mutateAsync({ opportunityId: opp.id, interested: !saved });
      toast.success(saved ? "Removed from saved" : "Saved opportunity");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  if (!id) return <EmptyState message="Opportunity not found." />;

  return (
    <QueryStatus
      isLoading={isLoading}
      error={error}
      isEmpty={!opp}
      emptyMessage="This opportunity is inactive or was removed."
      onRetry={() => refetch()}
      skeletonCount={1}
    >
      {opp && (
        <div className="space-y-6">
          <PortalAnimatedSection>
            <Link
              to={portalRoutes.pathwaysOpportunities}
              className="inline-flex items-center gap-2 text-sm text-emerald-300 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Opportunity board
            </Link>
          </PortalAnimatedSection>

          <PortalCard className="space-y-4 p-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                {opp.type.replace("_", " ")}
              </Badge>
              {programKindLabels(opp).map((label) => (
                <Badge key={label} className="border-0 bg-emerald-500/15 text-emerald-200">
                  {label}
                </Badge>
              ))}
              {isSampleContent(opp.title) && (
                <Badge variant="outline" className="border-amber-400/40 text-amber-200">
                  Sample data
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-white">{stripSamplePrefix(opp.title)}</h1>
            <p className="text-sm text-emerald-300/80">{opp.organization}</p>
            <p className="text-sm leading-relaxed text-white/65">{opp.description}</p>
            {opp.deadline && (
              <p className="text-xs text-white/40">
                Deadline: {new Date(opp.deadline).toLocaleDateString()}
              </p>
            )}
            {opp.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {opp.tags.map((t) => (
                  <span key={t} className="text-xs text-white/40">
                    #{t}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="sm"
                variant={interests?.has(opp.id) ? "default" : "outline"}
                className={interests?.has(opp.id) ? portalButtonPrimary : portalButtonOutline}
                onClick={() => void handleToggle()}
              >
                <Star className={`mr-1.5 h-3.5 w-3.5 ${interests?.has(opp.id) ? "fill-current" : ""}`} />
                {interests?.has(opp.id) ? "Saved" : "Save interest"}
              </Button>
              {sanitizeUrl(opp.applicationUrl ?? "") && (
                <a href={sanitizeUrl(opp.applicationUrl)!} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className={portalButtonOutline}>
                    External apply <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </a>
              )}
            </div>
          </PortalCard>
        </div>
      )}
    </QueryStatus>
  );
}
