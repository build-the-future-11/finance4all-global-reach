import { useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, ExternalLink, ShieldCheck, Star } from "lucide-react";
import {
  useOpportunities,
  useOpportunityInterests,
  useToggleOpportunityInterest,
} from "@/hooks/portal/usePathways";
import type { OpportunityType } from "@/types/domain";
import {
  PortalCard,
  PortalPageHeader,
  QueryStatus,
  portalButtonOutline,
  portalInputClass,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSelectedRecord } from "@/hooks/useSelectedRecord";
import { applicationPaths } from "@/content/catalog";

const TYPES: { value: OpportunityType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "internship", label: "Internships" },
  { value: "program", label: "Programs" },
  { value: "challenge", label: "Challenges" },
  { value: "project_role", label: "Project roles" },
];

export default function AxiomPathways() {
  useDocumentTitle("Pathways");
  const { selectedId, notice } = useSelectedRecord();
  const [typeFilter, setTypeFilter] = useState<OpportunityType | "all">("all");
  const [search, setSearch] = useState("");
  const { data: opportunities, isLoading, error, refetch } = useOpportunities(selectedId);
  const { data: interests } = useOpportunityInterests();
  const toggle = useToggleOpportunityInterest();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return opportunities?.filter((opp) => {
      if (selectedId) return opp.id === selectedId;
      if (typeFilter !== "all" && opp.type !== typeFilter) return false;
      if (!q) return true;
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.organization.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q)
      );
    });
  }, [opportunities, typeFilter, search, selectedId]);

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
      {notice}
      <PortalPageHeader
        eyebrow="Opportunities"
        title="Real paths into the work"
        description="Current FinanceMeta applications and collaboration routes are separated from member-posted opportunities. Every public path below links to the canonical form and states what the form does — never a guaranteed place."
      />

      <section className="mb-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">Verified organization routes</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-foreground">Applications and collaboration</h2>
          </div>
          <span className="portal-muted hidden items-center gap-1.5 text-xs sm:flex"><ShieldCheck className="h-3.5 w-3.5" /> Reviewed 19 Sep 2026</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applicationPaths.map((path) => (
            <PortalCard key={path.title} hover className="group flex min-h-72 flex-col p-6">
              <div className="flex items-center justify-between gap-3">
                <Badge className="border-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"><CheckCircle2 className="mr-1 h-3 w-3" /> {path.status}</Badge>
                <span className="portal-muted text-xs">{path.kind}</span>
              </div>
              <h3 className="mt-8 font-serif text-2xl font-semibold leading-tight text-foreground">{path.title}</h3>
              <p className="portal-muted mt-3 text-sm leading-relaxed">{path.description}</p>
              <a href={path.href} target="_blank" rel="noreferrer" className="mt-auto flex items-center justify-between border-t border-border pt-5 text-sm font-semibold text-emerald-500">
                Open canonical form <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </PortalCard>
          ))}
        </div>
        <p className="portal-muted mt-4 text-xs">Submitting a form records interest or an application for review. It does not imply selection, placement, partnership, or employment.</p>
      </section>

      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">Member board</p>
        <h2 className="mt-1 font-serif text-2xl font-semibold text-foreground">Published opportunities</h2>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as OpportunityType | "all")}>
          <TabsList className="h-auto flex-wrap gap-1 bg-white/[0.04] p-1">
            {TYPES.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Input
          aria-label="Search opportunities"
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
        emptyMessage="No opportunities match your filters."
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
                      className={saved ? "bg-emerald-500 hover:bg-emerald-400" : "border-white/20 text-white"}
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
