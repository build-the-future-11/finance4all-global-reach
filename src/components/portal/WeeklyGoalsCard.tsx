import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Bookmark, CheckCircle2, Circle, GraduationCap, Users } from "lucide-react";
import { useMyMemberStats } from "@/hooks/portal/useMemberStats";
import { useEducationProgress } from "@/hooks/portal/useEducationProgress";
import { useWeeklyGoalsBaseline } from "@/hooks/portal/useWeeklyGoals";
import { EDUCATION_MODULES } from "@/data/educationModules";
import { portalRoutes } from "@/routes/portal";
import { portalCopy } from "@/lib/portalCopy";
import { PortalCard } from "@/components/portal/PortalUI";

export default function WeeklyGoalsCard() {
  const { data: stats } = useMyMemberStats();
  const { totalLessons } = useEducationProgress();
  const allLessonIds = EDUCATION_MODULES.flatMap((m) => m.lessons.map((l) => l.id));
  const completedLessons = totalLessons(allLessonIds);

  const current = useMemo(
    () => ({
      savedArticles: stats?.savedArticles ?? 0,
      connections: stats?.connections ?? 0,
      completedLessons,
    }),
    [stats?.savedArticles, stats?.connections, completedLessons],
  );

  const { data: baseline } = useWeeklyGoalsBaseline(current);

  const goals = useMemo(() => {
    const base = baseline ?? {
      weekStart: "",
      savedArticles: current.savedArticles,
      connections: current.connections,
      completedLessons: current.completedLessons,
    };

    const savedDone = current.savedArticles > base.savedArticles;
    const connectDone = current.connections > base.connections;
    const lessonDone = current.completedLessons > base.completedLessons;

    return [
      { id: "save", label: portalCopy.goals.saveArticle, done: savedDone, href: portalRoutes.debriefed, icon: Bookmark },
      { id: "connect", label: portalCopy.goals.connectMember, done: connectDone, href: portalRoutes.network, icon: Users },
      { id: "lesson", label: portalCopy.goals.completeLesson, done: lessonDone, href: portalRoutes.education, icon: GraduationCap },
    ];
  }, [baseline, current]);

  const allDone = goals.every((g) => g.done);
  const doneCount = goals.filter((g) => g.done).length;

  return (
    <PortalCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{portalCopy.goals.title}</h3>
          <p className="mt-1 text-xs text-white/45">{portalCopy.goals.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
          {doneCount}/{goals.length}
        </span>
      </div>
      <ul className="mt-4 space-y-2">
        {goals.map((goal) => {
          const Icon = goal.done ? CheckCircle2 : Circle;
          return (
            <li key={goal.id}>
              <Link
                to={goal.href}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.04]"
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${goal.done ? "text-emerald-400" : "text-white/25"}`}
                />
                <span className={`text-sm ${goal.done ? "text-white/50 line-through" : "text-white/75"}`}>
                  {goal.label}
                </span>
                <goal.icon className="ml-auto h-3.5 w-3.5 text-white/25" />
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-white/40">
        {allDone ? portalCopy.goals.allDone : portalCopy.goals.progress}
      </p>
    </PortalCard>
  );
}
