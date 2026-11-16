import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import type { PublicationFields, PublicationState, PublicationTable } from "@/types/database";

export const publicationTypes = {
  news_articles: "News", explainer_cards: "Explainers", chapters: "Chapters",
  events: "Events", opportunities: "Opportunities", research_projects: "Research projects",
  intake_calls: "Application calls", studio_submissions: "Studio submissions",
  essay_submissions: "Essays", introduction_posts: "Introductions",
} satisfies Record<PublicationTable, string>;
export type PublicationRecord = PublicationFields & { id: string; [key: string]: unknown };

export function usePublicationQueue(table: PublicationTable) {
  const { user, profile } = useAuth();
  const result = useInfiniteQuery({
    queryKey: ["publication-queue", user?.id, table],
    enabled: Boolean(user && profile?.role === "admin"),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      let query = supabase.from(table).select("*").order("id").limit(26).abortSignal(signal);
      if (pageParam) query = query.gt("id", pageParam);
      const { data, error } = await query;
      if (error) throw error;
      const rows = (data ?? []).slice(0, 25) as PublicationRecord[];
      return { rows, next: data && data.length > 25 ? rows.at(-1)!.id : null };
    },
    getNextPageParam: page => page.next,
  });
  return { ...result, data: result.data?.pages.flatMap(page => page.rows) };
}

export function useReviewPublication() {
  const { user } = useAuth();
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (input: { userId: string; table: PublicationTable; row: PublicationRecord; state: PublicationState; note: string }) => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const session = data.session;
      if (!session?.access_token || session.user.id !== input.userId) {
        throw new Error("Your account changed. Sign in to the original account before reviewing content.");
      }
      const result = await supabase.rpc("review_publication", {
        content_table: input.table, content_id: input.row.id,
        expected_revision: input.row.publication_revision, next_state: input.state,
        review_note: input.note.trim(),
      }).setHeader("Authorization", `Bearer ${session.access_token}`);
      if (result.error) throw new Error(result.error.message);
      const receipt = result.data as PublicationRecord | null;
      if (receipt?.id !== input.row.id || receipt.publication_state !== input.state || receipt.publication_revision !== input.row.publication_revision + 1) {
        throw new Error("The review could not be confirmed. Reload the queue before trying again.");
      }
      return receipt;
    },
    onSuccess: () => client.invalidateQueries(),
  });
  return {
    isPending: mutation.isPending,
    review: (input: { table: PublicationTable; row: PublicationRecord; state: PublicationState; note: string }) => {
      if (!user) return Promise.reject(new Error("Sign in to review content."));
      return mutation.mutateAsync({ ...input, row: { ...input.row }, userId: user.id });
    },
  };
}
