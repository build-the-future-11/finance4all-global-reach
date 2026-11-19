import { useEventClock } from "@/hooks/useEventClock";
import { Link, useParams } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import { eventLaunchNotices, eventLifecycleLabels, toCatalogEvent, type CatalogEvent } from "@/content/events";
import { useEvents, usePublicEvents } from "@/hooks/portal/useEvents";
import { EventSchedule } from "@/components/experience/EventExplorer";
import { downloadEventCalendar, eventCalendarFile, eventLifecycle, eventRegistrationOpen } from "@/lib/event-calendar";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

function DetailContent({ event, portal }: { event: CatalogEvent; portal: boolean }) {
  const now = useEventClock();
  useDocumentTitle(event.title);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  return <article className="mx-auto max-w-4xl space-y-8">
    <Link className="text-sm text-primary hover:underline" to={portal ? "/portal/events" : "/events"}>← Events & Calendar</Link>
    <header className="space-y-4"><div className="flex flex-wrap gap-3 text-sm"><span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{eventLifecycleLabels[eventLifecycle(event, now)]}</span><span className="py-1 text-muted-foreground">{event.details.host ?? "Host to be confirmed"}</span></div><h1 className="text-4xl font-semibold leading-tight tracking-tight">{event.title}</h1><p className="text-lg leading-relaxed text-muted-foreground">{event.description}</p></header>
    {event.readinessNote && <aside className="rounded-2xl border bg-muted/40 p-6"><h2 className="font-semibold">Launch status</h2><p className="mt-2 leading-relaxed text-muted-foreground">{event.readinessNote}</p><p className="mt-3 text-sm text-muted-foreground">This is a program launch notice. It is not a confirmed event or an invitation to submit to a competition.</p></aside>}
    <section className="grid gap-6 rounded-2xl border bg-card p-6 sm:grid-cols-2"><div><h2 className="mb-3 font-semibold">Date & time</h2><EventSchedule event={event} timezone={timezone} />{eventCalendarFile(event, new Date(now)) && <button type="button" className="mt-4 rounded-lg border px-4 py-2 text-sm text-primary" onClick={() => downloadEventCalendar(event)}>Download calendar invitation (.ics)</button>}</div><dl className="space-y-4"><div><dt className="text-sm font-medium">Location & format</dt><dd className="mt-1 text-sm text-muted-foreground">{event.details.location ?? ([event.details.city, event.details.country].filter(Boolean).join(", ") || "Location to be confirmed")}{event.details.modality && ` · ${event.details.modality.replace("_", " ")}`}</dd></div><div><dt className="text-sm font-medium">Audience & eligibility</dt><dd className="mt-1 text-sm text-muted-foreground">{event.details.audience ?? "Eligibility will be confirmed in the official event brief."}</dd></div>{event.details.capacity && <div><dt className="text-sm font-medium">Confirmed capacity</dt><dd>{event.details.capacity}</dd></div>}</dl></section>
    <section className="space-y-3"><h2 className="text-2xl font-semibold">Participation</h2>{eventRegistrationOpen(event, now) ? <><p className="text-muted-foreground">Follow the official registration rules. Saving member interest does not guarantee a place or replace an organizer's application.</p>{event.registrationUrl && <a className="inline-block rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground" href={event.registrationUrl} target="_blank" rel="noopener noreferrer">Official registration ↗</a>}<Link className="ml-4 inline-block text-primary underline" to={`/portal/events?selected=${event.id}`}>{portal ? "Manage member registration" : "Sign in for member registration"}</Link></> : <p className="text-muted-foreground">Event registration is not open. See the related program for its current participation pathway.</p>}{event.details.registrationOpensAt && <p className="text-sm">Registration opens: {new Date(event.details.registrationOpensAt).toLocaleString()} ({timezone})</p>}{event.details.registrationClosesAt && <p className="text-sm">Registration closes: {new Date(event.details.registrationClosesAt).toLocaleString()} ({timezone})</p>}</section>
    <section className="space-y-3 border-t pt-6"><h2 className="text-xl font-semibold">Related resources</h2><div className="flex flex-wrap gap-4">{event.details.relatedProgram && <Link className="text-primary underline" to={`${portal ? "/portal" : ""}/programs/${event.details.relatedProgram}`}>Explore the related program</Link>}{event.programLinks.map(link => <a key={link.url} className="text-primary underline" href={link.url} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>)}{event.details.recordingUrl && <a className="text-primary underline" href={event.details.recordingUrl} target="_blank" rel="noopener noreferrer">Authorized recording ↗</a>}{event.details.sourceUrl && <a className="text-primary underline" href={event.details.sourceUrl} target="_blank" rel="noopener noreferrer">Official event source ↗</a>}</div><p className="text-xs text-muted-foreground">{event.details.verifiedAt ? `Record last checked: ${event.details.verifiedAt}.` : "Last verification date has not been supplied."} Schedule and registration availability may change; consult the official event brief.</p></section>
  </article>;
}
function MissingEvent({ loading, error, portal, retry }: { loading: boolean; error: boolean; portal: boolean; retry: () => void }) {
  return <div className="rounded-2xl border p-8"><h1 className="text-2xl font-semibold">{loading ? "Loading event…" : error ? "Event unavailable" : "Event not found"}</h1><p className="my-4 text-muted-foreground">{loading ? "Checking the reviewed event catalog." : "This event may be private, unpublished, withdrawn or unavailable. No registration has been created."}</p>{error && <button type="button" className="mr-4 text-primary underline" onClick={retry}>Retry</button>}<Link className="text-primary underline" to={portal ? "/portal/events" : "/events"}>Back to events</Link></div>;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export default function EventDetail() {
  const { slug = "" } = useParams();
  const query = usePublicEvents(uuid.test(slug) ? slug : undefined, uuid.test(slug));
  const record = query.data?.pages.flat().find(item => item.id === slug);
  const event = record ? toCatalogEvent(record) : eventLaunchNotices.find(item => item.id === slug);
  return <PublicLayout title={event?.title ?? "Event details"} description={event?.description ?? "Details of a reviewed Finance4All event."}><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">{event ? <DetailContent event={event} portal={false} /> : <MissingEvent loading={query.isFetching} error={query.isError} portal={false} retry={() => void query.refetch()} />}</div></PublicLayout>;
}
export function MemberEventDetail() {
  const { slug = "" } = useParams();
  const query = useEvents(undefined, uuid.test(slug) ? slug : undefined);
  const record = query.data?.find(item => item.id === slug);
  const event = record ? toCatalogEvent(record) : eventLaunchNotices.find(item => item.id === slug);
  return event ? <DetailContent event={event} portal /> : <MissingEvent loading={query.isLoading} error={query.isError} portal retry={() => void query.refetch()} />;
}
