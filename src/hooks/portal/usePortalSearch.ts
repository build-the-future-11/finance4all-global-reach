import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { portalRoutes } from "@/routes/portal";

export interface SearchResult {
  id: string;
  type: "news" | "lab" | "opportunity" | "event" | "member" | "explainer";
  title: string;
  subtitle?: string;
  href: string;
}

export function searchFilter(columns: string[], query: string): string {
  if (query.length > 128 || [...query].some((character) => character.charCodeAt(0) < 32 || character === "*")) throw new Error("Use up to 128 characters without control characters or asterisks.");
  const pattern = `%${query.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;
  const quoted = `"${pattern.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  return columns.map((column) => `${column}.ilike.${quoted}`).join(",");
}

export function usePortalSearch(query: string) {
  const q = query.trim().toLowerCase();

  return useQuery({
    queryKey: ["portal-search", q],
    enabled: q.length >= 2,
    queryFn: async ({ signal }): Promise<SearchResult[]> => {
      const [news, labs, opps, events, members, explainers] = await Promise.all([
        supabase.from("news_articles").select("id, title, summary").or(searchFilter(["title","summary"], q)).order("id").limit(20).abortSignal(signal),
        supabase.from("research_projects").select("id, title, description").neq("status", "draft").or(searchFilter(["title","description"], q)).order("id").limit(20).abortSignal(signal),
        supabase.from("opportunities").select("id, title, organization").eq("is_active", true).or(searchFilter(["title","organization"], q)).order("id").limit(20).abortSignal(signal),
        supabase.from("events").select("id, title, description").or(searchFilter(["title","description"], q)).order("id").limit(20).abortSignal(signal),
        supabase.from("profiles").select("id, display_name, bio").neq("display_name", "").or(searchFilter(["display_name","bio"], q)).order("id").limit(20).abortSignal(signal),
        supabase.from("explainer_cards").select("id, slug, title, summary").or(searchFilter(["title","summary"], q)).order("id").limit(20).abortSignal(signal),
      ]);

      if ([news, labs, opps, events, members, explainers].some((response) => response.error)) {
        throw new Error("Search is temporarily unavailable. Please retry.");
      }
      const results: SearchResult[] = [];

      news.data
        ?.filter((r) => r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q))
        .forEach((r) =>
          results.push({
            id: r.id,
            type: "news",
            title: r.title,
            subtitle: r.summary.slice(0, 80),
            href: portalRoutes.debriefed,
          }),
        );

      labs.data
        ?.filter((r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
        .forEach((r) =>
          results.push({
            id: r.id,
            type: "lab",
            title: r.title,
            subtitle: "Research project",
            href: `${portalRoutes.labs}/${r.id}`,
          }),
        );

      opps.data
        ?.filter((r) => r.title.toLowerCase().includes(q) || r.organization.toLowerCase().includes(q))
        .forEach((r) =>
          results.push({
            id: r.id,
            type: "opportunity",
            title: r.title,
            subtitle: r.organization,
            href: portalRoutes.pathways,
          }),
        );

      events.data
        ?.filter((r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
        .forEach((r) =>
          results.push({
            id: r.id,
            type: "event",
            title: r.title,
            subtitle: "Event",
            href: portalRoutes.events,
          }),
        );

      members.data
        ?.filter(
          (r) =>
            r.display_name.toLowerCase().includes(q) ||
            (r.bio?.toLowerCase().includes(q) ?? false),
        )
        .forEach((r) =>
          results.push({
            id: r.id,
            type: "member",
            title: r.display_name,
            subtitle: "Member",
            href: `${portalRoutes.networkProfile}/${r.id}`,
          }),
        );

      explainers.data
        ?.filter((r) => r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q))
        .forEach((r) =>
          results.push({
            id: r.id,
            type: "explainer",
            title: r.title,
            subtitle: "Explainer",
            href: `${portalRoutes.debriefedExplainers}/${r.slug}`,
          }),
        );

      return results.sort((a, b) => {
        const rank = (item: SearchResult) => item.title.toLowerCase() === q ? 0 : item.title.toLowerCase().startsWith(q) ? 1 : 2;
        return rank(a) - rank(b) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
      }).slice(0, 12);
    },
    staleTime: 10_000,
  });
}
