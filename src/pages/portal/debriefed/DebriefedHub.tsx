import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { useNewsArticles } from "@/hooks/portal/useDebriefed";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

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
  const { data: bookmarks } = useNewsBookmarks();
  const toggleBookmark = useToggleNewsBookmark();

  return (
    <div>
      <PortalPageHeader
        eyebrow="Finance Debriefed"
        title="Finance article library"
        description="Curated articles organized by category, with publication dates and source links."
        action={
          <Link to={portalRoutes.debriefedExplainers}>
            <Button variant="outline" className={portalButtonOutline}>
              Explainers
            </Button>
          </Link>
        }
      />

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
