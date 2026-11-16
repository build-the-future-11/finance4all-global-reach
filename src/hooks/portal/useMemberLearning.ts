import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import { requireConfirmedRow } from "@/lib/confirmed-mutation";

type LearningSaveInput = {
  lessonId: string;
  completed: boolean;
  notes: string;
  revision: number | null;
};

export function useMemberLearning() {
  const { user } = useAuth();
  const client = useQueryClient();
  const records = useQuery({
    queryKey: ["member-learning", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.from("member_learning").select("*")
        .eq("user_id", user!.id).order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const saveMutation = useMutation({
    mutationFn: async ({ userId, lessonId, completed, notes, revision }: LearningSaveInput & { userId: string }) => {
      // Paused mutations can resume after the submitting editor has unmounted.
      // Check the actual session, not a render closure that may now be stale.
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const session = data.session;
      if (!session?.access_token || session.user.id !== userId) {
        throw new Error("Your account changed before these notes could be saved. Sign in to the original account and try again.");
      }

      const query = revision === null
        ? supabase.from("member_learning").insert({ lesson_id: lessonId, completed, notes }).select("*").single()
        : supabase.from("member_learning").update({ completed, notes })
          .eq("user_id", userId).eq("lesson_id", lessonId).eq("revision", revision).select("*").maybeSingle();
      // Bind this request to the checked session. A subsequent account change
      // must not replace its credentials while the shared client dispatches it.
      // user_id remains server-owned under the existing column grants and RLS.
      const result = await query.setHeader("Authorization", `Bearer ${session.access_token}`);
      if (result.error?.code === "23505" || (!result.error && !result.data)) {
        throw new Error("This lesson changed in another session. Reload the saved version before retrying. Your current notes are still here.");
      }
      const row = requireConfirmedRow(result, "Saving learning");
      if (row.user_id !== userId || row.lesson_id !== lessonId) {
        throw new Error("Saving these notes to the original account could not be confirmed. Reload the saved version before retrying.");
      }
      return row;
    },
    onSuccess: (_row, { userId }) => client.invalidateQueries({ queryKey: ["member-learning", userId] }),
  });
  const save = {
    isPending: saveMutation.isPending,
    mutateAsync: async (input: LearningSaveInput) => {
      if (!user) throw new Error("Sign in to save learning.");
      if (input.notes.length > 12000) throw new Error("Notes must be at most 12,000 characters.");
      // Copy every submitted field before TanStack can pause this mutation.
      return saveMutation.mutateAsync({
        userId: user.id,
        lessonId: input.lessonId,
        completed: input.completed,
        notes: input.notes,
        revision: input.revision,
      });
    },
  };
  return { records, save };
}
