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

export function usePortalSearch(query: string) {
  const q = query.trim().toLowerCase();

  return useQuery({
    queryKey: ["portal-search", q],
    enabled: q.length >= 2,
    queryFn: async (): Promise<SearchResult[]> => {
      const [news, labs, opps, events, members, explainers] = await Promise.all([
        supabase.from("news_articles").select("id, title, summary").limit(20),
        supabase.from("research_projects").select("id, title, description").neq("status", "draft").limit(20),
        supabase.from("opportunities").select("id, title, organization").eq("is_active", true).limit(20),
        supabase.from("events").select("id, title, description").limit(20),
        supabase.from("profiles").select("id, display_name, bio").neq("display_name", "").limit(30),
        supabase.from("explainer_cards").select("id, slug, title, summary").limit(20),
      ]);

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

      EDUCATION_MODULES.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.lessons.some((l) => l.title.toLowerCase().includes(q)),
      ).forEach((m) =>
        results.push({
          id: m.id,
          type: "education",
          title: m.title,
          subtitle: "Education module",
          href: portalRoutes.education,
        }),
      );

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
          href: portalRoutes.resources,
        }),
      );

      return results.slice(0, 12);
    },
    staleTime: 10_000,
  });
}
