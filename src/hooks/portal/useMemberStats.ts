import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface MemberStats {
  connections: number;
  savedArticles: number;
  savedProjects: number;
  labApplications: number;
  eventsRegistered: number;
}

export function useMyMemberStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["member-stats", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<MemberStats> => {
      const uid = user!.id;

      const [connRes, newsRes, projRes, appsRes, eventsRes] = await Promise.all([
        supabase
          .from("connection_requests")
          .select("id", { count: "exact", head: true })
          .or(`from_user_id.eq.${uid},to_user_id.eq.${uid}`)
          .eq("status", "accepted"),
        supabase
          .from("news_bookmarks")
          .select("article_id", { count: "exact", head: true })
          .eq("user_id", uid),
        supabase
          .from("project_bookmarks")
          .select("project_id", { count: "exact", head: true })
          .eq("user_id", uid),
        supabase
          .from("lab_applications")
          .select("id", { count: "exact", head: true })
          .eq("applicant_id", uid),
        supabase
          .from("event_registrations")
          .select("event_id", { count: "exact", head: true })
          .eq("user_id", uid),
      ]);

      return {
        connections: connRes.count ?? 0,
        savedArticles: newsRes.count ?? 0,
        savedProjects: projRes.count ?? 0,
        labApplications: appsRes.count ?? 0,
        eventsRegistered: eventsRes.count ?? 0,
      };
    },
    staleTime: 60_000,
  });
}

export function computeProfileCompleteness(profile: {
  displayName?: string;
  bio?: string;
  interests?: string[];
  chapterId?: string;
  openToCollaborate?: boolean;
} | null): { percent: number; missing: string[] } {
  if (!profile) return { percent: 0, missing: ["Profile"] };

  const checks = [
    { ok: Boolean(profile.displayName?.trim()), label: "Display name" },
    { ok: Boolean(profile.bio?.trim()), label: "Bio" },
    { ok: (profile.interests?.length ?? 0) > 0, label: "Interests" },
    { ok: Boolean(profile.chapterId), label: "Chapter" },
    { ok: profile.openToCollaborate === true, label: "Collaboration preference" },
  ];

  const done = checks.filter((c) => c.ok).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter((c) => !c.ok).map((c) => c.label),
  };
}
