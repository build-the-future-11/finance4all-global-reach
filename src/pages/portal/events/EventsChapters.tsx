import { useState } from "react";
import { Calendar, ExternalLink, MapPin, Users } from "lucide-react";
import { useChapters, useEvents, useEventRegistrations, useToggleEventRegistration } from "@/hooks/portal/useEvents";
import { EmptyState, LoadingState, PortalCard, PortalPageHeader } from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function EventsChapters() {
  const [selectedChapter, setSelectedChapter] = useState<string>("all");
  const { data: chapters, isLoading: chaptersLoading } = useChapters();
  const { data: events, isLoading: eventsLoading } = useEvents(
    selectedChapter === "all" ? undefined : selectedChapter,
  );
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

  const isLoading = chaptersLoading || eventsLoading;

  return (
    <div>
      <PortalPageHeader
        title="Events + Chapters"
        description="Global chapters, local events, and registration."
      />

      {chapters && chapters.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Chapters</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter) => (
              <PortalCard key={chapter.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-emerald-400/10 p-2 text-emerald-300">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{chapter.name}</h3>
                    <p className="text-sm text-white/50">{chapter.city}, {chapter.country}</p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-white/40">
                      <Users className="h-3 w-3" /> {chapter.memberCount} members
                    </p>
                  </div>
                </div>
              </PortalCard>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Events</h2>

        {chapters && chapters.length > 0 && (
          <Tabs value={selectedChapter} onValueChange={setSelectedChapter} className="mb-6">
            <TabsList className="bg-white/5">
              <TabsTrigger value="all" className="data-[state=active]:bg-white/15">All</TabsTrigger>
              {chapters.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="data-[state=active]:bg-white/15">
                  {c.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {isLoading && <LoadingState />}
        {events && events.length === 0 && <EmptyState message="No events for this chapter." />}

        <div className="space-y-4">
          {events?.map((event) => {
            const chapter = chapterMap[event.chapterId];
            const registered = registrations?.has(event.id) ?? false;
            return (
              <PortalCard key={event.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-white/20 capitalize text-white/60">
                        {event.status}
                      </Badge>
                      {chapter && (
                        <span className="text-xs text-white/40">{chapter.name}</span>
                      )}
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
                      className={registered ? "" : "border-white/20 text-white"}
                      onClick={() => handleRegister(event.id, registered)}
                    >
                      {registered ? "Registered" : "Register interest"}
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
      </section>
    </div>
  );
}
