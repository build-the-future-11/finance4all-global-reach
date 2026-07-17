import { Link } from "react-router-dom";
import { Briefcase, Calendar, FlaskConical } from "lucide-react";
import { useMyLabApplications } from "@/hooks/portal/useLabs";
import { useEventRegistrations } from "@/hooks/portal/useEvents";
import { useOpportunityInterests } from "@/hooks/portal/usePathways";
import { portalRoutes } from "@/routes/portal";
import { PortalCard, PortalSection } from "@/components/portal/PortalUI";

export default function ParticipationSummary() {
  const { data: apps } = useMyLabApplications();
  const { data: regs } = useEventRegistrations();
  const { data: interests } = useOpportunityInterests();

  const labCount = apps?.length ?? 0;
  const eventCount = regs?.length ?? 0;
  const interestCount = interests?.length ?? 0;
  const pendingLabs = apps?.filter((a) => a.status === "pending" || a.status === "under_review").length ?? 0;

  const rows = [
    {
      icon: FlaskConical,
      label: "Lab applications",
      value: labCount,
      hint: pendingLabs > 0 ? `${pendingLabs} awaiting review` : "Apply to open Meta Labs projects",
      href: portalRoutes.labs,
    },
    {
      icon: Calendar,
      label: "Event registrations",
      value: eventCount,
      hint: "Chapter meetups, workshops, and competitions",
      href: portalRoutes.events,
    },
    {
      icon: Briefcase,
      label: "Saved opportunities",
      value: interestCount,
      hint: "Internships, programs, and project roles you marked",
      href: portalRoutes.pathwaysOpportunities,
    },
  ];

  return (
    <PortalSection title="Your participation">
      <div className="grid gap-3 sm:grid-cols-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <Link key={row.label} to={row.href}>
              <PortalCard hover className="h-full p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-semibold tabular-nums text-white">{row.value}</p>
                    <p className="mt-1 text-sm font-medium text-white/80">{row.label}</p>
                    <p className="mt-1 text-xs text-white/45">{row.hint}</p>
                  </div>
                </div>
              </PortalCard>
            </Link>
          );
        })}
      </div>
    </PortalSection>
  );
}
