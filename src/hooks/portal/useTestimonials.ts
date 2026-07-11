import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { DEFAULT_TESTIMONIALS } from "@/lib/cmsDefaults";

export interface Testimonial {
  id: string;
  quote: string;
  attribution: string;
  roleLabel: string;
}

function isMissingCms(error: { code?: string; message?: string } | null) {
  return error?.code === "42P01" || Boolean(error?.message?.includes("does not exist"));
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async (): Promise<Testimonial[]> => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");

      if (error) {
        if (isMissingCms(error)) {
          return DEFAULT_TESTIMONIALS.map((t, i) => ({
            id: `default-${i}`,
            quote: t.quote,
            attribution: t.attribution,
            roleLabel: t.roleLabel,
          }));
        }
        throw error;
      }
      if (!data?.length) {
        return DEFAULT_TESTIMONIALS.map((t, i) => ({
          id: `default-${i}`,
          quote: t.quote,
          attribution: t.attribution,
          roleLabel: t.roleLabel,
        }));
      }

      return data.map((t) => ({
        id: t.id,
        quote: t.quote,
        attribution: t.attribution,
        roleLabel: t.role_label,
      }));
    },
    staleTime: 300_000,
  });
}
