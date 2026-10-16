import { useEventClock } from "@/hooks/useEventClock";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useChapters, useEvents, useEventRegistrations, useToggleEventRegistration } from "@/hooks/portal/useEvents";
import ChapterMap from "@/components/portal/ChapterMap";
import EventExplorer from "@/components/experience/EventExplorer";
import { mergeEventCatalog } from "@/content/events";
import { eventRegistrationOpen } from "@/lib/event-calendar";
import { PortalPageHeader, QueryStatus } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSelectedRecord } from "@/hooks/useSelectedRecord";

export default function EventsChapters() {
  useDocumentTitle("Events & Calendar");
  const { selectedId, notice } = useSelectedRecord();
  const [selectedChapter, setSelectedChapter] = useState("all");
  const now = useEventClock();
  const { data: chapters } = useChapters();
  const { data: events, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEvents(selectedChapter === "all" ? undefined : selectedChapter, selectedId);
  const catalog = mergeEventCatalog((events ?? []).map(event => { const chapter = chapters?.find(item => item.id === event.chapterId); return { ...event, details: { ...event.details, city: event.details?.city ?? chapter?.city, country: event.details?.country ?? chapter?.country } }; }));
  const {
    data: registrations,
    isSuccess: registrationsReady,
    isFetching: registrationsFetching,
    error: registrationsError,
    refetch: refetchRegistrations,
  } = useEventRegistrations();
  const registrationLock = useRef(false);
  const [registrationPending, setRegistrationPending] = useState(false);
  const canChangeRegistration = registrationsReady && !registrationsFetching && !registrationsError && registrations !== undefined;
  const toggleReg = useToggleEventRegistration();

  const handleRegister = async (eventId: string, registered: boolean) => {
    // A failed or in-flight read is not evidence of an absent registration.
    // The ref also closes the same-render double-click window.
    const event = catalog.find(item => item.id === eventId);
    if (!canChangeRegistration || registrationLock.current || !event || (!registered && !eventRegistrationOpen(event, now))) return;
    registrationLock.current = true;
    setRegistrationPending(true);
    try {
      await toggleReg.mutateAsync({ eventId, registered: !registered });
      toast.success(registered ? "Registration cancelled" : "You're registered!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update registration");
    } finally {
      registrationLock.current = false;
      setRegistrationPending(false);
    }
  };


  return <div className="space-y-8">
    {notice}
    <PortalPageHeader eyebrow="Your community" title="Events & Calendar" description="Find reviewed events, keep track of your registrations and explore what is being prepared next." />
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5"><div><h2 className="font-semibold">Build something local</h2><p className="mt-1 text-sm text-muted-foreground">Explore expansion locations and the pathway to a verified chapter.</p></div><Link className="text-sm font-medium text-primary hover:underline" to="/portal/chapters">Global Chapters →</Link></div>
    {!!chapters?.length && <details className="rounded-xl border p-4"><summary className="cursor-pointer font-medium">Member chapter directory</summary><p className="my-3 text-sm text-muted-foreground">These are reviewed directory records. Publication alone does not certify active operations.</p><ChapterMap chapters={chapters} selectedId={selectedChapter === "all" ? undefined : selectedChapter} onSelect={setSelectedChapter} onReset={() => setSelectedChapter("all")} /><label className="mt-4 block text-sm">Filter by chapter<select className="ml-3 rounded-lg border bg-background px-3 py-2" value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)}><option value="all">All chapters</option>{chapters.map(chapter => <option key={chapter.id} value={chapter.id}>{chapter.name}</option>)}</select></label></details>}
    {registrationsError && <div role="alert" className="space-y-2 rounded-xl border p-4"><p>Registration status is unavailable. Retry before changing your registration.</p><Button variant="outline" disabled={registrationsFetching} onClick={() => void refetchRegistrations()}>Retry registration status</Button></div>}
    <QueryStatus isLoading={eventsLoading} error={eventsError} isEmpty={false} onRetry={() => void refetchEvents()}><EventExplorer events={catalog} portal renderAction={event => {
      if (event.source !== "published_event") return null;
      const registered = registrations?.has(event.id) ?? false;
      const open = eventRegistrationOpen(event, now);
      return <div className="flex flex-wrap gap-2"><Button size="sm" variant={registered ? "default" : "outline"} disabled={!canChangeRegistration || registrationPending || toggleReg.isPending || (!registered && !open)} onClick={() => void handleRegister(event.id, registered)}>{registrationsError ? "Registration unavailable" : !canChangeRegistration ? "Checking registration…" : registrationPending ? "Updating registration…" : registered ? "Registered" : open ? "Register interest" : "Registration closed"}</Button>{open && event.registrationUrl && <a className="inline-flex items-center rounded-lg border px-3 py-2 text-sm" href={event.registrationUrl} target="_blank" rel="noopener noreferrer">Official signup ↗</a>}</div>;
    }} /></QueryStatus>
  </div>;
}
