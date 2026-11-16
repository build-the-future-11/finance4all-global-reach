import { isVisibleContent } from "@/lib/content-visibility";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  mapEssaySubmission,
  mapOpportunity,
  mapStudioSubmission,
} from "@/lib/mappers";
import { useAuth } from "@/contexts/useAuth";
import { requireOptionalExternalHttpUrl } from "@/lib/external-url";
import { requireConfirmedRow } from "@/lib/confirmed-mutation";

async function requirePathwaysSession(userId: string) {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const session = data.session;
  if (!session?.access_token || session.user.id !== userId) {
    throw new Error("Your account changed before this action could be saved. Sign in to the original account and try again.");
  }
  return session;
}

export function useOpportunities(selectedId?: string) {
  return useQuery({
    queryKey: ["opportunities", selectedId],
    queryFn: async () => {
      let query = supabase
        .from("opportunities")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (selectedId) query = query.eq("id", selectedId);
      const { data, error } = await query;
      if (error) throw error;
      return data.filter((row) => isVisibleContent("opportunity", row)).map(mapOpportunity);
    },
  });
}

export function useOpportunityInterests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["opportunity-interests", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunity_interests")
        .select("opportunity_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set(data.map((r) => r.opportunity_id));
    },
  });
}

export function useToggleOpportunityInterest() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ userId, opportunityId, interested }: { userId: string; opportunityId: string; interested: boolean }) => {
      const session = await requirePathwaysSession(userId);
      const query = interested
        ? supabase.from("opportunity_interests").insert({
          opportunity_id: opportunityId,
          user_id: userId,
        }).select("user_id,opportunity_id").single()
        : supabase
          .from("opportunity_interests")
          .delete()
          .eq("opportunity_id", opportunityId)
          .eq("user_id", userId)
          .select("user_id,opportunity_id")
          .maybeSingle();
      // Bind the request to the checked token even if the shared client changes
      // accounts before dispatch. Database ownership rules remain authoritative.
      const result = await query.setHeader("Authorization", `Bearer ${session.access_token}`);
      const row = requireConfirmedRow(result, interested ? "Saving the opportunity" : "Removing the opportunity interest");
      if (row.user_id !== userId || row.opportunity_id !== opportunityId) {
        throw new Error("The opportunity change for the original account could not be confirmed. Refresh and try again.");
      }
    },
    onSuccess: (_result, { userId }) => qc.invalidateQueries({ queryKey: ["opportunity-interests", userId] }),
  });
  return {
    isPending: mutation.isPending,
    mutateAsync: async ({ opportunityId, interested }: { opportunityId: string; interested: boolean }) => {
      if (!user) throw new Error("Sign in to save an opportunity.");
      // Snapshot the submitting account, item and action before offline queuing.
      return mutation.mutateAsync({ userId: user.id, opportunityId, interested });
    },
  };
}

export function useStudioSubmissions() {
  return useQuery({
    queryKey: ["studio-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data.map(mapStudioSubmission);
    },
  });
}

export function useSubmitStudio() {
  const { user } = useAuth();
  const qc = useQueryClient();
  type StudioInput = { title: string; writeup: string; repoUrl?: string; demoUrl?: string };
  const mutation = useMutation({
    mutationFn: async (input: {
      userId: string;
      title: string;
      writeup: string;
      repoUrl?: string;
      demoUrl?: string;
    }) => {
      const session = await requirePathwaysSession(input.userId);
      const repoUrl = requireOptionalExternalHttpUrl(input.repoUrl, "Repository URL");
      const demoUrl = requireOptionalExternalHttpUrl(input.demoUrl, "Demo URL");
      const result = await supabase.from("studio_submissions").insert({
        author_id: input.userId,
        title: input.title,
        writeup: input.writeup,
        repo_url: repoUrl ?? null,
        demo_url: demoUrl ?? null,
      }).select("id,author_id,title,writeup,repo_url,demo_url").single()
        .setHeader("Authorization", `Bearer ${session.access_token}`);
      const row = requireConfirmedRow(result, "Saving the project submission");
      if (typeof row.id !== "string" || !row.id || row.author_id !== input.userId
        || row.title !== input.title || row.writeup !== input.writeup
        || row.repo_url !== (repoUrl ?? null) || row.demo_url !== (demoUrl ?? null)) {
        throw new Error("The project submission for the original account could not be confirmed. Keep your draft and refresh before retrying.");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-submissions"] }),
  });
  return {
    isPending: mutation.isPending,
    mutateAsync: async ({ title, writeup, repoUrl, demoUrl }: StudioInput) => {
      if (!user) throw new Error("Sign in to submit a project.");
      return mutation.mutateAsync({ userId: user.id, title, writeup, repoUrl, demoUrl });
    },
  };
}

export function useEssays() {
  return useQuery({
    queryKey: ["essays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("essay_submissions_with_counts")
        .select("*")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data.map(mapEssaySubmission);
    },
  });
}

export function useMyEssayUpvotes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["essay-upvotes", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("essay_upvotes")
        .select("essay_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set(data.map((r) => r.essay_id));
    },
  });
}

export function useSubmitEssay() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (input: { userId: string; title: string; body: string }) => {
      const session = await requirePathwaysSession(input.userId);
      const result = await supabase.from("essay_submissions").insert({
        author_id: input.userId,
        title: input.title,
        body: input.body,
      }).select("id,author_id,title,body").single()
        .setHeader("Authorization", `Bearer ${session.access_token}`);
      const row = requireConfirmedRow(result, "Saving the essay");
      if (typeof row.id !== "string" || !row.id || row.author_id !== input.userId
        || row.title !== input.title || row.body !== input.body) {
        throw new Error("The essay for the original account could not be confirmed. Keep your draft and refresh before retrying.");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["essays"] }),
  });
  return {
    isPending: mutation.isPending,
    mutateAsync: async ({ title, body }: { title: string; body: string }) => {
      if (!user) throw new Error("Sign in to submit an essay.");
      return mutation.mutateAsync({ userId: user.id, title, body });
    },
  };
}

export function useToggleEssayUpvote() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ userId, essayId, upvoted }: { userId: string; essayId: string; upvoted: boolean }) => {
      const session = await requirePathwaysSession(userId);
      const query = upvoted
        ? supabase.from("essay_upvotes").insert({
          essay_id: essayId,
          user_id: userId,
        }).select("user_id,essay_id").single()
        : supabase
          .from("essay_upvotes")
          .delete()
          .eq("essay_id", essayId)
          .eq("user_id", userId)
          .select("user_id,essay_id")
          .maybeSingle();
      const result = await query.setHeader("Authorization", `Bearer ${session.access_token}`);
      const row = requireConfirmedRow(result, upvoted ? "Saving the essay upvote" : "Removing the essay upvote");
      if (row.user_id !== userId || row.essay_id !== essayId) {
        throw new Error("The essay vote for the original account could not be confirmed. Refresh and try again.");
      }
    },
    onSuccess: (_result, { userId }) => {
      qc.invalidateQueries({ queryKey: ["essays"] });
      qc.invalidateQueries({ queryKey: ["essay-upvotes", userId] });
    },
  });
  return {
    isPending: mutation.isPending,
    mutateAsync: async ({ essayId, upvoted }: { essayId: string; upvoted: boolean }) => {
      if (!user) throw new Error("Sign in to vote on an essay.");
      return mutation.mutateAsync({ userId: user.id, essayId, upvoted });
    },
  };
}
