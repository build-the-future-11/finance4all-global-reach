import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { readingEntries, useReadingHistory } from "@/hooks/portal/useReadingHistory";
import { publishedDebriefedArticles } from "@/content/debriefed";
import { MemoryRouter } from "react-router-dom";
import ReadingPosition from "@/components/portal/ReadingPosition";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), getSession: vi.fn(), save: vi.fn(), user: { id: "member-a", user_metadata: {} } }));
vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock("@/lib/supabase", () => ({ supabase: { auth: mocks } }));
const article = publishedDebriefedArticles[0];
const position = { slug: article.slug, section: article.sections[0].id, completed: false };
function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return renderHook(useReadingHistory, { wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = { id: "member-a", user_metadata: {} };
  mocks.getUser.mockResolvedValue({ data: { user: { id: "member-a", user_metadata: {} } }, error: null });
  mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "member-a" }, access_token: "token-member-a" } }, error: null });
  mocks.save.mockImplementation(async (_url, options) => ({ ok: true, json: async () => ({ id: "member-a", user_metadata: JSON.parse(options.body).data }) }));
  vi.stubGlobal("fetch", mocks.save);
});
afterEach(() => { onlineManager.setOnline(true); vi.unstubAllGlobals(); });
it("only writes an explicit reading action and confirms its receipt", async () => {
  const { result } = setup();
  expect(mocks.save).not.toHaveBeenCalled();
  await act(async () => { await result.current.update.mutateAsync(position); });
  expect(JSON.parse(mocks.save.mock.calls[0][1].body).data.debriefed_reading_history).toEqual([expect.objectContaining(position)]);
  expect(mocks.save.mock.calls[0][1].headers.Authorization).toBe("Bearer token-member-a");
});
it("preserves other guides when updating fresh account state", async () => {
  const other = publishedDebriefedArticles[1];
  const previous = { slug: other.slug, section: other.sections[0].id, completed: true, updatedAt: "2026-10-15T00:00:00Z" };
  mocks.getUser.mockResolvedValue({ data: { user: { id: "member-a", user_metadata: { debriefed_reading_history: [previous] } } }, error: null });
  const { result } = setup();
  await act(async () => { await result.current.update.mutateAsync(position); });
  expect(JSON.parse(mocks.save.mock.calls[0][1].body).data.debriefed_reading_history[0]).toEqual(previous);
});
it("rejects account switches without writing", async () => {
  mocks.getUser.mockResolvedValue({ data: { user: { id: "member-b" } }, error: null });
  const { result } = setup();
  await act(async () => { await expect(result.current.update.mutateAsync(position)).rejects.toThrow(/account changed/); });
  expect(mocks.save).not.toHaveBeenCalled();
});
it("does not report unconfirmed progress as saved", async () => {
  mocks.save.mockResolvedValue({ ok: true, json: async () => ({ id: "member-a", user_metadata: {} }) });
  const { result } = setup();
  await act(async () => { await expect(result.current.update.mutateAsync(position)).rejects.toThrow(/could not be confirmed/); });
});
it("ignores unknown articles, malicious anchors and malformed account metadata", () => {
  expect(readingEntries([{ ...position, section: 'onclick="alert(1)"', updatedAt: new Date().toISOString() }, { ...position, slug: "before-the-backtest-point-in-time-safe-data", updatedAt: new Date().toISOString() }, { ...position, slug: "what-is-an-ipo", updatedAt: new Date().toISOString() }, null, {}])).toEqual([]);
});

it("pins the checked account token even if the current session changes during the read", async () => {
  const { result } = setup();
  mocks.getUser.mockImplementation(async (token?: string) => {
    if (token) mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "member-b" }, access_token: "token-member-b" } }, error: null });
    return { data: { user: { id: "member-a", user_metadata: {} } }, error: null };
  });
  await act(async () => { await result.current.update.mutateAsync(position); });
  expect(mocks.save.mock.calls[0][1].headers.Authorization).toBe("Bearer token-member-a");
});

it("rejects an offline save resumed after switching away from the submitting account", async () => {
  const { result, rerender } = setup();
  onlineManager.setOnline(false);
  let pending!: Promise<unknown>;
  act(() => { pending = result.current.update.mutateAsync(position).catch(error => error); });
  await waitFor(() => expect(result.current.update.isPaused).toBe(true));
  mocks.user = { id: "member-b", user_metadata: {} };
  mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "member-b" }, access_token: "token-member-b" } }, error: null });
  mocks.getUser.mockResolvedValue({ data: { user: mocks.user }, error: null });
  rerender();
  await act(async () => { onlineManager.setOnline(true); });
  await expect(pending).resolves.toMatchObject({ message: expect.stringMatching(/account changed/) });
  expect(mocks.save).not.toHaveBeenCalled();
});

it("hydrates saved position from the server despite the app's one-minute stale time", async () => {
  const previous = { ...position, section: article.sections[2].id, updatedAt: "2026-10-15T00:00:00Z" };
  mocks.getUser.mockResolvedValue({ data: { user: { id: "member-a", user_metadata: { debriefed_reading_history: [previous] } } }, error: null });
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: false } } });
  render(<QueryClientProvider client={client}><MemoryRouter><ReadingPosition article={article} /></MemoryRouter></QueryClientProvider>);
  await waitFor(() => expect(screen.getByRole("combobox", { name: "Reading position" })).toHaveValue(previous.section));
  expect(screen.getByRole("link", { name: "Resume reading" })).toHaveAttribute("href", `#${previous.section}`);
  expect(mocks.save).not.toHaveBeenCalled();
});

it("preserves an edited selection when saved server history arrives later", async () => {
  let completeRead!: (value: unknown) => void;
  mocks.getUser.mockReturnValue(new Promise(resolve => { completeRead = resolve; }));
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: false } } });
  render(<QueryClientProvider client={client}><MemoryRouter><ReadingPosition article={article} /></MemoryRouter></QueryClientProvider>);
  const select = screen.getByRole("combobox", { name: "Reading position" });
  fireEvent.change(select, { target: { value: article.sections[3].id } });
  await act(async () => { completeRead({ data: { user: { id: "member-a", user_metadata: { debriefed_reading_history: [{ ...position, section: article.sections[2].id, updatedAt: "2026-10-15T00:00:00Z" }] } } }, error: null }); });
  await waitFor(() => expect(screen.getByRole("link", { name: "Resume reading" })).toHaveAttribute("href", `#${article.sections[2].id}`));
  expect(select).toHaveValue(article.sections[3].id);
});
