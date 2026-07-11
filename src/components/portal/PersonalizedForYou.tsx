import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePersonalizedRecommendations } from "@/hooks/portal/usePersonalizedRecommendations";
import { portalRoutes } from "@/routes/portal";
import { portalCopy } from "@/lib/portalCopy";
import { PortalCard, SkeletonList } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const accentMap = {
  emerald: "from-emerald-500/20 to-emerald-600/5 text-emerald-300",
  blue: "from-blue-500/20 to-blue-600/5 text-blue-300",
  amber: "from-amber-500/20 to-amber-600/5 text-amber-300",
  purple: "from-purple-500/20 to-purple-600/5 text-purple-300",
};

export default function PersonalizedForYou() {
  const { profile } = useAuth();
  const { items, isLoading, error } = usePersonalizedRecommendations(4);

  if (!profile?.interests?.length) {
    return (
      <PortalCard className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              {portalCopy.personalized.noInterestsTitle}
            </p>
            <p className="mt-1 max-w-lg text-sm text-white/50">{portalCopy.personalized.noInterests}</p>
          </div>
          <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white">
            <Link to={portalRoutes.settings}>Add interests</Link>
          </Button>
        </div>
      </PortalCard>
    );
  }

  if (isLoading) {
    return <SkeletonList count={2} />;
  }

  if (error) {
    return (
      <PortalCard className="p-6">
        <p className="text-sm text-white/50">{portalCopy.personalized.loadError}</p>
      </PortalCard>
    );
  }

  if (!items.length) {
    return (
      <PortalCard className="p-6">
        <p className="text-sm text-white/50">{portalCopy.personalized.learning}</p>
      </PortalCard>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">{portalCopy.personalized.title}</h2>
        <span className="text-xs text-white/40">
          Based on {profile.interests.slice(0, 3).join(", ")}
          {profile.interests.length > 3 ? "…" : ""}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.id} to={item.href}>
              <PortalCard hover className="group h-full overflow-hidden p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "rounded-lg bg-gradient-to-br p-2 ring-1 ring-white/10",
                      accentMap[item.accent],
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium text-white group-hover:text-emerald-100">
                      {item.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-white/45">{item.description}</p>
                    <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-emerald-400/80">
                      {item.reason}
                    </p>
                  </div>
                </div>
              </PortalCard>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
