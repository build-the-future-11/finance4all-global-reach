/** Generate and download an .ics calendar file for a portal event. */

interface IcalEventInput {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
}

function formatIcalDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcalText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildIcalEvent(event: IcalEventInput): string {
  const start = formatIcalDate(event.startsAt);
  const end = formatIcalDate(
    event.endsAt ?? new Date(new Date(event.startsAt).getTime() + 60 * 60 * 1000).toISOString(),
  );
  const now = formatIcalDate(new Date().toISOString());

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FinanceMeta//Member Portal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@finance4all.org`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcalText(event.title)}`,
    `DESCRIPTION:${escapeIcalText(event.description)}`,
    event.location ? `LOCATION:${escapeIcalText(event.location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function downloadIcal(event: IcalEventInput): void {
  const ics = buildIcalEvent(event);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}
