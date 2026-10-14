import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { useMemberLearning } from "@/hooks/portal/useMemberLearning";

const accountA = "10000000-0000-4000-8000-000000000091";
const accountB = "10000000-0000-4000-8000-000000000092";
type Write = { method: string; owner: string | null; payload: Record<string, unknown>; filters: Record<string, string> };
const state = vi.hoisted(() => ({
  renderedUser: "" as string | null,
  sessionUser: "" as string | null,
  sessionError: null as Error | null,
  beforeSessionRead: null as (() => Promise<void>) | null,
  authReads: 0,
  afterSessionRead: null as (() => void) | null,
  beforeResponse: null as (() => Promise<void>) | null,
  writes: [] as Write[],
}));

vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: state.renderedUser ? { id: state.renderedUser } : null }) }));
vi.mock("@/lib/supabase", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient("https://learning-fixture.example", "fixture-public-key", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async (input, init) => {
      const url = new URL(String(input));
      const method = init?.method ?? "GET";
      if (method === "GET") return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
      const authorization = new Headers(init?.headers).get("authorization");
      const owner = authorization?.startsWith("Bearer fixture-") ? authorization.slice("Bearer fixture-".length) : null;
      const payload = JSON.parse(String(init?.body)) as Record<string, unknown>;
      const filters = Object.fromEntries(url.searchParams);
      state.writes.push({ method, owner, payload, filters });
      await state.beforeResponse?.();
      return new Response(JSON.stringify({ user_id: owner, lesson_id: payload.lesson_id ?? filters.lesson_id?.replace(/^eq\./, ""), ...payload, revision: 4, updated_at: "2026-10-09T00:00:00Z" }), { status: 200, headers: { "Content-Type": "application/json" } });
    } },
  });
  vi.spyOn(supabase.auth, "getSession").mockImplementation(async () => {
    state.authReads += 1;
    await state.beforeSessionRead?.();
    const session = state.sessionUser ? {
      user: { id: state.sessionUser }, access_token: `fixture-${state.sessionUser}`,
      refresh_token: "fixture-refresh", expires_in: 3600, token_type: "bearer",
    } as Session : null;
    const afterRead = state.afterSessionRead;
    state.afterSessionRead = null;
    afterRead?.();
    return { data: { session }, error: state.sessionError } as Awaited<ReturnType<typeof supabase.auth.getSession>>;
  });
  return { supabase };
});

const clients: QueryClient[] = [];
function workspace() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } } });
  clients.push(client);
  for (const userId of [accountA, accountB]) client.setQueryData(["member-learning", userId], []);
  const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue();
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { ...renderHook(() => useMemberLearning(), { wrapper }), client, invalidate };
}
function draft(revision: number | null = null) { return { lessonId: "private-lesson-a", completed: false, notes: "Account A private notes", revision }; }

beforeEach(() => {
  state.renderedUser = accountA;
  state.sessionUser = accountA;
  state.sessionError = null;
  state.beforeSessionRead = null;
  state.authReads = 0;
  state.afterSessionRead = null;
  state.beforeResponse = null;
  state.writes.length = 0;
  onlineManager.setOnline(true);
});
afterEach(() => { cleanup(); clients.splice(0).forEach(client => client.clear()); onlineManager.setOnline(true); });

describe("member learning save account boundary", () => {
  it("rejects an already-started insert if the account changes and caches clear before auth resolves", async () => {
    const { result, client, unmount } = workspace();
    let releaseAuth!: () => void;
    state.beforeSessionRead = () => new Promise<void>(resolve => { releaseAuth = resolve; });
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.save.mutateAsync(draft()).catch(error => error); });
    await waitFor(() => expect(state.authReads).toBe(1));
    expect(state.writes).toHaveLength(0);
    state.renderedUser = accountB;
    state.sessionUser = accountB;
    // Match AuthProvider's account-change safeguard; clearing the cache does
    // not cancel a mutation whose asynchronous execution has already started.
    client.clear();
    unmount();
    state.beforeSessionRead = null;
    releaseAuth();
    const outcome = await pending;
    expect(state.writes).toHaveLength(0);
    expect(outcome).toBeInstanceOf(Error);
  });

  it.each([null, 3])("rejects a queued %s-revision save after changing accounts", async revision => {
    const { result, rerender } = workspace();
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.save.mutateAsync(draft(revision)).catch(error => error); });
    await waitFor(() => expect(result.current.save.isPending).toBe(true));
    expect(state.writes).toHaveLength(0);
    state.renderedUser = accountB;
    state.sessionUser = accountB;
    rerender();
    let outcome: unknown;
    await act(async () => { onlineManager.setOnline(true); outcome = await pending; });
    expect(outcome).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
  });

  it("rejects a queued save after its original editor unmounts and the session changes", async () => {
    const { result, unmount, client } = workspace();
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.save.mutateAsync(draft()).catch(error => error); });
    await waitFor(() => expect(result.current.save.isPending).toBe(true));
    unmount();
    state.sessionUser = accountB;
    onlineManager.setOnline(true);
    await client.resumePausedMutations();
    expect(await pending).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
  });

  it("rejects a save if the session already differs from the rendered account", async () => {
    const { result } = workspace();
    state.sessionUser = accountB;
    let outcome: unknown;
    await act(async () => { outcome = await result.current.save.mutateAsync(draft()).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
  });

  it("copies the submitted draft before an offline queue can outlive the caller input", async () => {
    const { result } = workspace();
    const input = draft(3);
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.save.mutateAsync(input); });
    await waitFor(() => expect(result.current.save.isPending).toBe(true));
    input.lessonId = "later-lesson";
    input.notes = "Later unsent notes";
    input.completed = true;
    input.revision = 9;
    await act(async () => { onlineManager.setOnline(true); await pending; });
    expect(state.writes).toEqual([{
      method: "PATCH", owner: accountA,
      payload: { completed: false, notes: "Account A private notes" },
      filters: { user_id: `eq.${accountA}`, lesson_id: "eq.private-lesson-a", revision: "eq.3", select: "*" },
    }]);
  });

  it("allows the same account's queued insert without writing protected owner columns", async () => {
    const { result, invalidate } = workspace();
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.save.mutateAsync(draft()); });
    await waitFor(() => expect(result.current.save.isPending).toBe(true));
    await act(async () => { onlineManager.setOnline(true); await pending; });
    expect(state.writes).toEqual([{
      method: "POST", owner: accountA,
      payload: { lesson_id: "private-lesson-a", completed: false, notes: "Account A private notes" },
      filters: { select: "*" },
    }]);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["member-learning", accountA] });
  });

  it("retains the checked session token if the global session changes before dispatch", async () => {
    const { result } = workspace();
    state.afterSessionRead = () => { state.sessionUser = accountB; };
    await act(async () => { await result.current.save.mutateAsync(draft(3)); });
    expect(state.sessionUser).toBe(accountB);
    expect(state.writes[0]).toMatchObject({ owner: accountA, filters: { user_id: `eq.${accountA}` } });
  });

  it("invalidates the issuing account when a confirmed response arrives after an account change", async () => {
    const { result, rerender, invalidate } = workspace();
    let release!: () => void;
    state.beforeResponse = () => new Promise<void>(resolve => { release = resolve; });
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.save.mutateAsync(draft()); });
    await waitFor(() => expect(state.writes).toHaveLength(1));
    state.renderedUser = accountB;
    state.sessionUser = accountB;
    rerender();
    await act(async () => { release(); await pending; });
    expect(invalidate).toHaveBeenCalledExactlyOnceWith({ queryKey: ["member-learning", accountA] });
  });

  it("fails before sending private notes when the session is absent", async () => {
    const { result } = workspace();
    state.sessionUser = null;
    let outcome: unknown;
    await act(async () => { outcome = await result.current.save.mutateAsync(draft()).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
  });

  it("preserves a session lookup error without sending the draft", async () => {
    const { result } = workspace();
    const unavailable = new Error("Session unavailable");
    state.sessionError = unavailable;
    let outcome: unknown;
    await act(async () => { outcome = await result.current.save.mutateAsync(draft()).catch(error => error); });
    expect(outcome).toBe(unavailable);
    expect(state.writes).toHaveLength(0);
  });
});
