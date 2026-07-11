import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Award, CheckCircle2, Circle, Clock } from "lucide-react";
import { toast } from "sonner";
import { EDUCATION_MODULES } from "@/data/educationModules";
import { useEducationModules } from "@/hooks/portal/useEducation";
import { useEducationProgress } from "@/hooks/portal/useEducationProgress";
import GlossarySearch from "@/components/portal/GlossarySearch";
import ModuleProgressRing from "@/components/portal/ModuleProgressRing";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { portalRoutes } from "@/routes/portal";
import { portalCopy } from "@/lib/portalCopy";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const CELEBRATION_KEY = "f4a-education-celebrated";

export default function EducationHub() {
  useDocumentTitle("Education");
  const { data: educationModules, isLoading: modulesLoading } = useEducationModules();
  const modules = modulesLoading ? EDUCATION_MODULES : (educationModules ?? EDUCATION_MODULES);
  const { isLessonComplete, totalLessons } = useEducationProgress();
  const celebratedRef = useRef(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const allLessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
  const completedCount = totalLessons(allLessonIds);
  const allComplete = completedCount === allLessonIds.length && allLessonIds.length > 0;

  useEffect(() => {
    if (!allComplete || celebratedRef.current) return;
    try {
      if (localStorage.getItem(CELEBRATION_KEY)) return;
      localStorage.setItem(CELEBRATION_KEY, "1");
    } catch {
      /* ignore */
    }
    celebratedRef.current = true;
    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (!prefersReducedMotion) setShowConfetti(true);
    toast.success(portalCopy.educationHub.completeToast, {
      description: portalCopy.education.certificate,
      duration: 6000,
    });
  }, [allComplete]);

  return (
    <div className="space-y-8">
      {showConfetti && <div className="portal-confetti pointer-events-none fixed inset-0 z-50" aria-hidden />}

      <PortalAnimatedSection>
        <PortalPageHeader
          eyebrow={portalCopy.education.eyebrow}
          title={portalCopy.education.title}
          description={portalCopy.education.description}
          action={
            <Link to={portalRoutes.resources}>
              <span className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
                {portalCopy.educationHub.facilitatorLink} →
              </span>
            </Link>
          }
        />
      </PortalAnimatedSection>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex-1">
          <p className="text-sm text-white/50">
            {completedCount} of {allLessonIds.length} lessons completed
          </p>
          <div className="mt-2 h-2 max-w-md overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
              style={{ width: `${(completedCount / allLessonIds.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-white/40">{portalCopy.education.progressNote}</p>
        </div>
        {allComplete && (
          <PortalCard className="flex items-center gap-3 border-emerald-400/30 bg-emerald-500/10 p-4 portal-celebrate">
            <Award className="h-8 w-8 text-emerald-300" />
            <div>
              <p className="font-semibold text-white">{portalCopy.educationHub.completeTitle}</p>
              <p className="text-xs text-white/50">{portalCopy.education.certificate}</p>
            </div>
          </PortalCard>
        )}
      </div>

      <div className="mb-10">
        <GlossarySearch />
      </div>

      <div className="space-y-10">
        {modules.map((mod) => {
          const modDone = totalLessons(mod.lessons.map((l) => l.id));

          return (
            <section key={mod.id}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div className="flex items-start gap-4">
                  <ModuleProgressRing completed={modDone} total={mod.lessons.length} />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-emerald-400/80">
                      {mod.eyebrow}
                    </p>
                    <h2 className="text-xl font-bold text-white">{mod.title}</h2>
                    <p className="mt-1 max-w-2xl text-sm text-white/55">{mod.description}</p>
                  </div>
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
                      <Badge
                        variant="outline"
                        className="hidden shrink-0 border-white/15 text-[10px] text-white/45 sm:inline-flex"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        {lesson.durationMin} min
                      </Badge>
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
