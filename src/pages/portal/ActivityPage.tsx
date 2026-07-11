import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Sparkles,
} from "lucide-react";
import { PORTAL_DISCOVERY_ITEMS } from "@/lib/portalDiscovery";
import { useActivityFeed, type ActivityItem } from "@/hooks/portal/useActivityFeed";
import PortalDiscoveryRail from "@/components/portal/PortalDiscoveryRail";
import {
  ACTIVITY_ICONS,
  EmptyState,
  PortalPageHeader,
  PortalCard,
  QueryStatus,
} from "@/components/portal/PortalUI";
import { portalRoutes } from "@/routes/portal";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { portalCopy } from "@/lib/portalCopy";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";
import InterestPillBar from "@/components/portal/InterestPillBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterType = "all" | ActivityItem["type"];

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "news", label: "News" },
  { id: "saved_article", label: "Saved" },
  { id: "lab_application", label: "Labs" },
  { id: "connection", label: "Network" },
  { id: "event", label: "Events" },
];

function groupByDay(items: ActivityItem[]) {
  const groups = new Map<string, ActivityItem[]>();
  for (const item of items) {
    const key = new Date(item.timestamp).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(item);
  }
  return [...groups.entries()];
}

export default function ActivityPage() {
  useDocumentTitle("Activity");
  const [filter, setFilter] = useState<FilterType>("all");
  const { data: activity, isLoading, error, refetch } = useActivityFeed(30);

  const filtered = useMemo(() => {
    if (!activity) return [];
    if (filter === "all") return activity;
    return activity.filter((a) => a.type === filter);
  }, [activity, filter]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  return (
    <div className="space-y-6">
      <PortalAnimatedSection>
        <PortalPageHeader
          eyebrow={portalCopy.activity.eyebrow}
          title={portalCopy.activity.title}
          description={portalCopy.activity.description}
        />
      </PortalAnimatedSection>

      <PortalAnimatedSection delay={40}>
        <InterestPillBar />
      </PortalAnimatedSection>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const Icon = f.id === "all" ? Sparkles : ACTIVITY_ICONS[f.id as ActivityItem["type"]];
          return (
            <Button
              key={f.id}
              size="sm"
              variant={filter === f.id ? "default" : "outline"}
              className={cn(
                filter === f.id
                  ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                  : "border-white/15 bg-white/5 text-white/60",
              )}
              onClick={() => setFilter(f.id)}
            >
              {Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
              {f.label}
            </Button>
          );
        })}
      </div>

      {filter === "all" && (
        <p className="text-sm text-white/50">{portalCopy.activity.filterAll}</p>
      )}

      <QueryStatus
        isLoading={isLoading}
        error={error}
        isEmpty={false}
        onRetry={() => refetch()}
        skeletonCount={4}
      >
        {filtered.length === 0 ? (
          <EmptyState
            message={portalCopy.activity.empty}
            icon={Bookmark}
            action={
              <div className="mt-4 w-full max-w-2xl">
                <PortalDiscoveryRail items={PORTAL_DISCOVERY_ITEMS} columns={2} />
              </div>
            }
          />
        ) : (
          <div className="space-y-6">
            {grouped.map(([day, items]) => (
              <section key={day}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  {day}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => {
                    const Icon = ACTIVITY_ICONS[item.type];
                    return (
                      <Link key={item.id} to={item.link}>
                        <PortalCard hover className="flex items-center gap-4 p-4">
                          <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-300">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white">{item.title}</p>
                            <p className="text-sm text-white/50">{item.description}</p>
                          </div>
                          <span className="shrink-0 text-xs text-white/35">
                            {new Date(item.timestamp).toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </PortalCard>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </QueryStatus>
    </div>
  );
}
