import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useAccountDeletionRequests() {
  return useQuery({
    queryKey: ["account-deletion-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_deletion_requests")
        .select("*")
        .order("requested_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
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
      const { error } = await supabase
        .from("account_deletion_requests")
        .update({ status, review_note: reviewNote?.trim() || null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["account-deletion-requests"] }),
  });
}
