import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import type { NewsArticle, NewsCategory } from "@/types/domain";
import BookmarkButton from "@/components/portal/BookmarkButton";
import {
  CategoryBadge,
  PortalCard,
  PortalPageHeader,
  PortalDialogContent,
  PortalTabsList,
  PortalTabsTrigger,
  QueryStatus,
  portalButtonOutline,
} from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";
import { useLiveHeadlines } from "@/hooks/portal/useLiveHeadlines";
import SubstackEmbed from "@/components/portal/SubstackEmbed";
import { DEBRIEFED_VISITED_KEY } from "@/components/portal/PortalOnboardingChecklist";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InterestPillBar from "@/components/portal/InterestPillBar";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";
import PersonalizedForYou from "@/components/portal/PersonalizedForYou";
import { portalCopy } from "@/lib/portalCopy";
import { sanitizeUrl } from "@/lib/security";
import { DEBRIEF_DISCLAIMER } from "@/lib/debriefPublish";

const CATEGORIES: { value: NewsCategory | "all"; label: string }[] = [
  { value: "all", label: portalCopy.debriefed.categories.all },
  { value: "macro", label: portalCopy.debriefed.categories.macro },
  { value: "markets", label: portalCopy.debriefed.categories.markets },
  { value: "ipo", label: portalCopy.debriefed.categories.ipo },
  { value: "company", label: portalCopy.debriefed.categories.company },
];

export default function DebriefedHub() {
  useDocumentTitle("Debriefed");
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [collection, setCollection] = useState<"all" | "newsletter">("all");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const { data: articles, isLoading, error, refetch } = useNewsArticles(category);
  const { data: prefs } = useDigestPreferences();
  const updatePrefs = useUpdateDigestPreferences();
  const { data: bookmarks } = useNewsBookmarks();
  const toggleBookmark = useToggleNewsBookmark();
  const { data: liveHeadlines } = useLiveHeadlines();

  useEffect(() => {
    localStorage.setItem(DEBRIEFED_VISITED_KEY, "1");
  }, []);

  useEffect(() => {
    const articleId = searchParams.get("article");
    if (!articleId || !articles?.length) return;
    const found = articles.find((a) => a.id === articleId);
    if (found) setSelectedArticle(found);
  }, [searchParams, articles]);

  const openArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setSearchParams({ article: article.id }, { replace: true });
  };

  const closeArticle = () => {
    setSelectedArticle(null);
    setSearchParams({}, { replace: true });
  };

  const filteredLive =
    category === "all"
      ? liveHeadlines
      : liveHeadlines?.filter((h) => h.category === category);

  const trendingTags = useMemo(() => {
    const counts = new Map<string, number>();
    articles?.forEach((a) => a.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag]) => tag);
  }, [articles]);

  const topics = useMemo(() => {
    const set = new Set<string>();
    articles?.forEach((a) => a.topics?.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [articles]);

  const regions = useMemo(() => {
    const set = new Set<string>();
    articles?.forEach((a) => a.regions?.forEach((r) => set.add(r)));
    return [...set].sort();
  }, [articles]);

  const displayArticles = useMemo(() => {
    return (articles ?? []).filter((a) => {
      if (collection === "newsletter" && !a.newsletterInclude) return false;
      if (topicFilter !== "all" && !(a.topics ?? []).includes(topicFilter)) return false;
      if (regionFilter !== "all" && !(a.regions ?? []).includes(regionFilter)) return false;
      return true;
    });
  }, [articles, collection, topicFilter, regionFilter]);

  const handleDigestToggle = async (
    value: boolean,
  ) => {
    try {
      await updatePrefs.mutateAsync({ weeklyDigestEnabled: value });
      toast.success("Preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    }
  };

  return (
    <div className="space-y-6">
      <PortalAnimatedSection>
        <PortalPageHeader
          eyebrow={portalCopy.debriefed.eyebrow}
          title={portalCopy.debriefed.title}
          description={`${portalCopy.debriefed.description} ${DEBRIEF_DISCLAIMER}`}
          action={
            <Link to={portalRoutes.debriefedExplainers}>
              <Button variant="outline" className={portalButtonOutline}>
                Explainers
              </Button>
            </Link>
          }
        />
      </PortalAnimatedSection>

      <PortalAnimatedSection delay={40}>
        <InterestPillBar />
      </PortalAnimatedSection>

      <PortalAnimatedSection delay={60}>
        <PersonalizedForYou />
      </PortalAnimatedSection>

      <div className="grid gap-4 lg:grid-cols-2">
        <PortalCard className="p-5">
          <h3 className="font-semibold text-white">Digest preferences</h3>
          <p className="mt-1 text-sm text-white/50">{portalCopy.debriefed.digestNote}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-white/70">Interested in weekly digest</span>
            <Switch
              checked={prefs?.weeklyDigestEnabled ?? false}
              disabled={updatePrefs.isPending}
              onCheckedChange={handleDigestToggle}
            />
          </div>
        </PortalCard>
        <PortalCard className="p-5">
          <h3 className="font-semibold text-white">Substack</h3>
          <p className="mt-1 text-sm text-white/55">Read and subscribe to the public Finance Debriefed publication on Substack.</p>
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
            <h2 className="text-lg font-semibold text-white">Market headlines</h2>
            <Badge className={filteredLive[0]?.isLive ? "border-0 bg-red-500/20 text-red-300" : "border-0 bg-emerald-500/20 text-emerald-300"}>
              {filteredLive[0]?.isLive ? "Live" : "Curated"}
            </Badge>
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
                  {sanitizeUrl(headline.sourceUrl) && (
                    <a href={sanitizeUrl(headline.sourceUrl)!} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className={portalButtonOutline}>
                        Read <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                </div>
              </PortalCard>
            ))}
          </div>
        </section>
      )}

      <Tabs
        value={category}
        onValueChange={(v) => setCategory(v as NewsCategory | "all")}
        className="mb-4"
      >
        <PortalTabsList>
          {CATEGORIES.map((c) => (
            <PortalTabsTrigger key={c.value} value={c.value}>
              {c.label}
            </PortalTabsTrigger>
          ))}
        </PortalTabsList>
      </Tabs>

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          aria-label="Collection"
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
          value={collection}
          onChange={(e) => setCollection(e.target.value as "all" | "newsletter")}
        >
          <option value="all">All published</option>
          <option value="newsletter">Newsletter archive</option>
        </select>
        <select
          aria-label="Filter by topic"
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
        >
          <option value="all">All topics</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by region"
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
        >
          <option value="all">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {trendingTags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-white/40">Trending</span>
          {trendingTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/55"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <QueryStatus
        isLoading={isLoading}
        error={error}
        isEmpty={!displayArticles.length}
        emptyMessage={
          collection === "newsletter"
            ? "No newsletter editions yet. When editors mark articles for the digest, they appear here."
            : portalCopy.debriefed.emptyArticles
        }
        onRetry={() => refetch()}
      >
        <div className="space-y-4">
          {displayArticles.map((article) => (
            <PortalCard key={article.id} hover className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryBadge>{article.category}</CategoryBadge>
                    {article.newsletterInclude && (
                      <Badge variant="outline" className="border-emerald-400/30 text-emerald-200">
                        Newsletter
                      </Badge>
                    )}
                    {article.tags.map((tag) => (
                      <span key={tag} className="text-xs text-white/35">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => openArticle(article)}
                    className="mt-2.5 text-left text-lg font-semibold leading-snug text-white hover:text-emerald-200"
                  >
                    {article.title}
                  </button>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{article.summary}</p>
                  <p className="mt-2 text-xs text-white/35">
                    {new Date(article.publishedAt).toLocaleDateString()}
                    {(article.topics?.length || article.regions?.length) ? (
                      <>
                        {" · "}
                        {[...(article.topics ?? []), ...(article.regions ?? [])].slice(0, 4).join(", ")}
                      </>
                    ) : null}
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
                  {sanitizeUrl(article.sourceUrl ?? "") && (
                    <a href={sanitizeUrl(article.sourceUrl ?? "")!} target="_blank" rel="noopener noreferrer">
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

      <Dialog open={Boolean(selectedArticle)} onOpenChange={(open) => !open && closeArticle()}>
        <PortalDialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {selectedArticle && (
            <>
              <DialogHeader>
                <CategoryBadge>{selectedArticle.category}</CategoryBadge>
                <DialogTitle className="mt-2 text-left text-white">{selectedArticle.title}</DialogTitle>
              </DialogHeader>
              <p className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs leading-relaxed text-amber-100/80">
                {DEBRIEF_DISCLAIMER}
              </p>
              <p className="text-sm leading-relaxed text-white/65">{selectedArticle.summary}</p>
              {selectedArticle.body ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">{selectedArticle.body}</p>
              ) : null}
              <p className="text-xs text-white/35">
                {new Date(selectedArticle.publishedAt).toLocaleString()}
                {selectedArticle.aiAssisted ? " · AI-assisted (editor-reviewed)" : ""}
              </p>
              {selectedArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags.map((tag) => (
                    <span key={tag} className="text-xs text-white/40">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {sanitizeUrl(selectedArticle.sourceUrl ?? "") ? (
                <a href={sanitizeUrl(selectedArticle.sourceUrl ?? "")!} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className={portalButtonOutline}>
                    Read original source <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              ) : (
                <p className="text-xs text-white/40">Source attribution is managed through the approved-source registry.</p>
              )}
            </>
          )}
        </PortalDialogContent>
      </Dialog>
    </div>
  );
}
