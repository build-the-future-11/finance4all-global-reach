import { ExternalLink, Star } from "lucide-react";
import {
  useOpportunities,
  useOpportunityInterests,
  useToggleOpportunityInterest,
} from "@/hooks/portal/usePathways";
import { EmptyState, LoadingState, PortalCard, PortalPageHeader } from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AxiomPathways() {
  const { data: opportunities, isLoading, error } = useOpportunities();
  const { data: interests } = useOpportunityInterests();
  const toggle = useToggleOpportunityInterest();

  const handleToggle = async (id: string, currentlyInterested: boolean) => {
    try {
      await toggle.mutateAsync({ opportunityId: id, interested: !currentlyInterested });
      toast.success(currentlyInterested ? "Removed from saved" : "Saved opportunity");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  return (
    <div>
      <PortalPageHeader
        title="Axiom Pathways"
        description="Internships, programs, challenges, and project-based roles."
      />

      {isLoading && <LoadingState />}
      {error && <EmptyState message="Could not load opportunities." />}

      <div className="space-y-4">
        {opportunities?.map((opp) => {
          const saved = interests?.has(opp.id) ?? false;
          return (
            <PortalCard key={opp.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                      {opp.type.replace("_", " ")}
                    </Badge>
                    {opp.tags.map((t) => (
                      <span key={t} className="text-xs text-white/40">#{t}</span>
                    ))}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{opp.title}</h3>
                  <p className="text-sm text-emerald-300/80">{opp.organization}</p>
                  <p className="mt-2 text-sm text-white/60">{opp.description}</p>
                  {opp.deadline && (
                    <p className="mt-2 text-xs text-white/40">
                      Deadline: {new Date(opp.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant={saved ? "default" : "outline"}
                    className={saved ? "" : "border-white/20 text-white"}
                    onClick={() => handleToggle(opp.id, saved)}
                  >
                    <Star className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
                    {saved ? "Saved" : "Save"}
                  </Button>
                  {opp.applicationUrl && (
                    <a href={opp.applicationUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="w-full border-white/20 text-white">
                        Apply <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </PortalCard>
          );
        })}
      </div>
    </div>
  );
}
