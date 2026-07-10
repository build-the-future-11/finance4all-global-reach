import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface ActivityItem {
  id: string;
  type: "news" | "lab_application" | "connection" | "event" | "saved_article";
  title: string;
  description: string;
  link: string;
  timestamp: string;
}

export function useActivityFeed(limit = 8) {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["activity-feed", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<ActivityItem[]> => {
      const items: ActivityItem[] = [];

      const [newsRes, appsRes, connRes, eventsRes, savedRes] = await Promise.all([
        supabase
          .from("news_articles")
          .select("id, title, published_at")
          .order("published_at", { ascending: false })
          .limit(3),
        supabase
          .from("lab_applications")
          .select("id, status, submitted_at, research_projects(title)")
          .eq("applicant_id", user!.id)
          .order("submitted_at", { ascending: false })
          .limit(3),
        supabase
          .from("connection_requests")
          .select("id, status, created_at, from_user_id, to_user_id")
          .or(`from_user_id.eq.${user!.id},to_user_id.eq.${user!.id}`)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("events")
          .select("id, title, starts_at")
          .eq("status", "upcoming")
          .order("starts_at", { ascending: true })
          .limit(3),
        supabase
          .from("news_bookmarks")
          .select("created_at, news_articles(id, title)")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(2),
      ]);

      newsRes.data?.forEach((a) => {
        items.push({
          id: `news-${a.id}`,
          type: "news",
          title: a.title,
          description: "New in Debriefed",
          link: "/portal/debriefed",
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
          link: "/portal/labs",
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
          link: "/portal/network",
          timestamp: c.created_at,
        });
      });

      eventsRes.data?.forEach((e) => {
        items.push({
          id: `event-${e.id}`,
          type: "event",
          title: e.title,
          description: "Upcoming event",
          link: "/portal/events",
          timestamp: e.starts_at,
        });
      });

      savedRes.data?.forEach((s) => {
        const article = s.news_articles as { id: string; title: string } | null;
        if (article) {
          items.push({
            id: `saved-${article.id}`,
            type: "saved_article",
            title: article.title,
            description: "You saved this article",
            link: "/portal/debriefed",
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
