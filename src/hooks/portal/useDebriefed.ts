import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  mapDigestPreference,
  mapExplainer,
  mapNewsArticle,
} from "@/lib/mappers";
import type { NewsCategory } from "@/types/domain";
import { useAuth } from "@/contexts/AuthContext";

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

export function useDigestPreferences() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["digest-preferences", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digest_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        return {
          userId: user!.id,
          weeklyDigestEnabled: false,
          substackSubscribed: false,
          preferredCategories: [] as NewsCategory[],
        };
      }
      return mapDigestPreference(data);
    },
  });
}

export function useUpdateDigestPreferences() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: {
      weeklyDigestEnabled?: boolean;
      substackSubscribed?: boolean;
      preferredCategories?: NewsCategory[];
    }) => {
      const { data: existing } = await supabase
        .from("digest_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      const { error } = await supabase.from("digest_preferences").upsert({
        user_id: user!.id,
        weekly_digest_enabled: prefs.weeklyDigestEnabled ?? existing?.weekly_digest_enabled ?? false,
        substack_subscribed: prefs.substackSubscribed ?? existing?.substack_subscribed ?? false,
        preferred_categories: prefs.preferredCategories ?? existing?.preferred_categories ?? [],
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["digest-preferences"] }),
  });
}
