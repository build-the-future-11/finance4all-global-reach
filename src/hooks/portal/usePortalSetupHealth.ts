import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

async function tableExists(table: string): Promise<boolean> {
  const { error } = await supabase.from(table).select("*").limit(1);
  if (error?.code === "42P01" || error?.message?.includes("does not exist")) return false;
  return !error;
}

export function usePortalSetupHealth() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["portal-setup-health", user?.id],
    enabled: Boolean(user) && isSupabaseConfigured,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const [bookmarks, notifications, contact, education, cms] = await Promise.all([
        tableExists("news_bookmarks"),
        tableExists("notifications"),
        tableExists("contact_submissions"),
        tableExists("education_lesson_progress"),
        tableExists("education_modules"),
      ]);

      return {
        bookmarks,
        notifications,
        contact,
        education,
        cms,
      };
    },
  });
}
