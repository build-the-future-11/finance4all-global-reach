import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { portalRoutes } from "@/routes/portal";

export interface ActivityItem {
  id: string;
  type: "news" | "lab_application" | "connection" | "event" | "saved_article" | "opportunity";
  title: string;
  description: string;
  link: string;
  timestamp: string;
}

export function useActivityFeed(limit = 8) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["activity-feed", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<ActivityItem[]> => {
      const items: ActivityItem[] = [];

      const [newsRes, appsRes, connRes, regsRes, interestsRes, savedRes] = await Promise.all([
        supabase
          .from("news_articles")
          .select("id, title, published_at")
          .order("published_at", { ascending: false })
          .limit(3),
        supabase
          .from("lab_applications")
          .select("id, status, submitted_at, project_id, research_projects(title)")
          .eq("applicant_id", user!.id)
          .order("submitted_at", { ascending: false })
          .limit(5),
        supabase
          .from("connection_requests")
          .select("id, status, created_at, from_user_id, to_user_id")
          .or(`from_user_id.eq.${user!.id},to_user_id.eq.${user!.id}`)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("event_registrations")
          .select("created_at, event_id, events(id, title, starts_at)")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("opportunity_interests")
          .select("created_at, opportunity_id, opportunities(id, title)")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("news_bookmarks")
          .select("created_at, news_articles(id, title)")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(2),
      ]);

      const criticalErrors = [newsRes, appsRes, connRes, regsRes, interestsRes]
        .map((res) => res.error)
        .filter(Boolean);
      if (criticalErrors.length > 0) throw criticalErrors[0];

      newsRes.data?.forEach((a) => {
        items.push({
          id: `news-${a.id}`,
          type: "news",
          title: a.title,
          description: "New in Debriefed",
          link: `${portalRoutes.debriefed}?article=${a.id}`,
          timestamp: a.published_at,
        });
      });

      appsRes.data?.forEach((app) => {
        const project = app.research_projects as { title: string } | null;
        items.push({
          id: `app-${app.id}`,
          type: "lab_application",
          title: project?.title ?? "Lab application",
          description: `Status: ${app.status.replace("_", " ")}`,
          link: `${portalRoutes.labs}/${app.project_id}`,
          timestamp: app.submitted_at,
        });
      });

      connRes.data?.forEach((c) => {
        const isIncoming = c.to_user_id === user!.id;
        items.push({
          id: `conn-${c.id}`,
          type: "connection",
          title: isIncoming ? "Connection request received" : "Connection request sent",
          description: `Status: ${c.status}`,
          link: portalRoutes.network,
          timestamp: c.created_at,
        });
      });

      regsRes.data?.forEach((r) => {
        const event = r.events as { id: string; title: string; starts_at: string } | null;
        if (event) {
          items.push({
            id: `rsvp-${event.id}`,
            type: "event",
            title: event.title,
            description: "You registered for this event",
            link: portalRoutes.events,
            timestamp: r.created_at ?? event.starts_at,
          });
        }
      });

      interestsRes.data?.forEach((row) => {
        const opp = row.opportunities as { id: string; title: string } | null;
        if (opp) {
          items.push({
            id: `opp-${opp.id}`,
            type: "opportunity",
            title: opp.title,
            description: "You saved this opportunity",
            link: `${portalRoutes.pathwaysOpportunities}/${opp.id}`,
            timestamp: row.created_at,
          });
        }
      });

      savedRes.data?.forEach((s) => {
        const article = s.news_articles as { id: string; title: string } | null;
        if (article) {
          items.push({
            id: `saved-${article.id}`,
            type: "saved_article",
            title: article.title,
            description: "You saved this article",
            link: `${portalRoutes.debriefed}?article=${article.id}`,
            timestamp: s.created_at,
          });
        }
      });

      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return items.slice(0, limit);
    },
    staleTime: 30_000,
  });
}
