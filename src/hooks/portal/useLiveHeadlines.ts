import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { NewsCategory } from "@/types/domain";
import { mapNewsArticle } from "@/lib/mappers";

export interface LiveHeadline {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  category: NewsCategory;
  publishedAt: string;
  isLive: false;
}

async function fetchHeadlines(): Promise<LiveHeadline[]> {
  const { data, error } = await supabase
    .from("news_articles")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(8);
  if (error) throw error;
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

export function useLiveHeadlines(enabled = true) {
  return useQuery({
    queryKey: ["curated-headlines"],
    enabled,
    queryFn: fetchHeadlines,
    staleTime: 15 * 60_000,
    retry: 1,
  });
}
