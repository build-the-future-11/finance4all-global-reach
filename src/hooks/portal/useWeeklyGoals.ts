import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface WeeklyBaseline {
  weekStart: string;
  savedArticles: number;
  connections: number;
  completedLessons: number;
}

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  return monday.toISOString().slice(0, 10);
}

function isMissingTable(error: { code?: string; message?: string } | null) {
  return error?.code === "42P01" || Boolean(error?.message?.includes("does not exist"));
}

const LOCAL_KEY = "f4a-weekly-goals-baseline";

function readLocalBaseline(): WeeklyBaseline | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as WeeklyBaseline) : null;
  } catch {
    return null;
  }
}

function writeLocalBaseline(baseline: WeeklyBaseline) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(baseline));
  } catch {
    /* ignore */
  }
}

export function useWeeklyGoalsBaseline(
  current: { savedArticles: number; connections: number; completedLessons: number },
) {
  const { user } = useAuth();
  const weekStart = getWeekStart();

  const query = useQuery({
    queryKey: ["weekly-goals-baseline", user?.id, weekStart],
    enabled: Boolean(user),
    queryFn: async (): Promise<WeeklyBaseline> => {
      const { data, error } = await supabase
        .from("weekly_goal_baselines")
        .select("*")
        .eq("user_id", user!.id)
        .eq("week_start", weekStart)
        .maybeSingle();

      if (error) {
        if (isMissingTable(error)) {
          const local = readLocalBaseline();
          if (local?.weekStart === weekStart) return local;
          const baseline = { weekStart, ...current };
          writeLocalBaseline(baseline);
          return baseline;
        }
        throw error;
      }

      if (!data) {
        const baseline = { weekStart, ...current };
        const { error: insertErr } = await supabase.from("weekly_goal_baselines").upsert({
          user_id: user!.id,
          week_start: weekStart,
          saved_articles: current.savedArticles,
          connections: current.connections,
          completed_lessons: current.completedLessons,
        });
        if (insertErr && !isMissingTable(insertErr)) throw insertErr;
        if (isMissingTable(insertErr)) writeLocalBaseline(baseline);
        return baseline;
      }

      return {
        weekStart: data.week_start,
        savedArticles: data.saved_articles,
        connections: data.connections,
        completedLessons: data.completed_lessons,
      };
    },
    staleTime: 60_000,
  });

  const qc = useQueryClient();
  const syncMutation = useMutation({
    mutationFn: async (baseline: WeeklyBaseline) => {
      if (!user) {
        writeLocalBaseline(baseline);
        return;
      }
      const { error } = await supabase.from("weekly_goal_baselines").upsert({
        user_id: user.id,
        week_start: baseline.weekStart,
        saved_articles: baseline.savedArticles,
        connections: baseline.connections,
        completed_lessons: baseline.completedLessons,
        updated_at: new Date().toISOString(),
      });
      if (error && !isMissingTable(error)) throw error;
      if (isMissingTable(error)) writeLocalBaseline(baseline);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weekly-goals-baseline", user?.id] }),
  });

  return { ...query, syncBaseline: syncMutation.mutateAsync };
}
