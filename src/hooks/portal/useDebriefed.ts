import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mapExplainer, mapNewsArticle } from "@/lib/mappers";
import type { NewsCategory } from "@/types/domain";

export function useNewsArticles(category?: NewsCategory | "all") {
  return useQuery({
    queryKey: ["news", category],
    queryFn: async () => {
      let q = supabase.from("news_articles").select("*").order("published_at", { ascending: false });
      if (category && category !== "all") q = q.eq("category", category);
      const { data, error } = await q;
      if (error) throw error;
      return data.map(mapNewsArticle);
    },
  });
}

export function useExplainers() {
  return useQuery({
    queryKey: ["explainers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("explainer_cards").select("*").order("title");
      if (error) throw error;
      return data.map(mapExplainer);
    },
  });
}

export function useExplainerBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["explainer", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("explainer_cards")
        .select("*")
        .eq("slug", slug!)
        .single();
      if (error) throw error;
      return mapExplainer(data);
    },
  });
}
