import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mapChapter, mapEvent } from "@/lib/mappers";
import { useAuth } from "@/contexts/AuthContext";

export function useChapters() {
  return useQuery({
    queryKey: ["chapters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chapters").select("*").order("name");
      if (error) throw error;
      return data.map(mapChapter);
    },
  });
}

export function useEvents(chapterId?: string) {
  return useQuery({
    queryKey: ["events", chapterId],
    queryFn: async () => {
      let q = supabase.from("events").select("*").order("starts_at", { ascending: true });
      if (chapterId) q = q.eq("chapter_id", chapterId);
      const { data, error } = await q;
      if (error) throw error;
      return data.map(mapEvent);
    },
  });
}

export function useEventRegistrations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["event-registrations", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("event_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set(data.map((r) => r.event_id));
    },
  });
}

export function useToggleEventRegistration() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, registered }: { eventId: string; registered: boolean }) => {
      if (registered) {
        const { error } = await supabase.from("event_registrations").insert({
          event_id: eventId,
          user_id: user!.id,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_registrations")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user!.id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-registrations"] }),
  });
}
