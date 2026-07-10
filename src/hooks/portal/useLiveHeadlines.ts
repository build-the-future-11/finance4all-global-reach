import { useQuery } from "@tanstack/react-query";
import type { NewsCategory } from "@/types/domain";

export interface LiveHeadline {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  category: NewsCategory;
  publishedAt: string;
  isLive: true;
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
    .map((a, i) => ({
      id: `live-${i}-${a.url}`,
      title: a.title!,
      summary: a.description?.slice(0, 200) ?? "",
      sourceUrl: a.url!,
      category: guessCategory(a.title!, a.description ?? ""),
      publishedAt: a.publishedAt ?? new Date().toISOString(),
      isLive: true as const,
    }));
}

export function useLiveHeadlines(enabled = true) {
  return useQuery({
    queryKey: ["live-headlines"],
    enabled: enabled && Boolean(import.meta.env.VITE_NEWSAPI_KEY),
    queryFn: fetchNewsApiHeadlines,
    staleTime: 15 * 60_000,
    retry: 1,
  });
}
