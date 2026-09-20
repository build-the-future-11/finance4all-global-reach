import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import { withDeadline } from "@/lib/asyncDeadline";
import { editorialExplainers } from "@/content/editorial";

function savedSlugs(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 100) : [];
}

export function useSavedExplainers() {
  const { user } = useAuth();
  const slugs = savedSlugs(user?.user_metadata?.saved_explainer_slugs);
  const toggle = useMutation({
    mutationFn: async (slug: string) => {
      if (!user) throw new Error("Sign in to save this guide.");
      if (!editorialExplainers.some(article => article.slug === slug)) throw new Error("This guide is not available to save.");
      // Reduce stale writes by reading current metadata. Concurrent tab writes are
      // still last-write-wins; authorization never depends on this preference.
      const { data: current, error: readError } = await withDeadline(() => supabase.auth.getUser(), 15000, "Reading saved guides");
      if (readError) throw readError;
      if (current.user?.id !== user.id) throw new Error("Your session changed. Please sign in again.");
      const existing = savedSlugs(current.user.user_metadata?.saved_explainer_slugs);
      const next = existing.includes(slug) ? existing.filter(s => s !== slug) : [...existing, slug].slice(-100);
      const { data, error } = await withDeadline(() => supabase.auth.updateUser({ data: { saved_explainer_slugs: next } }), 15000, "Saving guide");
      if (error) throw error;
      if (JSON.stringify(savedSlugs(data.user?.user_metadata?.saved_explainer_slugs)) !== JSON.stringify(next)) throw new Error("The save could not be confirmed. Please try again.");
      return next.includes(slug);
    },
  });
  return { user, slugs, articles: editorialExplainers.filter(article => slugs.includes(article.slug)), toggle };
}
