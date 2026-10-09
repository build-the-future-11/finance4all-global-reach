import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/useAuth";
import { intakeSchema, type IntakeInput, type IntakeStatus } from "@/lib/intake";
import { requireConfirmedRow } from "@/lib/confirmed-mutation";

export function useIntakeCalls() {
  return useQuery({ queryKey: ["intake-calls"], queryFn: async () => {
    const { data, error } = await supabase.from("intake_calls").select("*").order("title");
    if (error) throw error;
    return data;
  }});
}
export function useIntakeSubmissions(review = false, status: IntakeStatus | "all" = "all") {
  const { user, profile } = useAuth();
  return useInfiniteQuery({ queryKey: ["intake-submissions", user?.id, review, status],
    enabled: Boolean(user) && (!review || profile?.role === "admin"),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      let query = supabase.from("intake_submissions").select("*").order("created_at", { ascending: false }).order("id").range(pageParam, pageParam + 24);
      if (!review) query = query.eq("applicant_id", user!.id);
      if (status !== "all") query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage, pages) => lastPage.length === 25 ? pages.length * 25 : undefined,
  });
}
export function useSubmitIntake() {
  const { user } = useAuth(); const client = useQueryClient();
  return useMutation({ mutationFn: async ({ input, requestId }: { input: IntakeInput; requestId: string }) => {
    if (!user) throw new Error("Sign in before submitting");
    const clean = intakeSchema.parse(input);
    const result = await supabase.from("intake_submissions").insert({ ...clean, id: requestId, work_url: clean.work_url || null, privacy_version: "2026-09-21" }).select("*").single();
    if (result.error?.code === "23505") {
      // Retry after an uncertain network response returns the original receipt.
      const existing = await supabase.from("intake_submissions").select("*").eq("id", requestId).eq("applicant_id", user.id).maybeSingle();
      if (!existing.error && existing.data) return existing.data;
    }
    if (result.error) throw result.error;
    if (!result.data) throw new Error("No receipt returned");
    return result.data;
  }, onSuccess: () => client.invalidateQueries({ queryKey: ["intake-submissions"] }) });
}
export function useReviewIntake() {
  const client = useQueryClient();
  return useMutation({ mutationFn: async ({ id, status, note }: { id: string; status: IntakeStatus; note?: string }) => {
    const result = await supabase.from("intake_submissions").update({ status, ...(note !== undefined ? { review_note: note.trim() } : {}) }).eq("id", id).select("id").maybeSingle();
    requireConfirmedRow(result, "Updating submission");
  }, onSuccess: () => client.invalidateQueries({ queryKey: ["intake-submissions"] }) });
}
export function useSetCallStatus() {
  const client = useQueryClient();
  return useMutation({ mutationFn: async ({ id, status }: { id: string; status: "interest" | "open" | "closed" }) => {
    const result = await supabase.from("intake_calls").update({ status }).eq("id", id).select("id").maybeSingle();
    requireConfirmedRow(result, "Updating intake availability");
  }, onSuccess: () => client.invalidateQueries({ queryKey: ["intake-calls"] }) });
}
