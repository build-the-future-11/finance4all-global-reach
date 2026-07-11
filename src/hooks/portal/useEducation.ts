import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  EDUCATION_MODULES,
  type EducationModule,
  type EducationLesson,
} from "@/data/educationModules";
import { LESSON_CONTENT, type LessonContent } from "@/data/lessonContent";

function isMissingCms(error: { code?: string; message?: string } | null) {
  return error?.code === "42P01" || Boolean(error?.message?.includes("does not exist"));
}

function mapDbModule(
  row: {
    id: string;
    title: string;
    eyebrow: string;
    description: string;
    difficulty: string;
    inclusive_note: string | null;
    sort_order: number;
  },
  lessons: EducationLesson[],
): EducationModule {
  return {
    id: row.id,
    title: row.title,
    eyebrow: row.eyebrow,
    description: row.description,
    difficulty: row.difficulty as EducationModule["difficulty"],
    inclusiveNote: row.inclusive_note ?? undefined,
    lessons,
  };
}

export function useEducationModules() {
  return useQuery({
    queryKey: ["education-modules"],
    queryFn: async (): Promise<EducationModule[]> => {
      const { data: modules, error: modErr } = await supabase
        .from("education_modules")
        .select("*")
        .order("sort_order");

      if (modErr) {
        if (isMissingCms(modErr)) return EDUCATION_MODULES;
        throw modErr;
      }
      if (!modules?.length) return EDUCATION_MODULES;

      const { data: lessons, error: lessonErr } = await supabase
        .from("education_lessons")
        .select("*")
        .order("sort_order");

      if (lessonErr) {
        if (isMissingCms(lessonErr)) return EDUCATION_MODULES;
        throw lessonErr;
      }

      const lessonsByModule = new Map<string, EducationLesson[]>();
      for (const row of lessons ?? []) {
        const list = lessonsByModule.get(row.module_id) ?? [];
        list.push({
          id: row.id,
          title: row.title,
          durationMin: row.duration_min,
          summary: row.summary,
          objectives: row.objectives,
        });
        lessonsByModule.set(row.module_id, list);
      }

      return modules.map((m) => mapDbModule(m, lessonsByModule.get(m.id) ?? []));
    },
    staleTime: 120_000,
  });
}

export function useEducationLesson(lessonId: string | undefined) {
  const modulesQuery = useEducationModules();

  const lessonMeta = modulesQuery.data
    ?.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m })))
    .find((l) => l.id === lessonId);

  return useQuery({
    queryKey: ["education-lesson", lessonId],
    enabled: Boolean(lessonId),
    queryFn: async (): Promise<{ lesson: typeof lessonMeta; content: LessonContent } | null> => {
      if (!lessonId) return null;

      const { data, error } = await supabase
        .from("education_lessons")
        .select("*")
        .eq("id", lessonId)
        .maybeSingle();

      if (error) {
        if (isMissingCms(error)) {
          const staticContent = LESSON_CONTENT[lessonId];
          if (!lessonMeta || !staticContent) return null;
          return { lesson: lessonMeta, content: staticContent };
        }
        throw error;
      }

      if (!data) {
        const staticContent = LESSON_CONTENT[lessonId];
        if (!lessonMeta || !staticContent) return null;
        return { lesson: lessonMeta, content: staticContent };
      }

      const content: LessonContent = {
        body: data.body,
        exercise: data.exercise,
        keyTerms: data.key_terms,
      };

      const module = modulesQuery.data?.find((m) => m.id === data.module_id);
      const lesson = module
        ? {
            id: data.id,
            title: data.title,
            durationMin: data.duration_min,
            summary: data.summary,
            objectives: data.objectives,
            module,
          }
        : lessonMeta;

      if (!lesson) return null;
      return { lesson, content };
    },
    staleTime: 120_000,
  });
}
