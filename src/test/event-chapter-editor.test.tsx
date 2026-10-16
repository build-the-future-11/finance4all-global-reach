import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EventEditor from "@/components/portal/EventEditor";
import ChapterEditor from "@/components/portal/ChapterEditor";
import { eventRegistrationOpen } from "@/lib/event-calendar";
import { mapEvent } from "@/lib/mappers";
import { toCatalogEvent } from "@/content/events";
import type { Tables } from "@/types/database";

const state = vi.hoisted(() => ({
  rows: {} as Record<string, unknown[]>,
  writes: [] as { table: string; row: Record<string, unknown>; filters: [string, unknown][] }[],
}));
vi.mock("@/lib/supabase", () => ({ supabase: {
  from: (table: string) => ({
    select: () => ({ order: () => ({ limit: async () => ({ data: state.rows[table] ?? [], error: null }) }) }),
    update: (row: Record<string, unknown>) => {
      const write = { table, row, filters: [] as [string, unknown][] };
      state.writes.push(write);
      const query = {
        eq: (key: string, value: unknown) => { write.filters.push([key, value]); return query; },
        select: () => query,
        maybeSingle: async () => ({ data: { id: write.filters.find(([key]) => key === "id")?.[1] }, error: null }),
      };
      return query;
    },
  }),
} }));

const chapter = { id: "84000000-0000-4000-8000-000000000010", name: "Reviewed Rome chapter", city: "Rome", country: "Italy", latitude: 41.9, longitude: 12.5, publication_state: "published", publication_revision: 3, chapter_status: "unverified", accepted_owner: false, permissions_confirmed: false, operating_evidence_url: null, last_activity_at: null };
const event = { id: "84000000-0000-4000-8000-000000000020", chapter_id: chapter.id, title: "Completed workshop", description: "An existing reviewed workshop.", status: "completed", starts_at: "2026-10-01T12:00:00Z", ends_at: "2026-10-01T13:00:00Z", registration_url: null, program_links: [], event_details: { timezone: "UTC", scheduleState: "confirmed" }, public_listing: false, publication_state: "published", publication_revision: 7 };
const clients: QueryClient[] = [];
function mount(content: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } } });
  clients.push(client);
  client.setQueryData(["admin-event-records"], state.rows.events);
  client.setQueryData(["admin-chapter-records"], state.rows.chapters);
  render(<QueryClientProvider client={client}>{content}</QueryClientProvider>);
}
beforeEach(() => {
  state.rows = { events: [event, { ...event, id: "another-event", title: "Another event" }], chapters: [chapter, { ...chapter, id: "another-chapter", name: "Another chapter" }] };
  state.writes = [];
  onlineManager.setOnline(true);
});
afterEach(() => { cleanup(); clients.splice(0).forEach(client => client.clear()); onlineManager.setOnline(true); });

describe("reviewed event editor", () => {
  it("preserves completed status until the admin explicitly reopens a rescheduled record", async () => {
    mount(<EventEditor />);
    fireEvent.change(screen.getByLabelText("Choose a record"), { target: { value: event.id } });
    expect(screen.getByLabelText(/^Event status/)).toHaveValue("completed");
    fireEvent.change(screen.getByLabelText("Confirmed start (UTC)"), { target: { value: "2026-11-01T12:00" } });
    fireEvent.change(screen.getByLabelText("Confirmed end (UTC)"), { target: { value: "2026-11-01T13:00" } });
    fireEvent.change(screen.getByLabelText(/^Event status/), { target: { value: "upcoming" } });
    fireEvent.click(screen.getByRole("button", { name: "Save event draft for review" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Event draft saved"));
    const write = state.writes[0];
    expect(write.row).toMatchObject({ status: "upcoming", starts_at: "2026-11-01T12:00:00.000Z", ends_at: "2026-11-01T13:00:00.000Z" });
    expect(write.filters).toEqual([["id", event.id], ["publication_revision", 7]]);
    expect(write.row).not.toHaveProperty("publication_state");
    // After the separate review, the edited status agrees with registration.
    const reviewed = mapEvent({ ...event, ...write.row, publication_state: "published" } as Tables<"events">);
    expect(eventRegistrationOpen(toCatalogEvent(reviewed), Date.parse("2026-10-31T12:00:00Z"))).toBe(true);
  });

  it("keeps the original event target and form when an offline save resumes", async () => {
    mount(<EventEditor />);
    fireEvent.change(screen.getByLabelText("Choose a record"), { target: { value: event.id } });
    fireEvent.change(screen.getByLabelText("Event title"), { target: { value: "Saved event A" } });
    act(() => onlineManager.setOnline(false));
    fireEvent.click(screen.getByRole("button", { name: "Save event draft for review" }));
    await waitFor(() => expect(screen.getByLabelText("Choose a record")).toBeDisabled());
    expect(state.writes).toHaveLength(0);
    // Even a synthetic selection change must not retarget the queued snapshot.
    fireEvent.change(screen.getByLabelText("Choose a record"), { target: { value: "another-event" } });
    act(() => onlineManager.setOnline(true));
    await waitFor(() => expect(state.writes).toHaveLength(1));
    expect(state.writes[0].row.title).toBe("Saved event A");
    expect(state.writes[0].row.status).toBe("completed");
    expect(state.writes[0].filters).toContainEqual(["id", event.id]);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Event draft saved"));
  });
});

it("keeps the original chapter target and form when an offline save resumes", async () => {
  mount(<ChapterEditor />);
  fireEvent.change(screen.getByLabelText("Chapter record"), { target: { value: chapter.id } });
  fireEvent.change(screen.getByLabelText("Chapter name"), { target: { value: "Saved chapter A" } });
  act(() => onlineManager.setOnline(false));
  fireEvent.submit(screen.getByRole("button", { name: "Save chapter draft for review", hidden: true }).closest("form")!);
  await waitFor(() => expect(screen.getByLabelText("Chapter record")).toBeDisabled());
  expect(state.writes).toHaveLength(0);
  fireEvent.change(screen.getByLabelText("Chapter record"), { target: { value: "another-chapter" } });
  act(() => onlineManager.setOnline(true));
  await waitFor(() => expect(state.writes).toHaveLength(1));
  expect(state.writes[0].row.name).toBe("Saved chapter A");
  expect(state.writes[0].filters).toEqual([["id", chapter.id], ["publication_revision", 3]]);
  await waitFor(() => expect(screen.getByRole("status", { hidden: true })).toHaveTextContent("Chapter draft saved"));
});
