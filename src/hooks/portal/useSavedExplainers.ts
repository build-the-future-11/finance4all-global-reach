import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import { withDeadline } from "@/lib/asyncDeadline";
import { editorialExplainers } from "@/content/editorial";

function savedSlugs(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 100) : [];
}

export function useSavedExplainers() {
  const { user } = useAuth();
  const client = useQueryClient();
  const saved = useQuery({
    queryKey: ["saved-explainers", user?.id],
    enabled: Boolean(user),
    initialData: savedSlugs(user?.user_metadata?.saved_explainer_slugs),
    initialDataUpdatedAt: 0,
    queryFn: async () => {
      const { data, error } = await withDeadline(() => supabase.auth.getUser(), 15000, "Reading saved guides");
      if (error) throw error;
      if (data.user?.id !== user?.id) throw new Error("Your session changed. Please sign in again.");
      return savedSlugs(data.user?.user_metadata?.saved_explainer_slugs);
    },
  });
  const slugs = user ? saved.data : [];
  const mutation = useMutation({
    mutationFn: async ({ slug, userId }: { slug: string; userId: string }) => {
      if (!userId) throw new Error("Sign in to save this guide.");
      if (!editorialExplainers.some(article => article.slug === slug)) throw new Error("This guide is not available to save.");
      await client.cancelQueries({ queryKey: ["saved-explainers", userId], exact: true });
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const session = sessionData.session;
      if (!session?.access_token || session.user.id !== userId) throw new Error("Your session changed. Please sign in again.");
      // Reduce stale writes by reading current metadata. Concurrent tab writes are
      // still last-write-wins; authorization never depends on this preference.
      const { data: current, error: readError } = await withDeadline(() => supabase.auth.getUser(session.access_token), 15000, "Reading saved guides");
      if (readError) throw readError;
      if (current.user?.id !== userId) throw new Error("Your session changed. Please sign in again.");
      const existing = savedSlugs(current.user.user_metadata?.saved_explainer_slugs);
      const next = existing.includes(slug) ? existing.filter(s => s !== slug) : [...existing, slug].slice(-100);
      // Use the verified account's token throughout the write, even when the
      // shared Auth client's current session changes while the read is in flight.
      const controller = new AbortController();
      try {
        const receipt = await withDeadline(async () => {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`, {
            method: "PUT", signal: controller.signal,
            headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ data: { saved_explainer_slugs: next } }),
          });
          if (!response.ok) throw new Error("The guide could not be saved. Please try again.");
          return await response.json() as { id?: string; user_metadata?: { saved_explainer_slugs?: unknown } };
        }, 15000, "Saving guide");
        if (receipt.id !== userId || JSON.stringify(savedSlugs(receipt.user_metadata?.saved_explainer_slugs)) !== JSON.stringify(next)) throw new Error("The save could not be confirmed. Please try again.");
        client.setQueryData(["saved-explainers", userId], next);
        return next.includes(slug);
      } finally { controller.abort(); }
    },
  });
  const toggle = {
    ...mutation,
    // Keep the submitting account in mutation variables when offline mutations
    // are resumed after a render or account change.
    mutate: (slug: string, options?: Parameters<typeof mutation.mutate>[1]) => mutation.mutate({ slug, userId: user?.id ?? "" }, options),
    mutateAsync: (slug: string) => mutation.mutateAsync({ slug, userId: user?.id ?? "" }),
  };
  return { user, slugs, articles: editorialExplainers.filter(article => slugs.includes(article.slug)), toggle, error: saved.error };
}
