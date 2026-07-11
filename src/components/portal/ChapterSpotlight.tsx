import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChapters, useEvents } from "@/hooks/portal/useEvents";
import { portalRoutes } from "@/routes/portal";
import { portalCopy } from "@/lib/portalCopy";
import {
  PortalCard,
  SkeletonList,
  portalButtonPrimary,
} from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ChapterSpotlight() {
  const { profile } = useAuth();
  const chapterId = profile?.chapterId;
  const { data: chapters, isLoading: chaptersLoading } = useChapters();
  const { data: events, isLoading: eventsLoading } = useEvents(chapterId);

  if (!chapterId) return null;

  if (chaptersLoading || eventsLoading) {
    return <SkeletonList count={1} />;
  }

  const chapter = chapters?.find((c) => c.id === chapterId);
  if (!chapter) return null;

  const now = Date.now();
  const nextEvent = events
    ?.filter((e) => e.status === "upcoming" && new Date(e.startsAt).getTime() > now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];

  return (
    <PortalCard className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
            Your chapter
          </p>
          <h3 className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-400" />
            {chapter.name}, {chapter.country}
          </h3>
          <p className="mt-2 text-sm text-white/50">{portalCopy.dashboard.chapterSpotlight}</p>
          {nextEvent ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/40">
                <Calendar className="h-3.5 w-3.5" />
                Next event
              </p>
              <p className="mt-1 font-medium text-white">{nextEvent.title}</p>
              <p className="text-sm text-white/50">
                {new Date(nextEvent.startsAt).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/40">{portalCopy.dashboard.chapterSpotlightEmpty}</p>
          )}
        </div>
        <Button asChild size="sm" className={cn("shrink-0", portalButtonPrimary)}>
          <Link to={portalRoutes.events}>Chapter events →</Link>
        </Button>
      </div>
    </PortalCard>
  );
}
