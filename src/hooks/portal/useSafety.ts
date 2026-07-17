import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { throwSanitizedDbError } from "@/lib/adminSanitize";
import { supabase } from "@/lib/supabase";

export type ContentReportTarget = "studio" | "essay" | "introduction" | "news" | "profile" | "other";
export type ContentReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export function useSubmitContentReport() {
  return useMutation({
    mutationFn: async (input: {
      targetType: ContentReportTarget;
      reason: string;
      targetId?: string;
      details?: string;
    }) => {
      const { data, error } = await supabase.rpc("submit_content_report", {
        p_target_type: input.targetType,
        p_reason: input.reason,
        p_target_id: input.targetId ?? null,
        p_details: input.details ?? null,
      });
      if (error) throwSanitizedDbError(error);
      return data as string;
    },
  });
}

export function useAdminContentReports() {
  return useQuery({
    queryKey: ["admin-content-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throwSanitizedDbError(error);
      return data;
    },
  });
}

export function useResolveContentReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      status: ContentReportStatus;
      note?: string;
    }) => {
      const { error } = await supabase.rpc("resolve_content_report", {
        p_id: input.id,
        p_status: input.status,
        p_note: input.note ?? null,
      });
      if (error) throwSanitizedDbError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-content-reports"] }),
  });
}

export function useMyChapterLeaderSnapshot() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["chapter-leader-snapshot", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_chapter_leader_snapshot");
      if (error) {
        if (error.code === "42883" || error.code === "42P01") return [];
        throwSanitizedDbError(error);
      }
      return data ?? [];
    },
  });
}
