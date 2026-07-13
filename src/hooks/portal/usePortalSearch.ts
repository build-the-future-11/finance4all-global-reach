import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { EDUCATION_MODULES } from "@/data/educationModules";
import { RESOURCE_LIBRARY } from "@/data/resources";
import { portalRoutes } from "@/routes/portal";

export interface SearchResult {
  id: string;
  type: "news" | "lab" | "opportunity" | "event" | "member" | "explainer" | "education" | "resource";
  title: string;
  subtitle?: string;
  href: string;
}

const TYPE_MAP: Record<string, SearchResult["type"]> = {
  news: "news",
  lab: "lab",
  opportunity: "opportunity",
  event: "event",
  member: "member",
  explainer: "explainer",
  education: "education",
  resource: "resource",
};

function clientSideSearch(q: string): SearchResult[] {
  const results: SearchResult[] = [];

  EDUCATION_MODULES.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.lessons.some((l) => l.title.toLowerCase().includes(q) || l.summary.toLowerCase().includes(q)),
  ).forEach((m) => {
    const matchingLesson = m.lessons.find(
      (l) => l.title.toLowerCase().includes(q) || l.summary.toLowerCase().includes(q),
    );
    results.push({
      id: matchingLesson?.id ?? m.id,
      type: "education",
      title: matchingLesson ? matchingLesson.title : m.title,
      subtitle: m.title,
      href: matchingLesson ? `${portalRoutes.education}/${matchingLesson.id}` : portalRoutes.education,
    });
  });

  RESOURCE_LIBRARY.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.includes(q)),
  ).forEach((r) =>
    results.push({
      id: r.id,
      type: "resource",
      title: r.title,
      subtitle: "Resource",
      href: r.href.startsWith("/") ? r.href : portalRoutes.resources,
    }),
  );

  return results.slice(0, 12);
}

export function usePortalSearch(query: string) {
  const q = query.trim().toLowerCase();

  return useQuery({
    queryKey: ["portal-search", q],
    enabled: q.length >= 2,
    queryFn: async (): Promise<SearchResult[]> => {
      const { data, error } = await supabase.rpc("portal_search", {
        p_query: q,
        p_limit: 12,
      });

      if (!error && data?.length) {
        return data.map((row: { id: string; result_type: string; title: string; subtitle: string; href: string }) => ({
          id: row.id,
          type: TYPE_MAP[row.result_type] ?? "resource",
          title: row.title,
          subtitle: row.subtitle,
          href: row.href,
        }));
      }

      if (error && error.code !== "42883" && !error.message?.includes("does not exist")) {
        throw error;
      }

      const [news, labs, opps, events, members, explainers] = await Promise.all([
        supabase.from("news_articles").select("id, title, summary").ilike("title", `%${q}%`).limit(12),
        supabase.from("research_projects").select("id, title, description").neq("status", "draft").ilike("title", `%${q}%`).limit(12),
        supabase.from("opportunities").select("id, title, organization").eq("is_active", true).ilike("title", `%${q}%`).limit(12),
        supabase.from("events").select("id, title, description").ilike("title", `%${q}%`).limit(12),
        supabase.from("member_directory").select("id, display_name, bio").ilike("display_name", `%${q}%`).limit(12),
        supabase.from("explainer_cards").select("id, slug, title, summary").ilike("title", `%${q}%`).limit(12),
      ]);

      const queryError = [news, labs, opps, events, members, explainers].find((res) => res.error)?.error;
      if (queryError) throw queryError;

      const results: SearchResult[] = [];

      news.data?.forEach((r) =>
        results.push({ id: r.id, type: "news", title: r.title, subtitle: r.summary.slice(0, 80), href: portalRoutes.debriefed }),
      );
      labs.data?.forEach((r) =>
        results.push({ id: r.id, type: "lab", title: r.title, subtitle: "Research project", href: `${portalRoutes.labs}/${r.id}` }),
      );
      opps.data?.forEach((r) =>
        results.push({ id: r.id, type: "opportunity", title: r.title, subtitle: r.organization, href: portalRoutes.pathwaysOpportunities }),
      );
      events.data?.forEach((r) =>
        results.push({ id: r.id, type: "event", title: r.title, subtitle: "Event", href: portalRoutes.events }),
      );
      members.data?.forEach((r) =>
        results.push({ id: r.id, type: "member", title: r.display_name, subtitle: "Member", href: `${portalRoutes.networkProfile}/${r.id}` }),
      );
      explainers.data?.forEach((r) =>
        results.push({ id: r.id, type: "explainer", title: r.title, subtitle: "Explainer", href: `${portalRoutes.debriefedExplainers}/${r.slug}` }),
      );

      return [...results, ...clientSideSearch(q)].slice(0, 12);
    },
    staleTime: 10_000,
  });
}
