import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface CommunityStats {
  members: number;
  chapters: number;
  openProjects: number;
  introductions: number;
}

export function useCommunityStats() {
  return useQuery({
    queryKey: ["community-stats"],
    queryFn: async (): Promise<CommunityStats> => {
      const [membersRes, chaptersRes, projectsRes, introsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .neq("display_name", ""),
        supabase.from("chapters").select("id", { count: "exact", head: true }),
        supabase
          .from("research_projects")
          .select("id", { count: "exact", head: true })
          .eq("status", "open"),
        supabase.from("introduction_posts").select("id", { count: "exact", head: true }),
      ]);

      const errors = [membersRes, chaptersRes, projectsRes, introsRes]
        .map((res) => res.error)
        .filter(Boolean);
      if (errors.length > 0) {
        throw errors[0];
      }

      return {
        members: membersRes.count ?? 0,
        chapters: chaptersRes.count ?? 0,
        openProjects: projectsRes.count ?? 0,
        introductions: introsRes.count ?? 0,
      };
    },
    staleTime: 120_000,
  });
}
