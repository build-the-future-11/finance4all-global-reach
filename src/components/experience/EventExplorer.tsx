import { useEventClock } from "@/hooks/useEventClock";
import { useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { communityLocations } from "@/content/community";
import { eventLifecycleLabels, type CatalogEvent } from "@/content/events";
import { downloadEventCalendar, eventCalendarFile, eventDate, eventLifecycle, eventMonth, formatEventTime, isValidTimezone, moveEventMonth } from "@/lib/event-calendar";

export function EventSchedule({ event, timezone }: { event: CatalogEvent; timezone: string }) {
  const canonical = event.details.timezone;
  return <div className="space-y-1 text-sm text-muted-foreground"><p>{formatEventTime(event.startsAt, timezone)}{event.startsAt && ` (${timezone})`}</p>{event.endsAt && <p>Ends {formatEventTime(event.endsAt, timezone)}</p>}{event.startsAt && <p className="text-xs">{isValidTimezone(canonical) ? `Organizer timezone: ${canonical}${canonical !== timezone ? ` · ${formatEventTime(event.startsAt, canonical)}` : ""}` : "Organizer timezone unconfirmed; timestamp shown in the selected timezone."}</p>}</div>;
}
export function EventCard({ event, timezone, portal = false, action, now }: { event: CatalogEvent; timezone: string; portal?: boolean; action?: ReactNode; now: number }) {
  return <article className="flex h-full flex-col rounded-2xl border bg-card p-5 sm:p-6">
    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">{eventLifecycleLabels[eventLifecycle(event, now)]}</span><span className="capitalize text-muted-foreground">{event.details.type ?? "Event"}</span></div>
    <p className="mb-2 text-xs font-medium text-muted-foreground">{event.details.host ?? "Host to be confirmed"}</p>
    <h3 className="text-xl font-semibold leading-snug"><Link className="hover:text-primary hover:underline" to={`${portal ? "/portal" : ""}/events/${event.id}`}>{event.title}</Link></h3>
    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
    <div className="mt-4"><EventSchedule event={event} timezone={timezone} /></div>
    {event.source === "program_plan" && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Program launch notice · no confirmed event schedule</p>}
    <div className="mt-auto flex flex-wrap items-center gap-3 pt-5"><Link className="text-sm font-medium text-primary hover:underline" to={`${portal ? "/portal" : ""}/events/${event.id}`}>View details →</Link>{eventCalendarFile(event, new Date(now)) && <button type="button" className="inline-flex items-center gap-1 text-sm text-primary" onClick={() => downloadEventCalendar(event)}><Download size={15} /> Calendar</button>}{action}</div>
  </article>;
}
export default function EventExplorer({ events, portal = false, renderAction }: { events: CatalogEvent[]; portal?: boolean; renderAction?: (event: CatalogEvent) => ReactNode }) {
  const now = useEventClock();
  const [params, setParams] = useSearchParams();
  const program = params.get("program");
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const [timezone, setTimezone] = useState(localZone);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [region, setRegion] = useState("all");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [month, setMonth] = useState(() => eventMonth(new Date().toISOString(), localZone)!);
  const [fromDate, setFromDate] = useState("");
  const countries = new Map(communityLocations.map(location => [location.country, location.continent]));
  const zones = [...new Set([localZone, "UTC", "Asia/Kolkata", "Europe/Rome", "Europe/London", "America/New_York", ...events.flatMap(e => isValidTimezone(e.details.timezone) ? [e.details.timezone] : [])])];
  const filtered = useMemo(() => events.filter(event => {
    const eventRegion = event.details.modality === "online" ? "Online" : countries.get(event.details.country ?? "") ?? "Unconfirmed";
    return `${event.title} ${event.description} ${event.details.host ?? ""}`.toLowerCase().includes(query.toLowerCase()) &&
      (status === "all" || eventLifecycle(event, now) === status) && (!program || event.details.relatedProgram === program) && (type === "all" || event.details.type === type) &&
      (region === "all" || eventRegion === region) && (!fromDate || (eventDate(event.startsAt, timezone) ?? "") >= fromDate);
  // The country-to-region map is derived from the static city registry.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [events, query, status, type, region, fromDate, timezone, now, program]);
  const monthEvents = filtered.filter(event => eventMonth(event.startsAt, timezone) === month && !["on_hold", "cancelled", "awaiting_schedule"].includes(eventLifecycle(event, now)));
  const monthTitle = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T12:00:00Z`));
  const inputClass = "min-w-0 rounded-lg border bg-background px-3 py-2.5 text-sm";
  return <section className="space-y-5" aria-label="Event discovery">
    {program && <p className="text-sm text-muted-foreground">Showing events linked to the selected program. Clear filters to return to the full catalog.</p>}
    <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 xl:grid-cols-3">
      <label className="flex items-center gap-2 rounded-lg border px-3"><Search size={16} /><input className="min-w-0 flex-1 bg-transparent py-2.5 text-sm" aria-label="Search events" placeholder="Search events or programs" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <select className={inputClass} aria-label="Filter events by status" value={status} onChange={e => setStatus(e.target.value)}><option value="all">All event statuses</option>{Object.entries(eventLifecycleLabels).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select>
      <select className={inputClass} aria-label="Filter events by type" value={type} onChange={e => setType(e.target.value)}><option value="all">All event types</option>{["workshop", "webinar", "seminar", "competition", "conference", "chapter", "editorial", "other"].map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select>
      <select className={inputClass} aria-label="Filter events by region" value={region} onChange={e => setRegion(e.target.value)}><option value="all">All regions and formats</option>{["Online", "Africa", "Asia", "Europe", "North America", "South America", "Oceania", "Unconfirmed"].map(value => <option key={value}>{value}</option>)}</select>
      <label className="flex flex-wrap items-center gap-2 text-sm">From date<input className={inputClass} type="date" aria-label="Events from date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></label>
      <label className="flex min-w-0 items-center gap-2 text-sm">Timezone<select className={`${inputClass} flex-1`} aria-label="Event display timezone" value={timezone} onChange={e => { setTimezone(e.target.value); }} >{zones.map(zone => <option key={zone}>{zone}</option>)}</select></label>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm text-muted-foreground">{filtered.length} matching events and launch notices</p><div className="flex gap-2"><button type="button" className="rounded-lg border px-3 py-2 text-sm aria-pressed:bg-primary aria-pressed:text-primary-foreground" aria-pressed={view === "list"} onClick={() => setView("list")}>List</button><button type="button" className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm aria-pressed:bg-primary aria-pressed:text-primary-foreground" aria-pressed={view === "calendar"} onClick={() => setView("calendar")}><CalendarDays size={16} /> Calendar</button><button type="button" className="rounded-lg px-3 py-2 text-sm underline" onClick={() => { setQuery(""); setStatus("all"); setType("all"); setRegion("all"); setFromDate(""); const next = new URLSearchParams(params); next.delete("program"); setParams(next, { replace: true }); }}>Clear filters</button></div></div>
    {view === "calendar" && <div className="flex items-center justify-between rounded-xl border p-3"><button type="button" className="rounded-lg p-2" aria-label="Previous month" onClick={() => setMonth(value => moveEventMonth(value, -1))}><ChevronLeft /></button><h2 className="font-semibold" aria-live="polite">{monthTitle}</h2><button type="button" className="rounded-lg p-2" aria-label="Next month" onClick={() => setMonth(value => moveEventMonth(value, 1))}><ChevronRight /></button></div>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{(view === "calendar" ? monthEvents : filtered).map(event => <EventCard key={event.id} event={event} timezone={timezone} portal={portal} now={now} action={renderAction?.(event)} />)}</div>
    {(view === "calendar" ? !monthEvents.length : !filtered.length) && <div className="rounded-2xl border border-dashed p-8 text-center"><h3 className="font-semibold">{view === "calendar" ? "No confirmed events in this month" : "No events match these filters"}</h3><p className="mt-2 text-sm text-muted-foreground">{view === "calendar" ? "Unscheduled launch notices stay in list view until dates are verified." : "Try another date, topic or status, or clear the filters."}</p></div>}
  </section>;
}
