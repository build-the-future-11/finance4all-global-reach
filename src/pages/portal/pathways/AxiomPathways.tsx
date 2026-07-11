import { useMemo, useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import {
  useOpportunities,
  useOpportunityInterests,
  useToggleOpportunityInterest,
} from "@/hooks/portal/usePathways";
import type { OpportunityType } from "@/types/domain";
import {
  PortalCard,
  PortalPageHeader,
  PortalTabsList,
  PortalTabsTrigger,
  QueryStatus,
  portalButtonOutline,
  portalButtonPrimary,
  portalInputClass,
} from "@/components/portal/PortalUI";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { portalCopy } from "@/lib/portalCopy";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";
import InterestPillBar from "@/components/portal/InterestPillBar";

const TYPES: { value: OpportunityType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "internship", label: "Internships" },
  { value: "program", label: "Programs" },
  { value: "challenge", label: "Challenges" },
  { value: "project_role", label: "Project roles" },
];

export default function AxiomPathways() {
  useDocumentTitle("Pathways");
  const [typeFilter, setTypeFilter] = useState<OpportunityType | "all">("all");
  const [search, setSearch] = useState("");
  const { data: opportunities, isLoading, error, refetch } = useOpportunities();
  const { data: interests } = useOpportunityInterests();
  const toggle = useToggleOpportunityInterest();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return opportunities?.filter((opp) => {
      if (typeFilter !== "all" && opp.type !== typeFilter) return false;
      if (!q) return true;
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.organization.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q)
      );
    });
  }, [opportunities, typeFilter, search]);

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
      <PortalAnimatedSection>
        <PortalPageHeader
          eyebrow={portalCopy.pathways.opportunities.eyebrow}
          title={portalCopy.pathways.opportunities.title}
          description={portalCopy.pathways.opportunities.description}
        />
      </PortalAnimatedSection>

      <PortalAnimatedSection delay={40}>
        <InterestPillBar />
      </PortalAnimatedSection>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as OpportunityType | "all")}>
          <PortalTabsList>
            {TYPES.map((t) => (
              <PortalTabsTrigger key={t.value} value={t.value}>
                {t.label}
              </PortalTabsTrigger>
            ))}
          </PortalTabsList>
        </Tabs>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search opportunities…"
          className={`max-w-xs ${portalInputClass}`}
        />
      </div>

      <QueryStatus
        isLoading={isLoading}
        error={error}
        isEmpty={!filtered?.length}
        emptyMessage={portalCopy.pathways.opportunities.empty}
        onRetry={() => refetch()}
      >
        <div className="space-y-4">
          {filtered?.map((opp) => {
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
                        <span key={t} className="text-xs text-white/40">
                          #{t}
                        </span>
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
                      className={saved ? portalButtonPrimary : portalButtonOutline}
                      onClick={() => handleToggle(opp.id, saved)}
                    >
                      <Star className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
                      {saved ? "Saved" : "Save"}
                    </Button>
                    {opp.applicationUrl && (
                      <a href={opp.applicationUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className={`w-full ${portalButtonOutline}`}>
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
      </QueryStatus>
    </div>
  );
}
