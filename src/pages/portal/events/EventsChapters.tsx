import { useMemo, useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Calendar, CalendarPlus, ExternalLink, LayoutGrid, List, MapPin, Users } from "lucide-react";
import {
  useChapters,
  useEvents,
  useEventRegistrations,
  useToggleEventRegistration,
} from "@/hooks/portal/useEvents";
import ChapterMap from "@/components/portal/ChapterMap";
import {
  PortalCard,
  PortalPageHeader,
  PortalTabsList,
  PortalTabsTrigger,
  QueryStatus,
  portalButtonOutline,
  portalButtonPrimary,
} from "@/components/portal/PortalUI";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { toast } from "sonner";
import { portalCopy } from "@/lib/portalCopy";
import { downloadIcal } from "@/lib/downloadIcal";
import { getEventRegistrationState } from "@/lib/eventRegistration";
import PortalAnimatedSection from "@/components/portal/PortalAnimatedSection";

function groupEventsByMonth(events: { id: string; title: string; startsAt: string }[]) {
  const groups = new Map<string, typeof events>();
  for (const e of events) {
    const key = new Date(e.startsAt).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(e);
  }
  return [...groups.entries()];
}

export default function EventsChapters() {
  useDocumentTitle("Events");
  const [selectedChapter, setSelectedChapter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [eventFilter, setEventFilter] = useState<"all" | "mine">("all");
  const {
    data: chapters,
    isLoading: chaptersLoading,
    error: chaptersError,
    refetch: refetchChapters,
  } = useChapters();
  const {
    data: events,
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useEvents(selectedChapter === "all" ? undefined : selectedChapter);
  const { data: registrations } = useEventRegistrations();
  const toggleReg = useToggleEventRegistration();

  const chapterMap = Object.fromEntries(chapters?.map((c) => [c.id, c]) ?? []);

  const handleRegister = async (eventId: string, registered: boolean) => {
    try {
      await toggleReg.mutateAsync({ eventId, registered: !registered });
      toast.success(registered ? "Registration cancelled" : "You're registered!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update registration");
    }
  };

  const handleChapterSelect = (id: string) => {
    setSelectedChapter(id);
  };

  const displayEvents = useMemo(() => {
    if (!events) return [];
    if (eventFilter === "mine") {
      return events.filter((e) => registrations?.has(e.id));
    }
    return events;
  }, [events, eventFilter, registrations]);

  const eventsByMonth = useMemo(
    () => groupEventsByMonth(displayEvents),
    [displayEvents],
  );

  return (
    <div>
      <PortalAnimatedSection>
        <PortalPageHeader
          eyebrow={portalCopy.events.eyebrow}
          title={portalCopy.events.title}
          description={portalCopy.events.description}
        />
      </PortalAnimatedSection>

      <QueryStatus
        isLoading={chaptersLoading}
        error={chaptersError}
        isEmpty={!chapters?.length}
        emptyMessage={portalCopy.events.emptyChapters}
        onRetry={() => refetchChapters()}
        skeletonCount={2}
      >
        {chapters && chapters.length > 0 && (
          <section className="mb-8 space-y-6">
            <ChapterMap
              chapters={chapters}
              selectedId={selectedChapter === "all" ? undefined : selectedChapter}
              onSelect={handleChapterSelect}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => handleChapterSelect(chapter.id)}
                  className="text-left"
                >
                  <PortalCard
                    className={`p-5 transition ${
                      selectedChapter === chapter.id
                        ? "border-emerald-400/40 bg-emerald-500/10"
                        : "hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-emerald-400/10 p-2 text-emerald-300">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{chapter.name}</h3>
                        <p className="text-sm text-white/50">
                          {chapter.city}, {chapter.country}
                        </p>
                        <p className="mt-2 flex items-center gap-1 text-xs text-white/40">
                          <Users className="h-3 w-3" /> {chapter.memberCount} members
                        </p>
                      </div>
                    </div>
                  </PortalCard>
                </button>
              ))}
            </div>
          </section>
        )}
      </QueryStatus>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Events</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-lg bg-white/[0.04] p-1">
              <Button
                size="sm"
                variant={eventFilter === "all" ? "default" : "ghost"}
                className={eventFilter === "all" ? "bg-emerald-500/20 text-emerald-300" : "text-white/50"}
                onClick={() => setEventFilter("all")}
              >
                All events
              </Button>
              <Button
                size="sm"
                variant={eventFilter === "mine" ? "default" : "ghost"}
                className={eventFilter === "mine" ? "bg-emerald-500/20 text-emerald-300" : "text-white/50"}
                onClick={() => setEventFilter("mine")}
              >
                My events
              </Button>
            </div>
            <div className="flex gap-1 rounded-lg bg-white/[0.04] p-1">
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              className={viewMode === "list" ? "bg-emerald-500/20 text-emerald-300" : "text-white/50"}
              onClick={() => setViewMode("list")}
            >
              <List className="mr-1.5 h-3.5 w-3.5" /> List
            </Button>
            <Button
              size="sm"
              variant={viewMode === "calendar" ? "default" : "ghost"}
              className={viewMode === "calendar" ? "bg-emerald-500/20 text-emerald-300" : "text-white/50"}
              onClick={() => setViewMode("calendar")}
            >
              <LayoutGrid className="mr-1.5 h-3.5 w-3.5" /> Calendar
            </Button>
          </div>
          </div>
        </div>

        {chapters && chapters.length > 0 && (
          <Tabs value={selectedChapter} onValueChange={setSelectedChapter} className="mb-6">
            <PortalTabsList>
              <PortalTabsTrigger value="all">All</PortalTabsTrigger>
              {chapters.map((c) => (
                <PortalTabsTrigger key={c.id} value={c.id}>
                  {c.name}
                </PortalTabsTrigger>
              ))}
            </PortalTabsList>
          </Tabs>
        )}

        <QueryStatus
          isLoading={eventsLoading}
          error={eventsError}
          isEmpty={!displayEvents.length}
          emptyMessage={eventFilter === "mine" ? "You haven't registered for any events yet. Browse chapters and register for upcoming meetups." : portalCopy.events.emptyEvents}
          onRetry={() => refetchEvents()}
        >
          {viewMode === "calendar" ? (
            <div className="space-y-8">
              {eventsByMonth.map(([month, monthEvents]) => (
                <div key={month}>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-emerald-400/80">
                    {month}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {monthEvents.map((event) => {
                      const full = displayEvents.find((e) => e.id === event.id) ?? events?.find((e) => e.id === event.id);
                      const d = new Date(event.startsAt);
                      const chapter = chapterMap[full?.chapterId ?? ""];
                      const registered = registrations?.has(event.id) ?? false;
                      const registration = full ? getEventRegistrationState(full) : { open: false, reason: "Registration is unavailable" };
                      return (
                        <PortalCard key={event.id} className="flex flex-col p-4">
                          <p className="text-2xl font-bold text-emerald-300">{d.getDate()}</p>
                          <p className="text-xs text-white/40">
                            {d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                          </p>
                          <p className="mt-2 font-medium text-white">{event.title}</p>
                          {chapter && <p className="mt-1 text-xs text-white/45">{chapter.name}</p>}
                          <Button
                            size="sm"
                            variant={registered ? "default" : "outline"}
                            className={`mt-3 ${registered ? portalButtonPrimary : portalButtonOutline}`}
                            onClick={() => handleRegister(event.id, registered)}
                            disabled={!registered && !registration.open}
                          >
                            {registered ? "Registered" : registration.open ? "Register" : registration.reason}
                          </Button>
                          {full && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 border-white/20 text-white"
                              onClick={() =>
                                downloadIcal({
                                  id: full.id,
                                  title: full.title,
                                  description: full.description,
                                  startsAt: full.startsAt,
                                  endsAt: full.endsAt,
                                  location: chapter ? `${chapter.name}, ${chapter.city}` : undefined,
                                })
                              }
                            >
                              <CalendarPlus className="mr-1 h-3 w-3" />
                              {portalCopy.calendar.addToCalendar}
                            </Button>
                          )}
                        </PortalCard>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <div className="space-y-4">
            {displayEvents.map((event) => {
              const chapter = chapterMap[event.chapterId];
              const registered = registrations?.has(event.id) ?? false;
              const registration = getEventRegistrationState(event);
              return (
                <PortalCard key={event.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                          {event.status}
                        </Badge>
                        {chapter && <span className="text-xs text-white/40">{chapter.name}</span>}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-white">{event.title}</h3>
                      <p className="mt-2 text-sm text-white/60">{event.description}</p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-white/40">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.startsAt).toLocaleString()}
                      </p>
                      {event.programLinks.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          {event.programLinks.map((link) => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-emerald-300 hover:underline"
                            >
                              {link.label} <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant={registered ? "default" : "outline"}
                        className={registered ? portalButtonPrimary : portalButtonOutline}
                        onClick={() => handleRegister(event.id, registered)}
                        disabled={!registered && !registration.open}
                      >
                        {registered ? "Registered" : registration.open ? "Register" : registration.reason}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white"
                        onClick={() =>
                          downloadIcal({
                            id: event.id,
                            title: event.title,
                            description: event.description,
                            startsAt: event.startsAt,
                            endsAt: event.endsAt,
                            location: chapter ? `${chapter.name}, ${chapter.city}` : undefined,
                          })
                        }
                      >
                        <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                        {portalCopy.calendar.addToCalendar}
                      </Button>
                      {event.registrationUrl && (
                        <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="w-full border-white/20 text-white">
                            External signup <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </PortalCard>
              );
            })}
          </div>
          )}
        </QueryStatus>
      </section>
    </div>
  );
}
