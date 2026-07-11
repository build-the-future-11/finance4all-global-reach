import { Bookmark, Calendar, FlaskConical, Users } from "lucide-react";
import { useMyMemberStats } from "@/hooks/portal/useMemberStats";
import { portalCopy } from "@/lib/portalCopy";
import { PortalCard } from "@/components/portal/PortalUI";

export default function EngagementSummary() {
  const { data: stats } = useMyMemberStats();

  const saved = stats?.savedArticles ?? 0;
  const connections = stats?.connections ?? 0;
  const labs = stats?.labApplications ?? 0;
  const events = stats?.eventsRegistered ?? 0;
  const total = saved + connections + labs + events;

  const message =
    total > 0 ? portalCopy.dashboard.engagementActive : portalCopy.dashboard.engagementStarting;

  return (
    <PortalCard className="p-5">
      <h3 className="text-sm font-semibold text-white">{portalCopy.dashboard.engagementTitle}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/55">{message}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <Bookmark className="mx-auto h-4 w-4 text-emerald-400" />
          <p className="mt-2 text-xl font-bold text-white">{saved}</p>
          <p className="text-[10px] uppercase tracking-wider text-white/40">Saved</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <FlaskConical className="mx-auto h-4 w-4 text-blue-400" />
          <p className="mt-2 text-xl font-bold text-white">{labs}</p>
          <p className="text-[10px] uppercase tracking-wider text-white/40">Lab apps</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <Users className="mx-auto h-4 w-4 text-amber-400" />
          <p className="mt-2 text-xl font-bold text-white">{connections}</p>
          <p className="text-[10px] uppercase tracking-wider text-white/40">Connections</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <Calendar className="mx-auto h-4 w-4 text-purple-400" />
          <p className="mt-2 text-xl font-bold text-white">{events}</p>
          <p className="text-[10px] uppercase tracking-wider text-white/40">Events</p>
        </div>
      </div>
    </PortalCard>
  );
}
