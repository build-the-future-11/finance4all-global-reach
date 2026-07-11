import { Link } from "react-router-dom";
import { FlaskConical, MapPin, MessageSquare, Users } from "lucide-react";
import { useCommunityStats } from "@/hooks/portal/useCommunityStats";
import { portalRoutes } from "@/routes/portal";
import { PortalCard, SkeletonList } from "@/components/portal/PortalUI";
import { cn } from "@/lib/utils";

const items = [
  {
    label: "Members",
    key: "members" as const,
    href: portalRoutes.network,
    icon: Users,
    accent: "from-emerald-500/20 to-emerald-600/5 text-emerald-300",
  },
  {
    label: "Chapters",
    key: "chapters" as const,
    href: portalRoutes.events,
    icon: MapPin,
    accent: "from-blue-500/20 to-blue-600/5 text-blue-300",
  },
  {
    label: "Open labs",
    key: "openProjects" as const,
    href: portalRoutes.labs,
    icon: FlaskConical,
    accent: "from-amber-500/20 to-amber-600/5 text-amber-300",
  },
  {
    label: "Introductions",
    key: "introductions" as const,
    href: portalRoutes.network,
    icon: MessageSquare,
    accent: "from-purple-500/20 to-purple-600/5 text-purple-300",
  },
];

export default function CommunityPulse() {
  const { data: stats, isLoading, error, refetch } = useCommunityStats();

  if (isLoading) {
    return <SkeletonList count={4} />;
  }

  if (error) {
    return (
      <PortalCard className="p-4 text-sm text-white/60">
        Community stats are temporarily unavailable.{" "}
        <button type="button" className="text-emerald-400 hover:underline" onClick={() => refetch()}>
          Retry
        </button>
      </PortalCard>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const value = stats?.[item.key];
        return (
          <Link key={item.label} to={item.href}>
            <PortalCard hover className="group relative overflow-hidden p-4">
              <div
                className={cn(
                  "pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition group-hover:opacity-100",
                  item.accent,
                )}
              />
              <div className="relative flex items-center gap-3">
                <div className={cn("rounded-lg bg-gradient-to-br p-2", item.accent)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold tabular-nums text-white">{value ?? "—"}</p>
                  <p className="text-xs text-white/45">{item.label}</p>
                </div>
              </div>
            </PortalCard>
          </Link>
        );
      })}
    </div>
  );
}
