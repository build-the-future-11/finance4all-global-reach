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

export function searchFilter(columns: string[], query: string, tier: "all" | "exact" | "prefix" | "remaining" = "all"): string {
  if (query.length > 128 || [...query].some((character) => character.charCodeAt(0) < 32 || character === "*")) throw new Error("Use up to 128 characters without control characters or asterisks.");
  const pattern = `%${query.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;
  const quoted = `"${pattern.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  const exact = quoted.slice(0, 1) + quoted.slice(2, -2) + quoted.slice(-1);
  const prefix = quoted.slice(0, 1) + quoted.slice(2);
  const title = columns[0];
  if (tier === "exact") return `${title}.ilike.${exact}`;
  if (tier === "prefix") return `and(${title}.ilike.${prefix},${title}.not.ilike.${exact})`;
  const matches = columns.map((column) => `${column}.ilike.${quoted}`).join(",");
  if (tier === "remaining") return `and(or(${matches}),${title}.not.ilike.${prefix})`;
  return matches;
}

export function usePortalSearch(query: string) {
  const q = query.trim().toLowerCase();

  return useQuery({
    queryKey: ["portal-search", q],
    enabled: q.length >= 2,
    queryFn: async ({ signal }): Promise<SearchResult[]> => {
      const results: SearchResult[] = [];
      for (const tier of ["exact", "prefix", "remaining"] as const) {
      const [news, labs, opps, events, members, explainers] = await Promise.all([
        supabase.from("news_articles").select("id, title, summary").or(searchFilter(["title","summary"], q, tier)).order("id").limit(12).abortSignal(signal),
        supabase.from("research_projects").select("id, title, description").neq("status", "draft").or(searchFilter(["title","description"], q, tier)).order("id").limit(12).abortSignal(signal),
        supabase.from("opportunities").select("id, title, organization").eq("is_active", true).or(searchFilter(["title","organization"], q, tier)).order("id").limit(12).abortSignal(signal),
        supabase.from("events").select("id, title, description").or(searchFilter(["title","description"], q, tier)).order("id").limit(12).abortSignal(signal),
        supabase.from("profiles").select("id, display_name, bio").neq("display_name", "").or(searchFilter(["display_name","bio"], q, tier)).order("id").limit(12).abortSignal(signal),
        supabase.from("explainer_cards").select("id, slug, title, summary").or(searchFilter(["title","summary"], q, tier)).order("id").limit(12).abortSignal(signal),
      ]);

      if ([news, labs, opps, events, members, explainers].some((response) => response.error)) {
        throw new Error("Search is temporarily unavailable. Please retry.");
      }

      news.data
        ?.filter((r) => r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q))
        .forEach((r) =>
          results.push({
            id: r.id,
            type: "news",
            title: r.title,
            subtitle: r.summary.slice(0, 80),
            href: `${portalRoutes.debriefed}?selected=${encodeURIComponent(r.id)}`,
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
            href: `${portalRoutes.pathways}?selected=${encodeURIComponent(r.id)}`,
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
            href: `${portalRoutes.events}?selected=${encodeURIComponent(r.id)}`,
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

      if (results.length >= 12) break;
      }
      return results.sort((a, b) => {
        const rank = (item: SearchResult) => item.title.toLowerCase() === q ? 0 : item.title.toLowerCase().startsWith(q) ? 1 : 2;
        return rank(a) - rank(b) || a.id.localeCompare(b.id) || a.type.localeCompare(b.type);
      }).slice(0, 12);
    },
    staleTime: 10_000,
  });
}
