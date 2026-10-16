import { normalizeExternalHttpUrl } from "@/lib/external-url";
import type { CatalogEvent, EventLifecycle } from "@/content/events";

export function isValidTimezone(value: string | undefined): value is string {
  if (!value) return false;
  try { new Intl.DateTimeFormat("en", { timeZone: value }).format(); return true; } catch { return false; }
}
export function eventLifecycle(event: Pick<CatalogEvent, "startsAt" | "endsAt" | "status" | "details">, now = Date.now()): EventLifecycle {
  const hold = event.details?.scheduleState;
  if (hold && hold !== "confirmed") return hold;
  if (["on_hold", "cancelled", "awaiting_schedule"].includes(event.status)) return event.status;
  const start = Date.parse(event.startsAt ?? "");
  const end = Date.parse(event.endsAt ?? "");
  if (!Number.isFinite(start)) return "awaiting_schedule";
  if (Number.isFinite(end) && end <= start) return "awaiting_schedule";
  if (start > now) return "upcoming";
  if (Number.isFinite(end)) return now < end ? "live" : "completed";
  // A past start alone cannot establish a live session or its completion.
  return event.status === "completed" ? "completed" : "awaiting_schedule";
}
export function eventRegistrationOpen(event: CatalogEvent, now = Date.now()): boolean {
  if (event.source !== "published_event" || event.status !== "upcoming" || eventLifecycle(event, now) !== "upcoming") return false;
  const opens = event.details.registrationOpensAt;
  const closes = event.details.registrationClosesAt;
  if (opens && (!Number.isFinite(Date.parse(opens)) || Date.parse(opens) > now)) return false;
  if (closes && (!Number.isFinite(Date.parse(closes)) || Date.parse(closes) <= now)) return false;
  return true;
}
export function formatEventTime(timestamp: string | undefined, timezone: string): string {
  if (!timestamp || !Number.isFinite(Date.parse(timestamp))) return "Schedule to be confirmed";
  return new Intl.DateTimeFormat(undefined, { timeZone: isValidTimezone(timezone) ? timezone : "UTC", dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
}
export function eventDate(timestamp: string | undefined, timezone: string): string | undefined {
  if (!timestamp || !Number.isFinite(Date.parse(timestamp))) return undefined;
  const parts = new Intl.DateTimeFormat("en", { timeZone: isValidTimezone(timezone) ? timezone : "UTC", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(timestamp));
  return `${parts.find(p => p.type === "year")?.value}-${parts.find(p => p.type === "month")?.value}-${parts.find(p => p.type === "day")?.value}`;
}
export function eventMonth(timestamp: string | undefined, timezone: string): string | undefined {
  return eventDate(timestamp, timezone)?.slice(0, 7);
}
export function moveEventMonth(month: string, delta: number): string {
  const [year, value] = month.split("-").map(Number);
  return new Date(Date.UTC(year, value - 1 + delta, 1)).toISOString().slice(0, 7);
}
const escapeCalendar = (value: string) => value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r/g, "");
const calendarTimestamp = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
// RFC 5545 uses 75 UTF-8 octets per folded line, not 75 JS characters.
function foldCalendarLine(line: string): string {
  const encoder = new TextEncoder();
  let output = "", size = 0;
  for (const character of line) {
    const length = encoder.encode(character).length;
    if (size + length > 75) { output += "\r\n "; size = 1; }
    output += character; size += length;
  }
  return output;
}
export function eventCalendarFile(event: CatalogEvent, now = new Date()): string | null {
  if (event.source !== "published_event" || ["on_hold", "awaiting_schedule", "cancelled"].includes(eventLifecycle(event, now.getTime()))) return null;
  if (!event.startsAt || !event.endsAt || Date.parse(event.endsAt) <= Date.parse(event.startsAt)) return null;
  if (!Number.isFinite(Date.parse(event.startsAt)) || !Number.isFinite(Date.parse(event.endsAt))) return null;
  const url = normalizeExternalHttpUrl(event.details.sourceUrl);
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Finance4All//Events//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${escapeCalendar(event.id)}@finance4all`, `DTSTAMP:${calendarTimestamp(now.toISOString())}`, `DTSTART:${calendarTimestamp(event.startsAt)}`, `DTEND:${calendarTimestamp(event.endsAt)}`, `SUMMARY:${escapeCalendar(event.title)}`, `DESCRIPTION:${escapeCalendar(event.description)}`];
  if (event.details.location) lines.push(`LOCATION:${escapeCalendar(event.details.location)}`);
  if (url) lines.push(`URL:${url}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(foldCalendarLine).join("\r\n") + "\r\n";
}
export function downloadEventCalendar(event: CatalogEvent) {
  const contents = eventCalendarFile(event);
  if (!contents) return;
  const url = URL.createObjectURL(new Blob([contents], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = `${event.id.replace(/[^a-z0-9-]/gi, "-")}.ics`; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
