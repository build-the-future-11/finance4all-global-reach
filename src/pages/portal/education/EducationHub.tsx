import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { EDUCATION_MODULES } from "@/data/educationModules";
import { useEducationProgress } from "@/hooks/portal/useEducationProgress";
import GlossarySearch from "@/components/portal/GlossarySearch";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { portalRoutes } from "@/routes/portal";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function EducationHub() {
  useDocumentTitle("Education");
  const { isLessonComplete, totalLessons } = useEducationProgress();

  const allLessonIds = EDUCATION_MODULES.flatMap((m) => m.lessons.map((l) => l.id));
  const completedCount = totalLessons(allLessonIds);

  return (
    <div>
      <PortalPageHeader
        eyebrow="Catalyst CFEI"
        title="Education"
        description="Structured lessons used in Finance4All school outreach — budgeting, markets, and research writing. Each lesson includes reading, exercises, and key terms."
        action={
          <Link to={portalRoutes.resources}>
            <span className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
              Facilitator resources →
            </span>
          </Link>
        }
      />

      <div className="mb-8 flex items-baseline justify-between border-b border-white/10 pb-4">
        <p className="text-sm text-white/50">
          {completedCount} of {allLessonIds.length} lessons completed
        </p>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-emerald-400 transition-all"
            style={{ width: `${(completedCount / allLessonIds.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-10">
        <GlossarySearch />
      </div>

      <div className="space-y-10">
        {EDUCATION_MODULES.map((mod) => {
          const modDone = totalLessons(mod.lessons.map((l) => l.id));

          return (
            <section key={mod.id}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-emerald-400/80">
                    {mod.eyebrow}
                  </p>
                  <h2 className="text-xl font-bold text-white">{mod.title}</h2>
                  <p className="mt-1 max-w-2xl text-sm text-white/55">{mod.description}</p>
                </div>
                <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                  {mod.difficulty} · {modDone}/{mod.lessons.length}
                </Badge>
              </div>

              <div className="divide-y divide-white/[0.08] rounded-2xl border border-white/10 bg-white/[0.02]">
                {mod.lessons.map((lesson) => {
                  const done = isLessonComplete(lesson.id);
                  const Icon = done ? CheckCircle2 : Circle;
                  return (
                    <Link
                      key={lesson.id}
                      to={`${portalRoutes.education}/${lesson.id}`}
                      className="group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.04]"
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${done ? "text-emerald-400" : "text-white/20"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white group-hover:text-emerald-200">
                          {lesson.title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-sm text-white/45">{lesson.summary}</p>
                      </div>
                      <span className="hidden text-xs text-white/35 sm:inline">
                        {lesson.durationMin} min
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-white/20 transition group-hover:text-emerald-400" />
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
