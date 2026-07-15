import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mapProfile } from "@/lib/mappers";
import type { EventStatus, NewsCategory, OpportunityType, UserRole } from "@/types/domain";
import {
  sanitizeChapterInput,
  sanitizeEventInput,
  sanitizeExplainerInput,
  sanitizeNewsInput,
  sanitizeOpportunityInput,
  throwSanitizedDbError,
} from "@/lib/adminSanitize";

export function useCreateNewsArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      summary: string;
      category: NewsCategory;
      tags: string[];
      sourceUrl?: string;
      isPublished?: boolean;
    }) => {
      const safe = sanitizeNewsInput(input);
      const { error } = await supabase.from("news_articles").insert({
        title: safe.title,
        summary: safe.summary,
        category: safe.category,
        tags: safe.tags,
        source_url: safe.sourceUrl ?? null,
        is_published: safe.isPublished,
      });
      if (error) throwSanitizedDbError(error);
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
      const safe = sanitizeOpportunityInput(input);
      const { error } = await supabase.from("opportunities").insert({
        title: safe.title,
        organization: safe.organization,
        type: safe.type,
        description: safe.description,
        application_url: safe.applicationUrl ?? null,
        tags: safe.tags,
      });
      if (error) throwSanitizedDbError(error);
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
      endsAt?: string;
      registrationUrl?: string;
      registrationOpensAt?: string;
      registrationClosesAt?: string;
      registrationCapacity?: number;
    }) => {
      const safe = sanitizeEventInput(input);
      const { error } = await supabase.from("events").insert({
        chapter_id: safe.chapterId,
        title: safe.title,
        description: safe.description,
        status: safe.status,
        starts_at: safe.startsAt,
        ends_at: safe.endsAt ?? null,
        registration_url: safe.registrationUrl ?? null,
        registration_opens_at: safe.registrationOpensAt ?? null,
        registration_closes_at: safe.registrationClosesAt ?? null,
        registration_capacity: safe.registrationCapacity ?? null,
      });
      if (error) throwSanitizedDbError(error);
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
      const safe = sanitizeExplainerInput(input);
      const { error } = await supabase.from("explainer_cards").insert({
        slug: safe.slug,
        title: safe.title,
        summary: safe.summary,
        body: safe.body,
        difficulty: safe.difficulty,
      });
      if (error) throwSanitizedDbError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["explainers"] }),
  });
}

export function useDeleteNewsArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news_articles").delete().eq("id", id);
      if (error) throwSanitizedDbError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news"] }),
  });
}

export function useUpdateNewsArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      title: string;
      summary: string;
      category: NewsCategory;
      tags: string[];
      sourceUrl?: string;
      isPublished?: boolean;
    }) => {
      const safe = sanitizeNewsInput(input);
      const { error } = await supabase
        .from("news_articles")
        .update({
          title: safe.title,
          summary: safe.summary,
          category: safe.category,
          tags: safe.tags,
          source_url: safe.sourceUrl ?? null,
          is_published: safe.isPublished,
        })
        .eq("id", id);
      if (error) throwSanitizedDbError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news"] }),
  });
}

export function useDeleteOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("opportunities").delete().eq("id", id);
      if (error) throwSanitizedDbError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["opportunities"] }),
  });
}

export function useUpdateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      title: string;
      organization: string;
      type: OpportunityType;
      description: string;
      applicationUrl?: string;
      tags: string[];
    }) => {
      const safe = sanitizeOpportunityInput(input);
      const { error } = await supabase
        .from("opportunities")
        .update({
          title: safe.title,
          organization: safe.organization,
          type: safe.type,
          description: safe.description,
          application_url: safe.applicationUrl ?? null,
          tags: safe.tags,
        })
        .eq("id", id);
      if (error) throwSanitizedDbError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["opportunities"] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throwSanitizedDbError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      chapterId: string;
      title: string;
      description: string;
      status: EventStatus;
      startsAt: string;
      endsAt?: string;
      registrationUrl?: string;
      registrationOpensAt?: string;
      registrationClosesAt?: string;
      registrationCapacity?: number;
    }) => {
      const safe = sanitizeEventInput(input);
      const { error } = await supabase
        .from("events")
        .update({
          chapter_id: safe.chapterId,
          title: safe.title,
          description: safe.description,
          status: safe.status,
          starts_at: safe.startsAt,
          ends_at: safe.endsAt ?? null,
          registration_url: safe.registrationUrl ?? null,
          registration_opens_at: safe.registrationOpensAt ?? null,
          registration_closes_at: safe.registrationClosesAt ?? null,
          registration_capacity: safe.registrationCapacity ?? null,
        })
        .eq("id", id);
      if (error) throwSanitizedDbError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useDeleteExplainer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("explainer_cards").delete().eq("id", id);
      if (error) throwSanitizedDbError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["explainers"] }),
  });
}

export function useUpdateExplainer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      slug: string;
      title: string;
      summary: string;
      body: string;
      difficulty: "beginner" | "intermediate";
    }) => {
      const safe = sanitizeExplainerInput(input);
      const { error } = await supabase
        .from("explainer_cards")
        .update({
          slug: safe.slug,
          title: safe.title,
          summary: safe.summary,
          body: safe.body,
          difficulty: safe.difficulty,
        })
        .eq("id", id);
      if (error) throwSanitizedDbError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["explainers"] }),
  });
}

export function useCreateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      city: string;
      country: string;
      latitude: number;
      longitude: number;
    }) => {
      const safe = sanitizeChapterInput(input);
      const { error } = await supabase.from("chapters").insert({
        name: safe.name,
        city: safe.city,
        country: safe.country,
        latitude: safe.latitude,
        longitude: safe.longitude,
      });
      if (error) throwSanitizedDbError(error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chapters"] });
      qc.invalidateQueries({ queryKey: ["community-stats"] });
    },
  });
}

export function useDeleteChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chapters").delete().eq("id", id);
      if (error) throwSanitizedDbError(error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chapters"] });
      qc.invalidateQueries({ queryKey: ["community-stats"] });
    },
  });
}

export function useContactSubmissions() {
  return useQuery({
    queryKey: ["contact-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throwSanitizedDbError(error);
      return data;
    },
  });
}

export function useUpdateContactStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "new" | "read" | "archived" }) => {
      const { error } = await supabase.from("contact_submissions").update({ status }).eq("id", id);
      if (error) throwSanitizedDbError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-submissions"] }),
  });
}

export function useAdminMembers() {
  return useQuery({
    queryKey: ["admin-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("display_name", "")
        .order("display_name");
      if (error) throwSanitizedDbError(error);
      return data.map(mapProfile);
    },
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
      if (error) throwSanitizedDbError(error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-members"] });
      qc.invalidateQueries({ queryKey: ["member-profiles"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useProductAnalyticsEvents() {
  return useQuery({
    queryKey: ["admin", "product-analytics-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_analytics_events")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(250);
      if (error) throwSanitizedDbError(error);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useClientErrorEvents() {
  return useQuery({
    queryKey: ["admin", "client-error-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_error_events")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(100);
      if (error) throwSanitizedDbError(error);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useDigestDeliveryLog() {
  return useQuery({
    queryKey: ["admin", "digest-delivery-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digest_send_log")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(100);
      if (error) throwSanitizedDbError(error);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useSeedCmsContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const {
        EDUCATION_MODULES,
        LESSON_CONTENT,
        RESOURCE_LIBRARY,
        UPCOMING_WEBINARS,
        RESOURCE_GUIDES,
        DEFAULT_TESTIMONIALS,
      } = await import("@/lib/cmsDefaults");

      for (let mi = 0; mi < EDUCATION_MODULES.length; mi++) {
        const mod = EDUCATION_MODULES[mi];
        const { error: modErr } = await supabase.from("education_modules").upsert({
          id: mod.id,
          title: mod.title,
          eyebrow: mod.eyebrow,
          description: mod.description,
          difficulty: mod.difficulty,
          inclusive_note: mod.inclusiveNote ?? null,
          sort_order: mi,
        });
        if (modErr) throwSanitizedDbError(modErr);

        for (let li = 0; li < mod.lessons.length; li++) {
          const lesson = mod.lessons[li];
          const content = LESSON_CONTENT[lesson.id];
          const { error: lessonErr } = await supabase.from("education_lessons").upsert({
            id: lesson.id,
            module_id: mod.id,
            title: lesson.title,
            duration_min: lesson.durationMin,
            summary: lesson.summary,
            objectives: lesson.objectives,
            body: content?.body ?? "",
            exercise: content?.exercise ?? "",
            key_terms: content?.keyTerms ?? [],
            sort_order: li,
          });
          if (lessonErr) throwSanitizedDbError(lessonErr);
        }
      }

      for (let i = 0; i < RESOURCE_LIBRARY.length; i++) {
        const r = RESOURCE_LIBRARY[i];
        const { error } = await supabase.from("resource_items").upsert({
          id: r.id,
          type: r.type,
          title: r.title,
          description: r.description,
          href: r.href,
          tags: r.tags,
          free: r.free,
          external: r.external ?? false,
          sort_order: i,
        });
        if (error) throwSanitizedDbError(error);
      }

      for (const [id, guide] of Object.entries(RESOURCE_GUIDES)) {
        const { error } = await supabase.from("resource_guides").upsert({
          id,
          title: guide.title,
          summary: guide.summary,
          body: guide.body,
          checklist: guide.checklist ?? [],
        });
        if (error) throwSanitizedDbError(error);
      }

      for (let i = 0; i < UPCOMING_WEBINARS.length; i++) {
        const w = UPCOMING_WEBINARS[i];
        const { error } = await supabase.from("webinars").upsert({
          id: w.id,
          title: w.title,
          host: w.host,
          recurrence_label: w.date,
          description: w.description,
          href: w.href,
          sort_order: i,
          is_active: true,
        });
        if (error) throwSanitizedDbError(error);
      }

      for (const t of DEFAULT_TESTIMONIALS) {
        const { count } = await supabase
          .from("testimonials")
          .select("id", { count: "exact", head: true })
          .eq("quote", t.quote);
        if ((count ?? 0) > 0) continue;
        const { error } = await supabase.from("testimonials").insert({
          quote: t.quote,
          attribution: t.attribution,
          role_label: t.roleLabel,
          sort_order: t.sortOrder,
          is_published: true,
        });
        if (error) throwSanitizedDbError(error);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["education-modules"] });
      qc.invalidateQueries({ queryKey: ["resource-library"] });
      qc.invalidateQueries({ queryKey: ["resource-guides-index"] });
      qc.invalidateQueries({ queryKey: ["webinars"] });
      qc.invalidateQueries({ queryKey: ["testimonials"] });
      qc.invalidateQueries({ queryKey: ["portal-search"] });
    },
  });
}

export function useCmsHealth() {
  return useQuery({
    queryKey: ["cms-health"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("education_modules")
        .select("id", { count: "exact", head: true });
      if (error?.code === "42P01") return { initialized: false };
      if (error) throwSanitizedDbError(error);
      return { initialized: (count ?? 0) > 0 };
    },
    staleTime: 60_000,
  });
}
