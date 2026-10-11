import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useToggleEventRegistration } from "@/hooks/portal/useEvents";

const accountA = "10000000-0000-4000-8000-000000000081";
const accountB = "10000000-0000-4000-8000-000000000082";
type Write = { method: string; owner: string | null; payload: Record<string, unknown>; filters: Record<string, string> };
const state = vi.hoisted(() => ({
  renderedUser: "" as string | null,
  sessionUser: "" as string | null,
  sessionError: null as Error | null,
  afterSessionRead: null as (() => void) | null,
  responseOwner: undefined as string | undefined,
  responseEvent: undefined as string | undefined,
  emptyResponse: false,
  writes: [] as Write[],
}));

vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: state.renderedUser ? { id: state.renderedUser } : null }) }));
vi.mock("@/lib/supabase", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient("https://event-registration-fixture.example", "fixture-public-key", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async (input, init) => {
      const url = new URL(String(input));
      const method = init?.method ?? "GET";
      const authorization = new Headers(init?.headers).get("authorization");
      const owner = authorization?.startsWith("Bearer fixture-") ? authorization.slice("Bearer fixture-".length) : null;
      const payload = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : {};
      const filters = Object.fromEntries(url.searchParams);
      state.writes.push({ method, owner, payload, filters });
      const row = {
        user_id: state.responseOwner ?? owner,
        event_id: state.responseEvent ?? payload.event_id ?? filters.event_id?.replace(/^eq\./, ""),
      };
      return new Response(JSON.stringify(state.emptyResponse ? null : row), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    } },
  });
  vi.spyOn(supabase.auth, "getSession").mockImplementation(async () => {
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
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  clients.push(client);
  const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue();
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { ...renderHook(() => useToggleEventRegistration(), { wrapper }), client, invalidate };
}
function draft(registered = true) { return { eventId: "original-event", registered }; }

beforeEach(() => {
  state.renderedUser = accountA;
  state.sessionUser = accountA;
  state.sessionError = null;
  state.afterSessionRead = null;
  state.responseOwner = undefined;
  state.responseEvent = undefined;
  state.emptyResponse = false;
  state.writes.length = 0;
  onlineManager.setOnline(true);
});
afterEach(() => { cleanup(); clients.splice(0).forEach(client => client.clear()); onlineManager.setOnline(true); });

describe.each([true, false])("event registration target=%s", registered => {
  it("rejects an offline change after the rendered account switches", async () => {
    const { result, rerender, invalidate } = workspace();
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.mutateAsync(draft(registered)).catch(error => error); });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    state.renderedUser = accountB;
    state.sessionUser = accountB;
    rerender();
    let outcome: unknown;
    await act(async () => { onlineManager.setOnline(true); outcome = await pending; });
    expect(outcome).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("rejects a paused change when its view unmounts before the session switches", async () => {
    const { result, unmount, client } = workspace();
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.mutateAsync(draft(registered)).catch(error => error); });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    unmount();
    state.sessionUser = accountB;
    onlineManager.setOnline(true);
    await client.resumePausedMutations();
    expect(await pending).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
  });

  it("keeps the submitted event and requested state while offline", async () => {
    const { result, invalidate } = workspace();
    const input = draft(registered);
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.mutateAsync(input); });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    input.eventId = "later-event";
    input.registered = !registered;
    await act(async () => { onlineManager.setOnline(true); await pending; });
    expect(state.writes).toEqual([{
      method: registered ? "POST" : "DELETE", owner: accountA,
      payload: registered ? { user_id: accountA, event_id: "original-event" } : {},
      filters: registered ? { select: "user_id,event_id" } : {
        user_id: `eq.${accountA}`, event_id: "eq.original-event", select: "user_id,event_id",
      },
    }]);
    expect(invalidate).toHaveBeenCalledExactlyOnceWith({ queryKey: ["event-registrations", accountA] });
  });

  it("pins the checked token when the shared session changes before dispatch", async () => {
    const { result } = workspace();
    state.afterSessionRead = () => { state.sessionUser = accountB; };
    await act(async () => { await result.current.mutateAsync(draft(registered)); });
    expect(state.sessionUser).toBe(accountB);
    expect(state.writes[0]).toMatchObject({ method: registered ? "POST" : "DELETE", owner: accountA });
    if (registered) expect(state.writes[0].payload).toMatchObject({ user_id: accountA, event_id: "original-event" });
    else expect(state.writes[0].filters).toMatchObject({ user_id: `eq.${accountA}`, event_id: "eq.original-event" });
  });

  it.each(["owner", "event", "empty"])("rejects unconfirmed %s response data", async kind => {
    const { result, invalidate } = workspace();
    if (kind === "owner") state.responseOwner = accountB;
    if (kind === "event") state.responseEvent = "another-event";
    if (kind === "empty") state.emptyResponse = true;
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft(registered)).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it.each([null, accountB])("does not send a request for session %s", async session => {
    const { result } = workspace();
    state.sessionUser = session;
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft(registered)).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
  });

  it("propagates an authentication read error without writing", async () => {
    const { result } = workspace();
    const failure = new Error("Session storage unavailable");
    state.sessionError = failure;
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft(registered)).catch(error => error); });
    expect(outcome).toBe(failure);
    expect(state.writes).toHaveLength(0);
  });
});

it("requires a signed-in submitting account even if an old session is still readable", async () => {
  state.renderedUser = null;
  const { result } = workspace();
  let outcome: unknown;
  await act(async () => { outcome = await result.current.mutateAsync(draft()).catch(error => error); });
  expect(outcome).toBeInstanceOf(Error);
  expect(state.writes).toHaveLength(0);
});
