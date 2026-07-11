import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { useNewsArticles } from "@/hooks/portal/useDebriefed";
import { useLiveHeadlines } from "@/hooks/portal/useLiveHeadlines";
import { portalRoutes } from "@/routes/portal";

const CATEGORY_LABELS: Record<string, string> = {
  macro: "Macro",
  markets: "Markets",
  ipo: "IPO",
  company: "Company",
};

export default function MarketPulseStrip() {
  const { data: articles, isLoading: articlesLoading } = useNewsArticles();
  const { data: live, isLoading: liveLoading } = useLiveHeadlines();

  if (articlesLoading && liveLoading) {
    return (
      <div className="h-16 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.03]" />
    );
  }

  const categoryCounts = (articles ?? []).reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1;
    return acc;
  }, {});

  const headline = live?.[0]?.title ?? articles?.[0]?.title;
  const isLive = live?.[0]?.isLive ?? false;

  return (
    <div className="portal-mesh-strip overflow-hidden rounded-2xl border border-white/[0.08]">
      <div className="flex items-stretch divide-x divide-white/[0.06] overflow-x-auto">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <Link
            key={key}
            to={portalRoutes.debriefed}
            className="flex min-w-[5.5rem] shrink-0 flex-col px-4 py-3 transition hover:bg-white/[0.03]"
          >
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
              {label}
            </span>
            <span className="mt-0.5 text-sm font-semibold tabular-nums text-white/80">
              {categoryCounts[key] ?? 0}
            </span>
            <span className="text-[10px] text-white/35">articles</span>
          </Link>
        ))}
        {headline && (
          <Link
            to={portalRoutes.debriefed}
            className="flex min-w-0 flex-1 items-center gap-2 px-4 py-3 transition hover:bg-white/[0.03]"
          >
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                isLive ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"
              }`}
            >
              {isLive ? "Live" : "Latest"}
            </span>
            <Newspaper className="h-3.5 w-3.5 shrink-0 text-white/35" />
            <span className="truncate text-sm text-white/70">{headline}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
