import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  RESOURCE_LIBRARY,
  UPCOMING_WEBINARS,
  type ResourceItem,
} from "@/data/resources";
import { RESOURCE_GUIDES, type ResourceGuide } from "@/data/resourceGuides";

function isMissingCms(error: { code?: string; message?: string } | null) {
  return error?.code === "42P01" || Boolean(error?.message?.includes("does not exist"));
}

export interface Webinar {
  id: string;
  title: string;
  host: string;
  date: string;
  description: string;
  href: string;
}

export function useResourceLibrary() {
  return useQuery({
    queryKey: ["resource-library"],
    queryFn: async (): Promise<ResourceItem[]> => {
      const { data, error } = await supabase
        .from("resource_items")
        .select("*")
        .order("sort_order");

      if (error) {
        if (isMissingCms(error)) return RESOURCE_LIBRARY;
        throw error;
      }
      if (!data?.length) return RESOURCE_LIBRARY;

      return data.map((r) => ({
        id: r.id,
        type: r.type as ResourceItem["type"],
        title: r.title,
        description: r.description,
        href: r.href,
        tags: r.tags,
        free: r.free,
        external: r.external,
      }));
    },
    staleTime: 120_000,
  });
}

export function useResourceGuide(id: string | undefined) {
  return useQuery({
    queryKey: ["resource-guide", id],
    enabled: Boolean(id),
    queryFn: async (): Promise<ResourceGuide | null> => {
      if (!id) return null;
      const { data, error } = await supabase.from("resource_guides").select("*").eq("id", id).maybeSingle();

      if (error) {
        if (isMissingCms(error)) return RESOURCE_GUIDES[id] ?? null;
        throw error;
      }
      if (!data) return RESOURCE_GUIDES[id] ?? null;

      return {
        id: data.id,
        title: data.title,
        summary: data.summary,
        body: data.body,
        checklist: data.checklist.length ? data.checklist : undefined,
      };
    },
    staleTime: 120_000,
  });
}

export function useResourceGuidesIndex() {
  return useQuery({
    queryKey: ["resource-guides-index"],
    queryFn: async (): Promise<Record<string, ResourceGuide>> => {
      const { data, error } = await supabase.from("resource_guides").select("*");

      if (error) {
        if (isMissingCms(error)) return RESOURCE_GUIDES;
        throw error;
      }
      if (!data?.length) return RESOURCE_GUIDES;

      return Object.fromEntries(
        data.map((g) => [
          g.id,
          {
            id: g.id,
            title: g.title,
            summary: g.summary,
            body: g.body,
            checklist: g.checklist.length ? g.checklist : undefined,
          },
        ]),
      );
    },
    staleTime: 120_000,
  });
}

export function useWebinars() {
  return useQuery({
    queryKey: ["webinars"],
    queryFn: async (): Promise<Webinar[]> => {
      const { data, error } = await supabase
        .from("webinars")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) {
        if (isMissingCms(error)) {
          return UPCOMING_WEBINARS.map((w) => ({
            id: w.id,
            title: w.title,
            host: w.host,
            date: w.date,
            description: w.description,
            href: w.href,
          }));
        }
        throw error;
      }
      if (!data?.length) {
        return UPCOMING_WEBINARS.map((w) => ({
          id: w.id,
          title: w.title,
          host: w.host,
          date: w.date,
          description: w.description,
          href: w.href,
        }));
      }

      return data.map((w) => ({
        id: w.id,
        title: w.title,
        host: w.host,
        date: w.recurrence_label,
        description: w.description,
        href: w.href,
      }));
    },
    staleTime: 120_000,
  });
}
