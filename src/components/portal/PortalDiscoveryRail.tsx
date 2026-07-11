import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { PortalCard } from "@/components/portal/PortalUI";
import { cn } from "@/lib/utils";
import { portalCopy } from "@/lib/portalCopy";

export interface DiscoveryItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent?: "emerald" | "blue" | "amber" | "purple" | "rose";
}

const accentMap = {
  emerald: "from-emerald-500/25 to-emerald-600/5 text-emerald-300 ring-emerald-400/20",
  blue: "from-blue-500/25 to-blue-600/5 text-blue-300 ring-blue-400/20",
  amber: "from-amber-500/25 to-amber-600/5 text-amber-300 ring-amber-400/20",
  purple: "from-purple-500/25 to-purple-600/5 text-purple-300 ring-purple-400/20",
  rose: "from-rose-500/25 to-rose-600/5 text-rose-300 ring-rose-400/20",
};

interface PortalDiscoveryRailProps {
  title?: string;
  items: DiscoveryItem[];
  columns?: 2 | 3 | 4;
}

export default function PortalDiscoveryRail({
  title = portalCopy.discovery.title,
  items,
  columns = 3,
}: PortalDiscoveryRailProps) {
  const gridClass =
    columns === 4
      ? "sm:grid-cols-2 xl:grid-cols-4"
      : columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">{title}</h3>
      <div className={cn("grid gap-3", gridClass)}>
        {items.map((item) => {
          const Icon = item.icon;
          const accent = accentMap[item.accent ?? "emerald"];
          return (
            <Link key={item.href} to={item.href}>
              <PortalCard hover className="group relative h-full overflow-hidden p-4">
                <div
                  className={cn(
                    "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-70 blur-2xl transition group-hover:opacity-100",
                    accent.split(" ")[0],
                    accent.split(" ")[1],
                  )}
                />
                <div className="relative flex items-start gap-3">
                  <div
                    className={cn(
                      "rounded-xl bg-gradient-to-br p-2.5 ring-1",
                      accent,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white group-hover:text-emerald-100">{item.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-white/45">
                      {item.description}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-emerald-400" />
                </div>
              </PortalCard>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
