import { Link } from "react-router-dom";
import { CheckCircle2, Circle, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { computeProfileCompleteness, useMyMemberStats } from "@/hooks/portal/useMemberStats";
import { portalRoutes } from "@/routes/portal";
import {
  PortalCard,
  portalButtonPrimary,
} from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { portalCopy } from "@/lib/portalCopy";

const STORAGE_KEY = "f4a-onboarding-dismissed";
export const DEBRIEFED_VISITED_KEY = "f4a-visited-debriefed";

const { onboarding } = portalCopy;

const STEPS = [
  { id: "profile", label: onboarding.steps.profile, path: portalRoutes.settings },
  { id: "debriefed", label: onboarding.steps.debriefed, path: portalRoutes.debriefed },
  { id: "education", label: onboarding.steps.education, path: portalRoutes.education },
  { id: "network", label: onboarding.steps.network, path: portalRoutes.network },
  { id: "saved", label: onboarding.steps.saved, path: portalRoutes.saved },
] as const;

function isStepDone(
  stepId: (typeof STEPS)[number]["id"],
  percent: number,
  stats: { connections: number; savedArticles: number; savedProjects: number } | undefined,
): boolean {
  switch (stepId) {
    case "profile":
      return percent >= 80;
    case "debriefed":
      return localStorage.getItem(DEBRIEFED_VISITED_KEY) === "1" || (stats?.savedArticles ?? 0) > 0;
    case "education":
      return localStorage.getItem("f4a-education-progress") !== null &&
        localStorage.getItem("f4a-education-progress") !== "[]";
    case "network":
      return (stats?.connections ?? 0) > 0;
    case "saved":
      return (stats?.savedArticles ?? 0) + (stats?.savedProjects ?? 0) > 0;
    default:
      return false;
  }
}

export default function PortalOnboardingChecklist() {
  const { profile } = useAuth();
  const { data: stats } = useMyMemberStats();
  const [dismissed, setDismissed] = useState(true);

  const { percent, missing } = computeProfileCompleteness(profile);
  const completedCount = STEPS.filter((s) => isStepDone(s.id, percent, stats)).length;
  const allDone = completedCount === STEPS.length;

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (dismissed || allDone) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  return (
    <PortalCard className="relative overflow-hidden border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-6">
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white/70"
        aria-label="Dismiss checklist"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400/90">
        {onboarding.eyebrow}
      </p>
      <h3 className="mt-1 text-lg font-semibold text-white">{onboarding.title}</h3>
      <p className="mt-1 text-sm text-white/50">
        {completedCount}/{STEPS.length} complete
        {missing.length > 0 && percent < 80 && ` — still need ${missing[0].toLowerCase()}`}
      </p>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
          style={{ width: `${(completedCount / STEPS.length) * 100}%` }}
        />
      </div>

      <ul className="mt-5 space-y-2">
        {STEPS.map((step) => {
          const done = isStepDone(step.id, percent, stats);
          const Icon = done ? CheckCircle2 : Circle;
          return (
            <li key={step.id}>
              <Link
                to={step.path}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition hover:bg-white/[0.06]"
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${done ? "text-emerald-400" : "text-white/25"}`}
                />
                <span className={done ? "text-white/45 line-through" : "text-white/75"}>
                  {step.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link to={portalRoutes.settings} className="mt-4 inline-block">
        <Button size="sm" className={portalButtonPrimary}>
          {percent < 80 ? onboarding.ctaProfile : onboarding.ctaExplore}
        </Button>
      </Link>
    </PortalCard>
  );
}
