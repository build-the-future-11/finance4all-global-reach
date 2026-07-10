import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { EDUCATION_MODULES } from "@/data/educationModules";
import { LESSON_CONTENT } from "@/data/lessonContent";
import { useEducationProgress } from "@/hooks/portal/useEducationProgress";
import MarkdownContent from "@/components/portal/MarkdownContent";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { portalRoutes } from "@/routes/portal";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function EducationLesson() {
  const { lessonId } = useParams();
  const { toggleLesson, isLessonComplete } = useEducationProgress();

  const lesson = EDUCATION_MODULES.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, module: m })),
  ).find((l) => l.id === lessonId);

  const content = lessonId ? LESSON_CONTENT[lessonId] : undefined;
  const done = lessonId ? isLessonComplete(lessonId) : false;

  useDocumentTitle(lesson?.title ?? "Lesson");

  if (!lesson || !content) {
    return (
      <div>
        <Link to={portalRoutes.education} className="text-sm text-emerald-300 hover:underline">
          ← Education hub
        </Link>
        <p className="mt-6 text-white/60">Lesson not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        to={portalRoutes.education}
        className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-300 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> {lesson.module.title}
      </Link>

      <PortalPageHeader
        eyebrow={lesson.module.eyebrow}
        title={lesson.title}
        description={lesson.summary}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {content.keyTerms.map((term) => (
          <span
            key={term}
            className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/55"
          >
            {term}
          </span>
        ))}
        <span className="text-xs text-white/35">{lesson.durationMin} min read</span>
      </div>

      <PortalCard className="p-6 sm:p-8">
        <MarkdownContent content={content.body} />
      </PortalCard>

      <PortalCard className="mt-6 border-emerald-400/15 p-6">
        <h2 className="font-semibold text-white">Exercise</h2>
        <div className="mt-3 text-sm leading-relaxed text-white/65">
          <MarkdownContent content={content.exercise} />
        </div>
      </PortalCard>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          onClick={() => toggleLesson(lesson.id)}
          className={done ? "border-white/20 bg-transparent text-white" : "bg-emerald-500 hover:bg-emerald-400"}
          variant={done ? "outline" : "default"}
        >
          {done && <CheckCircle2 className="mr-2 h-4 w-4" />}
          {done ? "Completed — click to undo" : "Mark lesson complete"}
        </Button>
        <Link to={portalRoutes.debriefedExplainers}>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Related explainers
          </Button>
        </Link>
      </div>
    </div>
  );
}
