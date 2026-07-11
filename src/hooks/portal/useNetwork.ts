import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mapConnectionRequest, mapIntroductionPost, mapProfile } from "@/lib/mappers";
import type { ConnectionStatus } from "@/types/domain";
import { useAuth } from "@/contexts/AuthContext";

export const MEMBER_PAGE_SIZE = 24;

export interface MemberProfilesOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function useMemberProfiles(options?: MemberProfilesOptions) {
  const page = options?.page ?? 0;
  const pageSize = options?.pageSize;
  const search = options?.search?.trim();

  return useQuery({
    queryKey: ["member-profiles", page, pageSize, search],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .neq("display_name", "")
        .order("display_name");

      if (search) {
        query = query.ilike("display_name", `%${search}%`);
      }

      if (pageSize != null) {
        const from = page * pageSize;
        query = query.range(from, from + pageSize - 1);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return {
        members: data.map(mapProfile),
        total: count ?? data.length,
      };
    },
  });
}

export function useProfileById(id: string | undefined) {
  return useQuery({
    queryKey: ["profile", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id!).single();
      if (error) throw error;
      return mapProfile(data);
    },
  });
}

export function useConnectionRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["connections", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connection_requests")
        .select("*")
        .or(`from_user_id.eq.${user!.id},to_user_id.eq.${user!.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map(mapConnectionRequest);
    },
  });
}

export function useIntroductionPosts() {
  return useQuery({
    queryKey: ["introductions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("introduction_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map(mapIntroductionPost);
    },
  });
}

export function useSendConnectionRequest() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ toUserId, message }: { toUserId: string; message?: string }) => {
      const { error } = await supabase.from("connection_requests").insert({
        from_user_id: user!.id,
        to_user_id: toUserId,
        message: message ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });
}

export function useRespondToConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ConnectionStatus }) => {
      const { error } = await supabase
        .from("connection_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });
}

export function useCreateIntroduction() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { headline: string; lookingFor: string; interests: string[] }) => {
      const { error } = await supabase.from("introduction_posts").insert({
        author_id: user!.id,
        headline: input.headline,
        looking_for: input.lookingFor,
        interests: input.interests,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["introductions"] }),
  });
}

export function useDeleteIntroduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("introduction_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["introductions"] }),
  });
}

export function useUpdateMyProfile() {
  const { updateProfile } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["member-profiles"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
