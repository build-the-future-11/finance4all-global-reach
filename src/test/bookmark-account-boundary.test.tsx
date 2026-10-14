import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { useToggleNewsBookmark, useToggleProjectBookmark } from "@/hooks/portal/useBookmarks";

const accountA = "10000000-0000-4000-8000-000000000091";
const accountB = "10000000-0000-4000-8000-000000000092";
type Write = { method: string; owner: string | null; payload: Record<string, unknown>; filters: Record<string, string> };
const state = vi.hoisted(() => ({
  renderedUser: "" as string | null,
  sessionUser: "" as string | null,
  sessionError: null as Error | null,
  afterSessionRead: null as (() => void) | null,
  responseOwner: undefined as string | undefined,
  emptyResponse: false,
  writes: [] as Write[],
}));

vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: state.renderedUser ? { id: state.renderedUser } : null }) }));
vi.mock("@/lib/supabase", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient("https://bookmark-fixture.example", "fixture-public-key", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async (input, init) => {
      const url = new URL(String(input));
      const method = init?.method ?? "GET";
      const authorization = new Headers(init?.headers).get("authorization");
      const owner = authorization?.startsWith("Bearer fixture-") ? authorization.slice("Bearer fixture-".length) : null;
      const payload = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : {};
      const filters = Object.fromEntries(url.searchParams);
      state.writes.push({ method, owner, payload, filters });
      const column = url.pathname.endsWith("news_bookmarks") ? "article_id" : "project_id";
      const row = { user_id: state.responseOwner ?? owner, [column]: payload[column] ?? filters[column]?.replace(/^eq\./, "") };
      return new Response(JSON.stringify(state.emptyResponse ? null : row), { status: 200, headers: { "Content-Type": "application/json" } });
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
function workspace(kind: "news" | "project") {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  clients.push(client);
  const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue();
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const useBookmark = () => {
    const news = useToggleNewsBookmark();
    const project = useToggleProjectBookmark();
    return kind === "news" ? news : project;
  };
  return { ...renderHook(useBookmark, { wrapper }), client, invalidate };
}
function draft(saved = false) { return { articleId: "original-item", projectId: "original-item", saved }; }

beforeEach(() => {
  state.renderedUser = accountA;
  state.sessionUser = accountA;
  state.sessionError = null;
  state.afterSessionRead = null;
  state.responseOwner = undefined;
  state.emptyResponse = false;
  state.writes.length = 0;
  onlineManager.setOnline(true);
});
afterEach(() => { cleanup(); clients.splice(0).forEach(client => client.clear()); onlineManager.setOnline(true); });

describe.each(["news", "project"] as const)("%s bookmark account boundary", kind => {
  const column = kind === "news" ? "article_id" : "project_id";

  it.each([false, true])("rejects a queued saved=%s change after switching accounts", async saved => {
    const { result, rerender } = workspace(kind);
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.mutateAsync(draft(saved)).catch(error => error); });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    state.renderedUser = accountB;
    state.sessionUser = accountB;
    rerender();
    let outcome: unknown;
    await act(async () => { onlineManager.setOnline(true); outcome = await pending; });
    expect(outcome).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
  });

  it("rejects a queued change after the original view unmounts and the session changes", async () => {
    const { result, unmount, client } = workspace(kind);
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.mutateAsync(draft()).catch(error => error); });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    unmount();
    state.sessionUser = accountB;
    onlineManager.setOnline(true);
    await client.resumePausedMutations();
    expect(await pending).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
  });

  it("snapshots the submitted item and action before queuing", async () => {
    const { result, invalidate } = workspace(kind);
    const input = draft();
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.mutateAsync(input); });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    input.articleId = "later-item";
    input.projectId = "later-item";
    input.saved = true;
    await act(async () => { onlineManager.setOnline(true); await pending; });
    expect(state.writes).toEqual([{
      method: "POST", owner: accountA,
      payload: { user_id: accountA, [column]: "original-item" },
      filters: { select: `user_id,${column}` },
    }]);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: [`${kind}-bookmarks`, accountA] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: [kind === "news" ? "saved-articles" : "saved-projects", accountA] });
  });

  it.each([false, true])("binds saved=%s to the checked token if the session changes before dispatch", async saved => {
    const { result } = workspace(kind);
    state.afterSessionRead = () => { state.sessionUser = accountB; };
    await act(async () => { await result.current.mutateAsync(draft(saved)); });
    expect(state.sessionUser).toBe(accountB);
    expect(state.writes[0]).toMatchObject({ method: saved ? "DELETE" : "POST", owner: accountA });
    if (saved) expect(state.writes[0].filters).toMatchObject({ user_id: `eq.${accountA}`, [column]: "eq.original-item" });
  });

  it("does not confirm a response for another account", async () => {
    const { result, invalidate } = workspace(kind);
    state.responseOwner = accountB;
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft()).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("does not confirm a successful response without a returned bookmark", async () => {
    const { result, invalidate } = workspace(kind);
    state.emptyResponse = true;
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft()).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it.each([null, accountB])("sends no request for an unavailable or different session: %s", async session => {
    const { result } = workspace(kind);
    state.sessionUser = session;
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft()).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
  });
});
