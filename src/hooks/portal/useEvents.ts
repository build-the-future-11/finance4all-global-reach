import { isVisibleContent } from "@/lib/content-visibility";
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
      return data.filter((row) => isVisibleContent("chapter", row)).map(mapChapter);
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
      return data.filter((row) => isVisibleContent("event", row)).map(mapEvent);
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
  const mutation = useMutation({
    mutationFn: async ({ userId, eventId, registered }: { userId: string; eventId: string; registered: boolean }) => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const session = data.session;
      if (!session?.access_token || session.user.id !== userId) {
        throw new Error("Your account changed before this registration could be updated. Sign in to the original account and try again.");
      }
      const query = registered
        ? supabase.from("event_registrations").insert({
          event_id: eventId,
          user_id: userId,
        }).select("user_id,event_id").single()
        : supabase
          .from("event_registrations")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", userId)
          .select("user_id,event_id")
          .maybeSingle();
      // Preserve the checked credentials even if the shared session changes
      // before transport dispatch. Database ownership rules remain authoritative.
      const result = await query.setHeader("Authorization", `Bearer ${session.access_token}`);
      const row = requireConfirmedRow(result, registered ? "Registering for the event" : "Cancelling the event registration");
      if (row.user_id !== userId || row.event_id !== eventId) {
        throw new Error("The registration change for the original account could not be confirmed. Refresh and try again.");
      }
    },
    onSuccess: (_result, { userId }) => qc.invalidateQueries({ queryKey: ["event-registrations", userId] }),
  });
  return {
    isPending: mutation.isPending,
    mutateAsync: async ({ eventId, registered }: { eventId: string; registered: boolean }) => {
      if (!user) throw new Error("Sign in to update an event registration.");
      // Snapshot the owner, event and desired state before offline queuing.
      return mutation.mutateAsync({ userId: user.id, eventId, registered });
    },
  };
}
