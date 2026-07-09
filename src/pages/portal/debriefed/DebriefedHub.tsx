import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import {
  useDigestPreferences,
  useNewsArticles,
  useUpdateDigestPreferences,
} from "@/hooks/portal/useDebriefed";
import { portalRoutes } from "@/routes/portal";
import type { NewsCategory } from "@/types/domain";
import { EmptyState, LoadingState, PortalCard, PortalPageHeader } from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const CATEGORIES: { value: NewsCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "macro", label: "Macro" },
  { value: "markets", label: "Markets" },
  { value: "ipo", label: "IPO" },
  { value: "company", label: "Company" },
];

export default function DebriefedHub() {
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const { data: articles, isLoading, error } = useNewsArticles(category);
  const { data: prefs } = useDigestPreferences();
  const updatePrefs = useUpdateDigestPreferences();

  const handleDigestToggle = async (key: "weeklyDigestEnabled" | "substackSubscribed", value: boolean) => {
    try {
      await updatePrefs.mutateAsync({ [key]: value });
      toast.success("Preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    }
  };

  return (
    <div>
      <PortalPageHeader
        title="Finance Debriefed"
        description="Global macro updates, market movers, and IPO watchlists."
        action={
          <Link to={portalRoutes.debriefedExplainers}>
            <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
              Explainers
            </Button>
          </Link>
        }
      />

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <PortalCard className="p-5">
          <h3 className="font-semibold text-white">Weekly digest</h3>
          <p className="mt-1 text-sm text-white/55">Get a curated roundup of top stories.</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-white/70">Enable weekly email digest</span>
            <Switch
              checked={prefs?.weeklyDigestEnabled ?? false}
              onCheckedChange={(v) => handleDigestToggle("weeklyDigestEnabled", v)}
            />
          </div>
        </PortalCard>
        <PortalCard className="p-5">
          <h3 className="font-semibold text-white">Substack</h3>
          <p className="mt-1 text-sm text-white/55">Subscribe to Finance Debriefed on Substack.</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-white/70">I'm subscribed</span>
            <Switch
              checked={prefs?.substackSubscribed ?? false}
              onCheckedChange={(v) => handleDigestToggle("substackSubscribed", v)}
            />
          </div>
          <a
            href="https://financedebriefed.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-300 hover:underline"
          >
            Open Substack <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </PortalCard>
      </div>

      <Tabs value={category} onValueChange={(v) => setCategory(v as NewsCategory | "all")} className="mb-6">
        <TabsList className="bg-white/5">
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c.value} value={c.value} className="data-[state=active]:bg-white/15">
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading && <LoadingState />}
      {error && <EmptyState message="Could not load articles. Run the Supabase migration and seed." />}
      {articles && articles.length === 0 && <EmptyState message="No articles in this category yet." />}

      <div className="space-y-4">
        {articles?.map((article) => (
          <PortalCard key={article.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                    {article.category}
                  </Badge>
                  {article.tags.map((tag) => (
                    <span key={tag} className="text-xs text-white/40">#{tag}</span>
                  ))}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">{article.title}</h3>
                <p className="mt-2 text-sm text-white/60">{article.summary}</p>
                <p className="mt-2 text-xs text-white/40">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </p>
              </div>
              {article.sourceUrl && (
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="border-white/20 text-white">
                    Source <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              )}
            </div>
          </PortalCard>
        ))}
      </div>
    </div>
  );
}
