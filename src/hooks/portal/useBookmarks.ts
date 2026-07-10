import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mapNewsArticle, mapResearchProject } from "@/lib/mappers";
import { useAuth } from "@/contexts/AuthContext";

export function useNewsBookmarks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["news-bookmarks", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_bookmarks")
        .select("article_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set(data.map((r) => r.article_id));
    },
  });
}

export function useToggleNewsBookmark() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ articleId, saved }: { articleId: string; saved: boolean }) => {
      if (saved) {
        const { error } = await supabase
          .from("news_bookmarks")
          .delete()
          .eq("user_id", user!.id)
          .eq("article_id", articleId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news_bookmarks").insert({
          user_id: user!.id,
          article_id: articleId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news-bookmarks"] });
      qc.invalidateQueries({ queryKey: ["saved-articles"] });
    },
  });
}

export function useSavedArticles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved-articles", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_bookmarks")
        .select("article_id, created_at, news_articles(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data
        .filter((row) => row.news_articles)
        .map((row) => ({
          savedAt: row.created_at,
          article: mapNewsArticle(row.news_articles as Parameters<typeof mapNewsArticle>[0]),
        }));
    },
  });
}

export function useProjectBookmarks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["project-bookmarks", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_bookmarks")
        .select("project_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set(data.map((r) => r.project_id));
    },
  });
}

export function useToggleProjectBookmark() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, saved }: { projectId: string; saved: boolean }) => {
      if (saved) {
        const { error } = await supabase
          .from("project_bookmarks")
          .delete()
          .eq("user_id", user!.id)
          .eq("project_id", projectId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("project_bookmarks").insert({
          user_id: user!.id,
          project_id: projectId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project-bookmarks"] }),
  });
}

export function useSavedProjects() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved-projects", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_bookmarks")
        .select("project_id, created_at, research_projects(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data
        .filter((row) => row.research_projects)
        .map((row) => ({
          savedAt: row.created_at,
          project: mapResearchProject(
            row.research_projects as Parameters<typeof mapResearchProject>[0],
          ),
        }));
    },
  });
}
