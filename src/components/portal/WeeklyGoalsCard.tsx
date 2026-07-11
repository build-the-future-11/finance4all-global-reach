import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Bookmark, CheckCircle2, Circle, GraduationCap, Users } from "lucide-react";
import { useMyMemberStats } from "@/hooks/portal/useMemberStats";
import { useEducationProgress } from "@/hooks/portal/useEducationProgress";
import { EDUCATION_MODULES } from "@/data/educationModules";
import { portalRoutes } from "@/routes/portal";
import { portalCopy } from "@/lib/portalCopy";
import { PortalCard } from "@/components/portal/PortalUI";

const STORAGE_KEY = "f4a-weekly-goals-baseline";

function getWeekKey(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  return monday.toISOString().slice(0, 10);
}

interface Baseline {
  week: string;
  savedArticles: number;
  connections: number;
  completedLessons: number;
}

function readBaseline(): Baseline | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Baseline) : null;
  } catch {
    return null;
  }
}

function writeBaseline(baseline: Baseline) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(baseline));
  } catch {
    /* ignore quota */
  }
}

export default function WeeklyGoalsCard() {
  const { data: stats } = useMyMemberStats();
  const { totalLessons } = useEducationProgress();
  const allLessonIds = EDUCATION_MODULES.flatMap((m) => m.lessons.map((l) => l.id));
  const completedLessons = totalLessons(allLessonIds);

  const goals = useMemo(() => {
    const week = getWeekKey();
    let baseline = readBaseline();
    if (!baseline || baseline.week !== week) {
      baseline = {
        week,
        savedArticles: stats?.savedArticles ?? 0,
        connections: stats?.connections ?? 0,
        completedLessons,
      };
      writeBaseline(baseline);
    }

    const savedDone = (stats?.savedArticles ?? 0) > baseline.savedArticles;
    const connectDone = (stats?.connections ?? 0) > baseline.connections;
    const lessonDone = completedLessons > baseline.completedLessons;

    return [
      { id: "save", label: portalCopy.goals.saveArticle, done: savedDone, href: portalRoutes.debriefed, icon: Bookmark },
      { id: "connect", label: portalCopy.goals.connectMember, done: connectDone, href: portalRoutes.network, icon: Users },
      { id: "lesson", label: portalCopy.goals.completeLesson, done: lessonDone, href: portalRoutes.education, icon: GraduationCap },
    ];
  }, [stats, completedLessons]);

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
