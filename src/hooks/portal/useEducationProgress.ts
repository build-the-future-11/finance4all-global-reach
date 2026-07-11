import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";
import {
  EDUCATION_PROGRESS_STORAGE_KEY,
  isMissingTableError,
  readLocalEducationProgress,
  toggleLocalEducationProgress,
} from "@/lib/educationProgressStorage";

async function fetchRemoteProgress(userId: string): Promise<Set<string> | null> {
  const { data, error } = await supabase
    .from("education_lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId);

  if (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }

  return new Set(data.map((row) => row.lesson_id));
}

async function migrateLocalToRemote(userId: string, remote: Set<string>) {
  const local = readLocalEducationProgress();
  const toMigrate = [...local].filter((id) => !remote.has(id));
  if (toMigrate.length === 0) return remote;

  const { error } = await supabase.from("education_lesson_progress").upsert(
    toMigrate.map((lesson_id) => ({ user_id: userId, lesson_id })),
    { onConflict: "user_id,lesson_id" },
  );

  if (error) {
    if (isMissingTableError(error)) return remote;
    throw error;
  }

  localStorage.removeItem(EDUCATION_PROGRESS_STORAGE_KEY);
  toMigrate.forEach((id) => remote.add(id));
  return remote;
}

export function useEducationProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["education-progress", user?.id ?? "guest"] as const;

  const { data: completed = new Set<string>(), isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return readLocalEducationProgress();

      const remote = await fetchRemoteProgress(user.id);
      if (!remote) return readLocalEducationProgress();

      return migrateLocalToRemote(user.id, remote);
    },
    staleTime: 30_000,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ lessonId, complete }: { lessonId: string; complete: boolean }) => {
      if (!user) {
        toggleLocalEducationProgress(lessonId);
        return;
      }

      if (complete) {
        const { error } = await supabase.from("education_lesson_progress").upsert(
          { user_id: user.id, lesson_id: lessonId },
          { onConflict: "user_id,lesson_id" },
        );
        if (error) {
          if (isMissingTableError(error)) {
            toggleLocalEducationProgress(lessonId);
            return;
          }
          throw error;
        }
        return;
      }

      const { error } = await supabase
        .from("education_lesson_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);

      if (error) {
        if (isMissingTableError(error)) {
          toggleLocalEducationProgress(lessonId);
          return;
        }
        throw error;
      }
    },
    onMutate: async ({ lessonId, complete }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Set<string>>(queryKey) ?? new Set<string>();
      const next = new Set(previous);
      if (complete) next.add(lessonId);
      else next.delete(lessonId);
      queryClient.setQueryData(queryKey, next);
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: (_data, vars) => {
      if (vars.complete) trackEvent("education.lesson_complete", { lesson_id: vars.lessonId });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const toggleLesson = useCallback(
    (lessonId: string) => {
      toggleMutation.mutate({ lessonId, complete: !completed.has(lessonId) });
    },
    [completed, toggleMutation],
  );

  const isLessonComplete = useCallback((lessonId: string) => completed.has(lessonId), [completed]);

  const totalLessons = useCallback(
    (lessonIds: string[]) => lessonIds.filter((id) => completed.has(id)).length,
    [completed],
  );

  return useMemo(
    () => ({
      completed,
      isLoading,
      isSyncing: toggleMutation.isPending,
      toggleLesson,
      isLessonComplete,
      totalLessons,
    }),
    [completed, isLoading, toggleMutation.isPending, toggleLesson, isLessonComplete, totalLessons],
  );
}
