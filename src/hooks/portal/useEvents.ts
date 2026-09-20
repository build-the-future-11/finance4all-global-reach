import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mapChapter, mapEvent } from "@/lib/mappers";
import { useAuth } from "@/contexts/useAuth";
import { requireConfirmedRow } from "@/lib/confirmed-mutation";

export function useChapters() {
  return useQuery({
    queryKey: ["chapters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chapters").select("*").order("name");
      if (error) throw error;
      return data.map(mapChapter).filter((chapter) => !chapter.id.startsWith("70000000-0000-4000-8000-00000000000"));
    },
  });
}

export function useEvents(chapterId?: string, selectedId?: string) {
  return useQuery({
    queryKey: ["events", chapterId, selectedId],
    queryFn: async () => {
      let q = supabase.from("events").select("*").order("starts_at", { ascending: true });
      if (selectedId) q = q.eq("id", selectedId);
      else if (chapterId) q = q.eq("chapter_id", chapterId);
      const { data, error } = await q;
      if (error) throw error;
      const retiredDemoTitles = new Set(["IIT Finance Case Night", "London Markets 101 Workshop"]);
      return data.map(mapEvent).filter((event) => !retiredDemoTitles.has(event.title));
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
        const result = await supabase
          .from("event_registrations")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user!.id)
          .select("event_id")
          .maybeSingle();
        requireConfirmedRow(result, "Cancelling the event registration");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-registrations"] }),
  });
}
