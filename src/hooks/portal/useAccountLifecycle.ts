import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { AccountDeletionStatus } from "@/types/database";

const deletionRequestKey = ["account-deletion-request"] as const;

export function useMyAccountDeletionRequest(userId?: string) {
  return useQuery({
    queryKey: [...deletionRequestKey, userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_deletion_requests")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useRequestAccountDeletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reason: string) => {
      const { data, error } = await supabase.rpc("request_account_deletion", {
        request_reason: reason.trim() || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deletionRequestKey }),
  });
}

export function useCancelAccountDeletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("cancel_account_deletion");
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deletionRequestKey }),
  });
}

export function useExportMyData() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("export_my_data");
      if (error) throw error;
      return data;
    },
  });
}

export function useAccountDeletionRequests(status: AccountDeletionStatus | "all" = "all") {
  const result = useInfiniteQuery({
    queryKey: ["account-deletion-requests", status],
    initialPageParam: null as { at: string; id: string } | null,
    queryFn: async ({ pageParam }) => {
      let query = supabase
        .from("account_deletion_requests")
        .select("*")
        .order("requested_at", { ascending: true })
        .order("id", { ascending: true })
        .limit(26);
      if (status !== "all") query = query.eq("status", status);
      if (pageParam) {
        const at = JSON.stringify(pageParam.at);
        const id = JSON.stringify(pageParam.id);
        query = query.or(`requested_at.gt.${at},and(requested_at.eq.${at},id.gt.${id})`);
      }
      const { data, error } = await query;
      if (error) throw error;
      const rows = (data ?? []).slice(0, 25);
      const last = rows.at(-1);
      return { rows, next: data && data.length > 25 && last ? { at: last.requested_at, id: last.id } : null };
    },
    getNextPageParam: (page) => page.next,
  });
  return { ...result, data: result.data?.pages.flatMap((page) => page.rows) };
}

export function useReviewAccountDeletionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      reviewNote,
    }: {
      id: string;
      status: AccountDeletionStatus;
      reviewNote?: string;
    }) => {
      const { data, error } = await supabase
        .from("account_deletion_requests")
        .update({ status, review_note: reviewNote?.trim() || null })
        .eq("id", id)
        .select("id")
        .single();
      if (error) throw error;
      if (data?.id !== id) throw new Error("The request was not updated. Refresh and check your permissions.");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["account-deletion-requests"] }),
  });
}
