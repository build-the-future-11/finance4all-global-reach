import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { mapCompetition, mapMemberCertificate } from "@/lib/mappers";
import { CATALYST_CURRICULUM_KEY } from "@/lib/submissionModeration";
import { supabase } from "@/lib/supabase";
import { throwSanitizedDbError } from "@/lib/adminSanitize";

export function useMyCertificates() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["member-certificates", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("member_certificates")
        .select("*")
        .eq("user_id", user!.id)
        .order("issued_at", { ascending: false });
      if (error) {
        if (error.code === "42P01") return [];
        throwSanitizedDbError(error);
      }
      return data.map(mapMemberCertificate);
    },
  });
}

export function useIssueCurriculumCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; lessonIds: string[]; curriculumKey?: string }) => {
      const { data, error } = await supabase.rpc("issue_my_curriculum_certificate", {
        p_curriculum_key: input.curriculumKey ?? CATALYST_CURRICULUM_KEY,
        p_title: input.title,
        p_lesson_ids: input.lessonIds,
      });
      if (error) throwSanitizedDbError(error);
      return mapMemberCertificate(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["member-certificates"] });
    },
  });
}

export function useCompetitions() {
  return useQuery({
    queryKey: ["competitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .in("status", ["open", "closed"])
        .order("starts_at", { ascending: true, nullsFirst: false });
      if (error) {
        if (error.code === "42P01") return [];
        throwSanitizedDbError(error);
      }
      return data.map(mapCompetition);
    },
  });
}
