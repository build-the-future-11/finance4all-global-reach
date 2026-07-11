import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { NewsCategory } from "@/types/domain";
import { mapNewsArticle } from "@/lib/mappers";
import { sanitizeUrl } from "@/lib/security";

export interface LiveHeadline {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  category: NewsCategory;
  publishedAt: string;
  isLive: boolean;
}

const CATEGORY_KEYWORDS: Record<NewsCategory, string[]> = {
  macro: ["fed", "inflation", "gdp", "central bank", "treasury", "rate"],
  markets: ["stock", "s&p", "nasdaq", "market", "trading", "bond"],
  ipo: ["ipo", "listing", "public offering"],
  company: ["earnings", "revenue", "ceo", "company", "merger"],
};

function guessCategory(title: string, description: string): NewsCategory {
  const text = `${title} ${description}`.toLowerCase();
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS) as [NewsCategory, string[]][]) {
    if (words.some((w) => text.includes(w))) return cat;
  }
  return "markets";
}

async function fetchNewsApiHeadlines(): Promise<LiveHeadline[]> {
  // NewsAPI key is optional and exposed in the client bundle when set.
  // Prefer Supabase-curated news_articles (fallback below) in production.
  const key = import.meta.env.VITE_NEWSAPI_KEY?.trim();
  if (!key) return [];

  const res = await fetch(
    `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=10&apiKey=${key}`,
  );
  if (!res.ok) return [];

  const json = (await res.json()) as {
    articles?: Array<{
      title?: string;
      description?: string;
      url?: string;
      publishedAt?: string;
    }>;
  };

  return (json.articles ?? [])
    .filter((a) => a.title && a.url && a.title !== "[Removed]")
    .slice(0, 8)
    .map((a, i) => {
      const safeUrl = sanitizeUrl(a.url!) ?? `/portal/debriefed`;
      return {
        id: `live-${i}-${safeUrl}`,
        title: a.title!.slice(0, 300),
        summary: (a.description ?? "").slice(0, 200),
        sourceUrl: safeUrl,
        category: guessCategory(a.title!, a.description ?? ""),
        publishedAt: a.publishedAt ?? new Date().toISOString(),
        isLive: true,
      };
    });
}

async function fetchFallbackHeadlines(): Promise<LiveHeadline[]> {
  const { data, error } = await supabase
    .from("news_articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(8);
  if (error || !data?.length) return [];
  return data.map((row) => {
    const article = mapNewsArticle(row);
    return {
      id: `curated-${article.id}`,
      title: article.title,
      summary: article.summary,
      sourceUrl: article.sourceUrl ?? `/portal/debriefed?article=${article.id}`,
      category: article.category,
      publishedAt: article.publishedAt,
      isLive: false,
    };
  });
}

async function fetchHeadlines(): Promise<LiveHeadline[]> {
  const live = await fetchNewsApiHeadlines();
  if (live.length > 0) return live;
  return fetchFallbackHeadlines();
}

export function useLiveHeadlines(enabled = true) {
  return useQuery({
    queryKey: ["live-headlines"],
    enabled,
    queryFn: fetchHeadlines,
    staleTime: 15 * 60_000,
    retry: 1,
  });
}
