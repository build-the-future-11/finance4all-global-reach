import { Link } from "react-router-dom";
import { CheckCircle2, Circle, GraduationCap, Heart } from "lucide-react";
import { EDUCATION_MODULES } from "@/data/educationModules";
import { useEducationProgress } from "@/hooks/portal/useEducationProgress";
import FinanceAssistant from "@/components/portal/FinanceAssistant";
import {
  PortalCard,
  PortalPageHeader,
  PortalSection,
} from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { portalRoutes } from "@/routes/portal";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function EducationHub() {
  useDocumentTitle("Education");
  const { toggleLesson, isLessonComplete, totalLessons } = useEducationProgress();

  const allLessonIds = EDUCATION_MODULES.flatMap((m) => m.lessons.map((l) => l.id));
  const completedCount = totalLessons(allLessonIds);

  return (
    <div>
      <PortalPageHeader
        eyebrow="Catalyst CFEI"
        title="Education hub"
        description="Free financial literacy curriculum, macro essentials, and research prep — built for students everywhere, regardless of background or prior experience."
        action={
          <Link to={portalRoutes.resources}>
            <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
              All resources
            </Button>
          </Link>
        }
      />

      <PortalCard className="mb-8 flex flex-wrap items-center gap-4 border-emerald-400/20 bg-emerald-500/[0.06] p-5">
        <Heart className="h-8 w-8 text-emerald-400" />
        <div className="flex-1">
          <p className="font-medium text-white">Inclusive by design</p>
          <p className="text-sm text-white/55">
            Plain-language lessons, glossary support, and zero cost. Programs like Catalyst and
            S.I.S.T.E.R exist so geography and income never block access to finance education.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-300">
            {completedCount}/{allLessonIds.length}
          </p>
          <p className="text-xs text-white/40">lessons completed</p>
        </div>
      </PortalCard>

      <PortalSection title="Finance assistant">
        <FinanceAssistant />
      </PortalSection>

      <div className="mt-10 space-y-8">
        {EDUCATION_MODULES.map((mod) => {
          const modLessonIds = mod.lessons.map((l) => l.id);
          const modDone = totalLessons(modLessonIds);

          return (
            <PortalCard key={mod.id} className="overflow-hidden p-0">
              <div className="border-b border-white/10 bg-white/[0.03] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
                      {mod.eyebrow}
                    </p>
                    <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-white">
                      <GraduationCap className="h-5 w-5 text-emerald-400" />
                      {mod.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-white/55">{mod.description}</p>
                    {mod.inclusiveNote && (
                      <p className="mt-2 text-xs text-emerald-200/70">{mod.inclusiveNote}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                    {mod.difficulty}
                  </Badge>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{ width: `${(modDone / mod.lessons.length) * 100}%` }}
                  />
                </div>
              </div>

              <ul className="divide-y divide-white/[0.06]">
                {mod.lessons.map((lesson) => {
                  const done = isLessonComplete(lesson.id);
                  const Icon = done ? CheckCircle2 : Circle;
                  return (
                    <li key={lesson.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 shrink-0 ${done ? "text-emerald-400" : "text-white/25"}`} />
                          <h3 className="font-medium text-white">{lesson.title}</h3>
                          <span className="text-xs text-white/35">{lesson.durationMin} min</span>
                        </div>
                        <p className="mt-2 text-sm text-white/55">{lesson.summary}</p>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {lesson.objectives.map((obj) => (
                            <span
                              key={obj}
                              className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/45 ring-1 ring-white/10"
                            >
                              {obj}
                            </span>
                          ))}
                        </ul>
                      </div>
                      <Button
                        size="sm"
                        variant={done ? "outline" : "default"}
                        className={
                          done
                            ? "border-white/20 text-white shrink-0"
                            : "bg-emerald-500 hover:bg-emerald-400 shrink-0"
                        }
                        onClick={() => toggleLesson(lesson.id)}
                      >
                        {done ? "Completed" : "Mark complete"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </PortalCard>
          );
        })}
      </div>
    </div>
  );
}
