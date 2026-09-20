import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpenText, Clock3, ExternalLink } from "lucide-react";
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
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSelectedRecord } from "@/hooks/useSelectedRecord";
import { featuredExplainers } from "@/content/editorial";

const CATEGORIES: { value: NewsCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "macro", label: "Macro" },
  { value: "markets", label: "Markets" },
  { value: "ipo", label: "IPO" },
  { value: "company", label: "Company" },
];

export default function DebriefedHub() {
  useDocumentTitle("Debriefed");
  const { selectedId, notice } = useSelectedRecord();
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const { data: articles, isLoading, error, refetch } = useNewsArticles(category, selectedId);
  const { data: prefs } = useDigestPreferences();
  const updatePrefs = useUpdateDigestPreferences();
  const { data: bookmarks } = useNewsBookmarks();
  const toggleBookmark = useToggleNewsBookmark();

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
      {notice}
      <PortalPageHeader
        eyebrow="Finance Debriefed"
        title="Understand the story, not just the headline."
        description="Long-form finance and economics explainers with mechanisms, definitions, primary sources, and the assumptions that could make an interpretation wrong."
        action={
          <Link to={portalRoutes.debriefedExplainers}>
            <Button variant="outline" className={portalButtonOutline}>
              Explainers
            </Button>
          </Link>
        }
      />

      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Editorial desk</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">Featured deep reads</h2>
          </div>
          <Link className="portal-muted hidden items-center gap-1 text-xs font-semibold sm:flex" to={portalRoutes.debriefedExplainers}>
            Browse the library <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {featuredExplainers.map((article, index) => (
            <Link
              key={article.slug}
              to={`${portalRoutes.debriefedExplainers}/${article.slug}`}
              className={index === 0 ? "lg:col-span-2" : undefined}
            >
              <PortalCard hover className="group flex h-full min-h-64 flex-col overflow-hidden p-6">
                <div className="flex items-center justify-between gap-3">
                  <CategoryBadge>{article.difficulty}</CategoryBadge>
                  <span className="portal-muted inline-flex items-center gap-1 text-xs"><Clock3 className="h-3.5 w-3.5" /> {article.readMinutes} min</span>
                </div>
                <BookOpenText className="mt-8 h-6 w-6 text-emerald-400" />
                <h3 className="mt-4 max-w-2xl font-serif text-2xl font-semibold leading-tight text-foreground transition group-hover:text-emerald-500">
                  {article.title}
                </h3>
                <p className="portal-muted mt-3 text-sm leading-relaxed">{article.summary}</p>
                <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-emerald-500">Read the full guide <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </PortalCard>
            </Link>
          ))}
        </div>
      </section>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <PortalCard className="p-5">
          <h3 className="font-semibold text-foreground">Weekly digest</h3>
          <p className="portal-muted mt-1 text-sm">A curated roundup when a reviewed issue is published.</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-white/70">Enable weekly email digest</span>
            <Switch
              aria-label="Enable weekly email digest"
              checked={prefs?.weeklyDigestEnabled ?? false}
              onCheckedChange={(v) => handleDigestToggle("weeklyDigestEnabled", v)}
            />
          </div>
        </PortalCard>
        <PortalCard className="p-5">
          <h3 className="font-semibold text-foreground">Substack archive</h3>
          <p className="portal-muted mt-1 text-sm">Read the external Finance Debriefed publication archive.</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-white/70">I'm subscribed</span>
            <Switch
              aria-label="Confirm Substack subscription"
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
                  <h3 className="mt-2.5 text-lg font-semibold leading-snug text-foreground">
                    {article.title}
                  </h3>
                  <p className="portal-muted mt-2 text-sm leading-relaxed">{article.summary}</p>
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
