import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  useDigestPreferences,
  useNewsArticles,
  useUpdateDigestPreferences,
} from "@/hooks/portal/useDebriefed";
import { useNewsBookmarks, useToggleNewsBookmark } from "@/hooks/portal/useBookmarks";
import { portalRoutes } from "@/routes/portal";
import type { NewsCategory } from "@/types/domain";
import BookmarkButton from "@/components/portal/BookmarkButton";
import {
  CategoryBadge,
  PortalCard,
  PortalPageHeader,
  QueryStatus,
  portalButtonOutline,
} from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLiveHeadlines } from "@/hooks/portal/useLiveHeadlines";
import SubstackEmbed from "@/components/portal/SubstackEmbed";
import { DEBRIEFED_VISITED_KEY } from "@/components/portal/PortalOnboardingChecklist";
import { Badge } from "@/components/ui/badge";

const CATEGORIES: { value: NewsCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "macro", label: "Macro" },
  { value: "markets", label: "Markets" },
  { value: "ipo", label: "IPO" },
  { value: "company", label: "Company" },
];

export default function DebriefedHub() {
  useDocumentTitle("Debriefed");
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const { data: articles, isLoading, error, refetch } = useNewsArticles(category);
  const { data: prefs } = useDigestPreferences();
  const updatePrefs = useUpdateDigestPreferences();
  const { data: bookmarks } = useNewsBookmarks();
  const toggleBookmark = useToggleNewsBookmark();
  const { data: liveHeadlines } = useLiveHeadlines();

  useEffect(() => {
    localStorage.setItem(DEBRIEFED_VISITED_KEY, "1");
  }, []);

  const filteredLive =
    category === "all"
      ? liveHeadlines
      : liveHeadlines?.filter((h) => h.category === category);

  const handleDigestToggle = async (
    key: "weeklyDigestEnabled" | "substackSubscribed",
    value: boolean,
  ) => {
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
        eyebrow="Finance Debriefed"
        title="News & market pulse"
        description="Global macro updates, market movers, and IPO watchlists."
        action={
          <Link to={portalRoutes.debriefedExplainers}>
            <Button variant="outline" className={portalButtonOutline}>
              Explainers
            </Button>
          </Link>
        }
      />

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <PortalCard className="p-5">
          <h3 className="font-semibold text-white">Digest preferences</h3>
          <p className="mt-1 text-sm text-white/50">
            Save your preferences here — weekly email delivery is rolling out soon.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-white/70">Interested in weekly digest</span>
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

      <div className="mb-8">
        <SubstackEmbed />
      </div>

      {filteredLive && filteredLive.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Live market headlines</h2>
            <Badge className="border-0 bg-red-500/20 text-red-300">Live</Badge>
          </div>
          <div className="space-y-3">
            {filteredLive.map((headline) => (
              <PortalCard key={headline.id} hover className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CategoryBadge>{headline.category}</CategoryBadge>
                    <h3 className="mt-2 font-medium text-white">{headline.title}</h3>
                    {headline.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-white/55">{headline.summary}</p>
                    )}
                  </div>
                  <a href={headline.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className={portalButtonOutline}>
                      Read <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </PortalCard>
            ))}
          </div>
        </section>
      )}

      <Tabs
        value={category}
        onValueChange={(v) => setCategory(v as NewsCategory | "all")}
        className="mb-6"
      >
        <TabsList className="h-auto flex-wrap gap-1 bg-white/[0.04] p-1">
          {CATEGORIES.map((c) => (
            <TabsTrigger
              key={c.value}
              value={c.value}
              className="rounded-lg data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300"
            >
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <QueryStatus
        isLoading={isLoading}
        error={error}
        isEmpty={!articles?.length}
        emptyMessage="No articles in this category yet."
        onRetry={() => refetch()}
      >
        <div className="space-y-4">
          {articles?.map((article) => (
            <PortalCard key={article.id} hover className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryBadge>{article.category}</CategoryBadge>
                    {article.tags.map((tag) => (
                      <span key={tag} className="text-xs text-white/35">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-2.5 text-lg font-semibold leading-snug text-white">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{article.summary}</p>
                  <p className="mt-2 text-xs text-white/35">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <BookmarkButton
                    saved={bookmarks?.has(article.id) ?? false}
                    loading={toggleBookmark.isPending}
                    label="Save"
                    onToggle={() =>
                      toggleBookmark.mutateAsync({
                        articleId: article.id,
                        saved: bookmarks?.has(article.id) ?? false,
                      })
                    }
                  />
                  {article.sourceUrl && (
                    <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className={portalButtonOutline}>
                        Source <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </PortalCard>
          ))}
        </div>
      </QueryStatus>
    </div>
  );
}
