import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mapNewsArticle, mapResearchProject } from "@/lib/mappers";
import { useAuth } from "@/contexts/useAuth";
import { requireConfirmedRow } from "@/lib/confirmed-mutation";

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
  const mutation = useMutation({
    mutationFn: async ({ userId, articleId, saved }: { userId: string; articleId: string; saved: boolean }) => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const session = data.session;
      if (!session?.access_token || session.user.id !== userId) {
        throw new Error("Your account changed before this bookmark could be saved. Sign in to the original account and try again.");
      }
      const query = saved
        ? supabase
          .from("news_bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("article_id", articleId)
          .select("user_id,article_id")
          .maybeSingle()
        : supabase.from("news_bookmarks").insert({
          user_id: userId,
          article_id: articleId,
        }).select("user_id,article_id").single();
      // Keep the checked credentials even if the shared session changes while
      // this request is dispatched. Existing database ownership rules still apply.
      const result = await query.setHeader("Authorization", `Bearer ${session.access_token}`);
      const row = requireConfirmedRow(result, saved ? "Removing the saved article" : "Saving the article");
      if (row.user_id !== userId || row.article_id !== articleId) {
        throw new Error("The bookmark change for the original account could not be confirmed. Refresh and try again.");
      }
    },
    onSuccess: (_result, { userId }) => {
      qc.invalidateQueries({ queryKey: ["news-bookmarks", userId] });
      qc.invalidateQueries({ queryKey: ["saved-articles", userId] });
    },
  });
  return {
    isPending: mutation.isPending,
    mutateAsync: async ({ articleId, saved }: { articleId: string; saved: boolean }) => {
      if (!user) throw new Error("Sign in to save an article.");
      // Snapshot the owner, item and requested action before offline queuing.
      return mutation.mutateAsync({ userId: user.id, articleId, saved });
    },
  };
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
  const mutation = useMutation({
    mutationFn: async ({ userId, projectId, saved }: { userId: string; projectId: string; saved: boolean }) => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const session = data.session;
      if (!session?.access_token || session.user.id !== userId) {
        throw new Error("Your account changed before this bookmark could be saved. Sign in to the original account and try again.");
      }
      const query = saved
        ? supabase
          .from("project_bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("project_id", projectId)
          .select("user_id,project_id")
          .maybeSingle()
        : supabase.from("project_bookmarks").insert({
          user_id: userId,
          project_id: projectId,
        }).select("user_id,project_id").single();
      const result = await query.setHeader("Authorization", `Bearer ${session.access_token}`);
      const row = requireConfirmedRow(result, saved ? "Removing the saved project" : "Saving the project");
      if (row.user_id !== userId || row.project_id !== projectId) {
        throw new Error("The bookmark change for the original account could not be confirmed. Refresh and try again.");
      }
    },
    onSuccess: (_result, { userId }) => {
      qc.invalidateQueries({ queryKey: ["project-bookmarks", userId] });
      qc.invalidateQueries({ queryKey: ["saved-projects", userId] });
    },
  });
  return {
    isPending: mutation.isPending,
    mutateAsync: async ({ projectId, saved }: { projectId: string; saved: boolean }) => {
      if (!user) throw new Error("Sign in to save a project.");
      return mutation.mutateAsync({ userId: user.id, projectId, saved });
    },
  };
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
