import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import { withDeadline } from "@/lib/asyncDeadline";
import { findPublishedDebriefed, publishedDebriefedArticles } from "@/content/debriefed";

export type ReadingEntry = { slug: string; section: string; completed: boolean; updatedAt: string };
type ReadingUpdate = Omit<ReadingEntry, "updatedAt">;
export function readingEntries(value: unknown): ReadingEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is ReadingEntry => {
    if (!entry || typeof entry !== "object") return false;
    const article = findPublishedDebriefed(entry.slug);
    return Boolean(article && article.slug === entry.slug && article.sections.some(section => section.id === entry.section) && typeof entry.completed === "boolean" && typeof entry.updatedAt === "string" && Number.isFinite(Date.parse(entry.updatedAt)));
  }).slice(-100);
}

// Like saved_explainer_slugs, this is private, non-sensitive Auth metadata. It
// grants no role or entitlement. Explicit writes avoid scroll-driven requests.
export function useReadingHistory() {
  const { user } = useAuth();
  const client = useQueryClient();
  const history = useQuery({
    queryKey: ["debriefed-reading", user?.id],
    enabled: Boolean(user),
    initialData: readingEntries(user?.user_metadata?.debriefed_reading_history),
    // Auth storage is a snapshot and pinned REST writes do not refresh it.
    // Always reconcile on mount, even with the app's longer staleTime default.
    initialDataUpdatedAt: 0,
    queryFn: async () => {
      const { data, error } = await withDeadline(() => supabase.auth.getUser(), 15000, "Reading history");
      if (error) throw error;
      if (data.user?.id !== user?.id) throw new Error("Your account changed. Sign in again.");
      return readingEntries(data.user?.user_metadata?.debriefed_reading_history);
    },
  });
  const entries = user ? history.data : [];
  const mutation = useMutation({
    mutationFn: async ({ input, userId }: { input: ReadingUpdate; userId: string }) => {
      if (!userId) throw new Error("Sign in to remember your reading position.");
      await client.cancelQueries({ queryKey: ["debriefed-reading", userId], exact: true });
      const entry = { ...input, updatedAt: new Date().toISOString() };
      if (!readingEntries([entry]).length) throw new Error("This reading position is not available.");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const session = sessionData.session;
      if (!session?.access_token || session.user.id !== userId) throw new Error("Your account changed. Sign in again.");
      const { data: current, error: readError } = await withDeadline(() => supabase.auth.getUser(session.access_token), 15000, "Reading history");
      if (readError) throw readError;
      if (current.user?.id !== userId) throw new Error("Your account changed. Sign in again before saving.");
      const next = [...readingEntries(current.user.user_metadata?.debriefed_reading_history).filter(item => item.slug !== input.slug), entry].slice(-100);
      // Pin the checked JWT for this write. Auth.updateUser uses the mutable
      // current session and could otherwise target an account switched mid-save.
      const controller = new AbortController();
      try {
        const receipt = await withDeadline(async () => {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`, {
            method: "PUT", signal: controller.signal,
            headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ data: { debriefed_reading_history: next } }),
          });
          if (!response.ok) throw new Error("Reading progress could not be saved. Try again.");
          return await response.json() as { id?: string; user_metadata?: { debriefed_reading_history?: unknown } };
        }, 15000, "Saving reading position");
        if (receipt.id !== userId || JSON.stringify(readingEntries(receipt.user_metadata?.debriefed_reading_history)) !== JSON.stringify(next)) throw new Error("Reading progress could not be confirmed. Try again.");
        client.setQueryData(["debriefed-reading", userId], next);
        return entry;
      } finally { controller.abort(); }
    },
  });
  const update = {
    ...mutation,
    // Preserve the submitted account and values while TanStack pauses an offline
    // mutation; a later render must not retarget it to another signed-in user.
    mutate: (input: ReadingUpdate, options?: Parameters<typeof mutation.mutate>[1]) => mutation.mutate({ input: { ...input }, userId: user?.id ?? "" }, options),
    mutateAsync: (input: ReadingUpdate) => mutation.mutateAsync({ input: { ...input }, userId: user?.id ?? "" }),
  };
  const continueReading = entries.filter(entry => !entry.completed).reverse().map(entry => ({ ...entry, article: publishedDebriefedArticles.find(article => article.slug === entry.slug)! }));
  return { user, entries, continueReading, update, error: history.error };
}
