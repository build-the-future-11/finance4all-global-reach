import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { EventStatus, NewsCategory, OpportunityType } from "@/types/domain";

export function useCreateNewsArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      summary: string;
      category: NewsCategory;
      tags: string[];
      sourceUrl?: string;
    }) => {
      const { error } = await supabase.from("news_articles").insert({
        title: input.title,
        summary: input.summary,
        category: input.category,
        tags: input.tags,
        source_url: input.sourceUrl ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news"] }),
  });
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      organization: string;
      type: OpportunityType;
      description: string;
      applicationUrl?: string;
      tags: string[];
    }) => {
      const { error } = await supabase.from("opportunities").insert({
        title: input.title,
        organization: input.organization,
        type: input.type,
        description: input.description,
        application_url: input.applicationUrl ?? null,
        tags: input.tags,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["opportunities"] }),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      chapterId: string;
      title: string;
      description: string;
      status: EventStatus;
      startsAt: string;
      registrationUrl?: string;
    }) => {
      const { error } = await supabase.from("events").insert({
        chapter_id: input.chapterId,
        title: input.title,
        description: input.description,
        status: input.status,
        starts_at: input.startsAt,
        registration_url: input.registrationUrl ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useCreateExplainer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      slug: string;
      title: string;
      summary: string;
      body: string;
      difficulty: "beginner" | "intermediate";
    }) => {
      const { error } = await supabase.from("explainer_cards").insert({
        slug: input.slug,
        title: input.title,
        summary: input.summary,
        body: input.body,
        difficulty: input.difficulty,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["explainers"] }),
  });
}

export function useDeleteNewsArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news_articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news"] }),
  });
}
