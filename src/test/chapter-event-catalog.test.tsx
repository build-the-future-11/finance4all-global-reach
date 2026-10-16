import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { communityLocations } from "@/content/community";
import { eventLaunchNotices, mergeEventCatalog, type CatalogEvent } from "@/content/events";
import { eventCalendarFile, eventLifecycle, eventMonth, eventRegistrationOpen, formatEventTime, isValidTimezone, moveEventMonth } from "@/lib/event-calendar";
import WorldMap from "@/components/experience/WorldMap";
import EventExplorer from "@/components/experience/EventExplorer";
import { verifiedChapterStatus } from "@/lib/chapter-status";

afterEach(cleanup);
const event: CatalogEvent = { id: "fixture", title: "Workshop", description: "A test fixture", startsAt: "2026-10-25T00:30:00Z", endsAt: "2026-10-25T02:30:00Z", status: "upcoming", source: "published_event", details: { timezone: "Europe/Rome", type: "workshop" }, programLinks: [] };

describe("chapter locations", () => {
  it("retains 30 previous cities and adds all 49 distinct expansion candidates", () => {
    expect(communityLocations).toHaveLength(79);
    expect(new Set(communityLocations.map(item => item.id)).size).toBe(79);
    expect(new Set(communityLocations.map(item => `${item.city}|${item.country}`)).size).toBe(79);
    expect(communityLocations.filter(item => item.country === "Italy").map(item => item.city).sort()).toEqual(["Bologna", "Florence", "Milan", "Naples", "Rome", "Turin"]);
    for (const city of ["Bengaluru", "London", "Paris", "Stockholm", "Bern", "Newark, New Jersey", "Pretoria", "Cairo", "Canberra", "Brasília"]) expect(communityLocations.find(item => item.city === city)).toBeDefined();
  });
  it("does not manufacture active chapters and has valid geographic coordinates", () => {
    for (const location of communityLocations) {
      expect(location.status).toBe("expansion_interest");
      expect(Math.abs(location.latitude)).toBeLessThanOrEqual(90);
      expect(Math.abs(location.longitude)).toBeLessThanOrEqual(180);
    }
  });
  it("requires accepted ownership, permissions and current evidence for active chapter status", () => {
    const now = Date.parse("2026-10-16T12:00:00Z");
    const current = { chapter_status: "active_verified", accepted_owner: true, permissions_confirmed: true, operating_evidence_url: "https://example.test/approved-evidence", last_activity_at: "2026-10-15T12:00:00Z" };
    expect(verifiedChapterStatus(current, now)).toBe("active_verified");
    expect(verifiedChapterStatus({ ...current, accepted_owner: false }, now)).toBe("unverified");
    expect(verifiedChapterStatus({ ...current, permissions_confirmed: false }, now)).toBe("unverified");
    expect(verifiedChapterStatus({ ...current, last_activity_at: "2026-08-01T12:00:00Z" }, now)).toBe("unverified");
    expect(verifiedChapterStatus({ ...current, last_activity_at: "2026-10-17T12:00:00Z" }, now)).toBe("unverified");
    expect(verifiedChapterStatus({ ...current, operating_evidence_url: "javascript:alert(1)" }, now)).toBe("unverified");
    expect(verifiedChapterStatus({}, now)).toBe("unverified");
  });
  it("filters country/status and supports accent-insensitive city lookup", () => {
    render(<WorldMap locations={communityLocations} />);
    fireEvent.change(screen.getByLabelText("Filter by country"), { target: { value: "Italy" } });
    expect(screen.getByRole("status")).toHaveTextContent("6 locations");
    expect(screen.getByRole("button", { name: "Explore Milan, Italy" })).toBeVisible();
    fireEvent.change(screen.getByLabelText("Filter by chapter status"), { target: { value: "active_verified" } });
    expect(screen.getByRole("status")).toHaveTextContent("0 locations");
    fireEvent.click(screen.getByRole("button", { name: /Reset view/ }));
    fireEvent.change(screen.getByLabelText("Find a city or country"), { target: { value: "sao paulo" } });
    expect(screen.getByRole("button", { name: "Explore São Paulo, Brazil" })).toBeVisible();
  });
});
describe("evidence-aware event timing", () => {
  it("computes upcoming/live/completed from timestamp boundaries", () => {
    expect(eventLifecycle(event, Date.parse("2026-10-25T00:29:59Z"))).toBe("upcoming");
    expect(eventLifecycle(event, Date.parse(event.startsAt!))).toBe("live");
    expect(eventLifecycle(event, Date.parse(event.endsAt!))).toBe("completed");
  });
  it("does not invent live/completed events from a missing end or invalid dates", () => {
    expect(eventLifecycle({ ...event, endsAt: undefined }, Date.parse("2026-10-25T01:00:00Z"))).toBe("awaiting_schedule");
    expect(eventLifecycle({ ...event, startsAt: "bad" })).toBe("awaiting_schedule");
    expect(eventLifecycle({ ...event, endsAt: "2026-10-24T00:00:00Z" })).toBe("awaiting_schedule");
    expect(eventLifecycle({ ...event, details: { scheduleState: "on_hold" } }, 0)).toBe("on_hold");
  });
  it("keeps program notices unscheduled and non-registerable", () => {
    expect(eventLaunchNotices).toHaveLength(7);
    for (const notice of eventLaunchNotices) {
      expect(notice.startsAt).toBeUndefined();
      expect(notice.registrationUrl).toBeUndefined();
      expect(eventRegistrationOpen(notice)).toBe(false);
      expect(eventCalendarFile(notice)).toBeNull();
    }
  });
  it("respects registration opening/closing instants and operational holds", () => {
    const dated = { ...event, details: { registrationOpensAt: "2026-10-20T00:00:00Z", registrationClosesAt: "2026-10-24T00:00:00Z" } };
    expect(eventRegistrationOpen(dated, Date.parse("2026-10-19T23:59:59Z"))).toBe(false);
    expect(eventRegistrationOpen(dated, Date.parse("2026-10-20T00:00:00Z"))).toBe(true);
    expect(eventRegistrationOpen(dated, Date.parse("2026-10-24T00:00:00Z"))).toBe(false);
    expect(eventRegistrationOpen({ ...event, details: { registrationClosesAt: "invalid" } }, 0)).toBe(false);
    expect(eventRegistrationOpen(event, Date.parse(event.startsAt!))).toBe(false);
  });
  it("preserves timezone day/month boundaries and handles DST without shifting UTC instants", () => {
    expect(eventMonth("2026-11-01T00:30:00Z", "America/New_York")).toBe("2026-10");
    expect(eventMonth("2026-11-01T00:30:00Z", "Asia/Kolkata")).toBe("2026-11");
    expect(formatEventTime(event.startsAt, "Europe/Rome")).toMatch(/2:30|02:30/);
    expect(isValidTimezone("Europe/Rome")).toBe(true);
    expect(isValidTimezone("Invalid/Zone")).toBe(false);
    expect(moveEventMonth("2026-12", 1)).toBe("2027-01");
    expect(moveEventMonth("2026-01", -1)).toBe("2025-12");
  });
  it("exports UTC ICS with escaped text and UTF-8-safe line folding", () => {
    const contents = eventCalendarFile({ ...event, title: "Demo, one; two\nBEGIN:VEVENT", description: "é".repeat(100) }, new Date("2026-10-20T00:00:00Z"))!;
    expect(contents).toContain("DTSTART:20261025T003000Z");
    expect(contents).toContain("DTEND:20261025T023000Z");
    expect(contents).toContain("SUMMARY:Demo\\, one\\; two\\nBEGIN:VEVENT");
    for (const line of contents.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(eventCalendarFile({ ...event, endsAt: undefined })).toBeNull();
  });
  it("uses an explicit related program to reconcile a notice without title guesses", () => {
    const rows = mergeEventCatalog([{ ...event, startsAt: event.startsAt!, chapterId: "chapter", status: "upcoming", details: { relatedProgram: "open-markets" } }]);
    expect(rows).toHaveLength(7);
    expect(rows.some(item => item.id === "open-markets-challenge-001")).toBe(false);
  });
  it("supports event search, type/status filtering and navigable empty calendar months", () => {
    render(<MemoryRouter><EventExplorer events={eventLaunchNotices} /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Search events"), { target: { value: "Buildathon" } });
    expect(screen.getByRole("status")).toHaveTextContent("1 matching");
    fireEvent.change(screen.getByLabelText("Filter events by status"), { target: { value: "live" } });
    expect(screen.getByText("No events match these filters")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    fireEvent.click(screen.getByRole("button", { name: "Calendar" }));
    expect(screen.getByText("No confirmed events in this month")).toBeVisible();
    expect(screen.getByRole("button", { name: "Next month" })).toBeEnabled();
  });
  it("resolves related-program links and clears them without showing unrelated notices", () => {
    render(<MemoryRouter initialEntries={["/events?program=fintech-studio"]}><EventExplorer events={eventLaunchNotices} /></MemoryRouter>);
    expect(screen.getByRole("status")).toHaveTextContent("1 matching");
    expect(screen.getByRole("link", { name: "FinTech Studio Buildathon" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByRole("status")).toHaveTextContent("7 matching");
  });
});
