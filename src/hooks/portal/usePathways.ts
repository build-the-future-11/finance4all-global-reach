import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  mapEssaySubmission,
  mapOpportunity,
  mapStudioSubmission,
} from "@/lib/mappers";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/analytics";

export function useOpportunities() {
  return useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map(mapOpportunity);
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
  return useMutation({
    mutationFn: async ({ opportunityId, interested }: { opportunityId: string; interested: boolean }) => {
      if (interested) {
        const { error } = await supabase.from("opportunity_interests").insert({
          opportunity_id: opportunityId,
          user_id: user!.id,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("opportunity_interests")
          .delete()
          .eq("opportunity_id", opportunityId)
          .eq("user_id", user!.id);
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      if (variables.interested) trackEvent("opportunity.interest_saved");
      qc.invalidateQueries({ queryKey: ["opportunity-interests"] });
      qc.invalidateQueries({ queryKey: ["saved-opportunities"] });
    },
  });
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
  return useMutation({
    mutationFn: async (input: {
      title: string;
      writeup: string;
      repoUrl?: string;
      demoUrl?: string;
    }) => {
      const { error } = await supabase.from("studio_submissions").insert({
        author_id: user!.id,
        title: input.title,
        writeup: input.writeup,
        repo_url: input.repoUrl ?? null,
        demo_url: input.demoUrl ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-submissions"] }),
  });
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
  return useMutation({
    mutationFn: async (input: { title: string; body: string }) => {
      const { error } = await supabase.from("essay_submissions").insert({
        author_id: user!.id,
        title: input.title,
        body: input.body,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["essays"] }),
  });
}

export function useToggleEssayUpvote() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ essayId, upvoted }: { essayId: string; upvoted: boolean }) => {
      if (upvoted) {
        const { error } = await supabase.from("essay_upvotes").insert({
          essay_id: essayId,
          user_id: user!.id,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("essay_upvotes")
          .delete()
          .eq("essay_id", essayId)
          .eq("user_id", user!.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["essays"] });
      qc.invalidateQueries({ queryKey: ["essay-upvotes"] });
    },
  });
}
