import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useSubmitEssay, useSubmitStudio, useToggleEssayUpvote, useToggleOpportunityInterest,
} from "@/hooks/portal/usePathways";

const accountA = "10000000-0000-4000-8000-000000000091";
const accountB = "10000000-0000-4000-8000-000000000092";
type Write = { table: string; method: string; owner: string | null; payload: Record<string, unknown>; filters: Record<string, string> };
const state = vi.hoisted(() => ({
  renderedUser: "" as string | null,
  sessionUser: "" as string | null,
  sessionError: null as Error | null,
  emptyToken: false,
  afterSessionRead: null as (() => void) | null,
  responsePatch: {} as Record<string, unknown>,
  emptyResponse: false,
  responseError: false,
  writes: [] as Write[],
}));

vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: state.renderedUser ? { id: state.renderedUser } : null }) }));
vi.mock("@/lib/supabase", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient("https://pathways-fixture.example", "fixture-public-key", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async (input, init) => {
      const url = new URL(String(input));
      const table = url.pathname.split("/").at(-1)!;
      const method = init?.method ?? "GET";
      const authorization = new Headers(init?.headers).get("authorization");
      const owner = authorization?.startsWith("Bearer fixture-") ? authorization.slice("Bearer fixture-".length) : null;
      const payload = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : {};
      const filters = Object.fromEntries(url.searchParams);
      state.writes.push({ table, method, owner, payload, filters });
      const row = {
        id: "confirmed-submission", ...payload,
        user_id: owner, author_id: owner,
        opportunity_id: payload.opportunity_id ?? filters.opportunity_id?.replace(/^eq\./, ""),
        essay_id: payload.essay_id ?? filters.essay_id?.replace(/^eq\./, ""),
        ...state.responsePatch,
      };
      return new Response(JSON.stringify(state.responseError
        ? { code: "42501", message: "Write rejected by database policy" }
        : state.emptyResponse ? null : row), {
        status: state.responseError ? 403 : 200, headers: { "Content-Type": "application/json" },
      });
    } },
  });
  vi.spyOn(supabase.auth, "getSession").mockImplementation(async () => {
    const session = state.sessionUser ? {
      user: { id: state.sessionUser }, access_token: state.emptyToken ? "" : `fixture-${state.sessionUser}`,
      refresh_token: "fixture-refresh", expires_in: 3600, token_type: "bearer",
    } as Session : null;
    const afterRead = state.afterSessionRead;
    state.afterSessionRead = null;
    afterRead?.();
    return { data: { session }, error: state.sessionError } as Awaited<ReturnType<typeof supabase.auth.getSession>>;
  });
  return { supabase };
});

type Kind = "interest" | "vote" | "essay" | "studio";
const cases = [
  { kind: "interest", enabled: true, table: "opportunity_interests", owner: "user_id", target: "opportunity_id" },
  { kind: "interest", enabled: false, table: "opportunity_interests", owner: "user_id", target: "opportunity_id" },
  { kind: "vote", enabled: true, table: "essay_upvotes", owner: "user_id", target: "essay_id" },
  { kind: "vote", enabled: false, table: "essay_upvotes", owner: "user_id", target: "essay_id" },
  { kind: "essay", enabled: true, table: "essay_submissions", owner: "author_id", target: "body" },
  { kind: "studio", enabled: true, table: "studio_submissions", owner: "author_id", target: "writeup" },
] as const;

const clients: QueryClient[] = [];
function useAction(kind: Kind) {
  const actions = {
    interest: useToggleOpportunityInterest(), vote: useToggleEssayUpvote(),
    essay: useSubmitEssay(), studio: useSubmitStudio(),
  };
  return actions[kind];
}
function workspace(kind: Kind) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  clients.push(client);
  const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue();
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { ...renderHook(() => useAction(kind), { wrapper }), client, invalidate };
}
function draft(enabled = true) {
  return {
    opportunityId: "original-opportunity", interested: enabled,
    essayId: "original-essay", upvoted: enabled,
    title: "Original title", body: "Original essay", writeup: "Original project",
    repoUrl: "https://example.org/original-repo", demoUrl: "https://example.org/original-demo",
  };
}

beforeEach(() => {
  state.renderedUser = accountA;
  state.sessionUser = accountA;
  state.sessionError = null;
  state.emptyToken = false;
  state.afterSessionRead = null;
  state.responsePatch = {};
  state.emptyResponse = false;
  state.responseError = false;
  state.writes.length = 0;
  onlineManager.setOnline(true);
});
afterEach(() => { cleanup(); clients.splice(0).forEach(client => client.clear()); onlineManager.setOnline(true); });

describe.each(cases)("Pathways $kind enabled=$enabled", ({ kind, enabled, table, owner, target }) => {
  it("rejects a queued operation after the rendered account switches", async () => {
    const { result, rerender, invalidate } = workspace(kind);
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.mutateAsync(draft(enabled)).catch(error => error); });
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

  it("rejects a queued operation when its view unmounts before a session switch", async () => {
    const { result, unmount, client } = workspace(kind);
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.mutateAsync(draft(enabled)).catch(error => error); });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    unmount();
    state.sessionUser = accountB;
    onlineManager.setOnline(true);
    await client.resumePausedMutations();
    expect(await pending).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
  });

  it("keeps the submitted content, item and requested action while offline", async () => {
    const { result } = workspace(kind);
    const input = draft(enabled);
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.mutateAsync(input); });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    Object.assign(input, {
      opportunityId: "later-opportunity", interested: !enabled, essayId: "later-essay", upvoted: !enabled,
      title: "Later title", body: "Later essay", writeup: "Later project",
      repoUrl: "https://example.org/later-repo", demoUrl: "https://example.org/later-demo",
    });
    await act(async () => { onlineManager.setOnline(true); await pending; });
    expect(state.writes).toHaveLength(1);
    const write = state.writes[0];
    expect(write).toMatchObject({ table, owner: accountA, method: enabled ? "POST" : "DELETE" });
    if (kind === "interest" || kind === "vote") {
      const item = kind === "interest" ? "original-opportunity" : "original-essay";
      if (enabled) expect(write.payload).toEqual({ user_id: accountA, [target]: item });
      else expect(write.filters).toMatchObject({ user_id: `eq.${accountA}`, [target]: `eq.${item}` });
    } else if (kind === "essay") {
      expect(write.payload).toEqual({ author_id: accountA, title: "Original title", body: "Original essay" });
    } else {
      expect(write.payload).toEqual({
        author_id: accountA, title: "Original title", writeup: "Original project",
        repo_url: "https://example.org/original-repo", demo_url: "https://example.org/original-demo",
      });
    }
  });

  it("pins the checked token when the shared session changes before dispatch", async () => {
    const { result } = workspace(kind);
    state.afterSessionRead = () => { state.sessionUser = accountB; };
    await act(async () => { await result.current.mutateAsync(draft(enabled)); });
    expect(state.sessionUser).toBe(accountB);
    expect(state.writes[0]).toMatchObject({ table, owner: accountA });
  });

  it.each([null, accountB])("does not send a request for session %s", async session => {
    const { result } = workspace(kind);
    state.sessionUser = session;
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft(enabled)).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
  });

  it("does not send a request without an access token", async () => {
    const { result } = workspace(kind);
    state.emptyToken = true;
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft(enabled)).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
  });

  it("propagates an authentication read error without writing", async () => {
    const { result } = workspace(kind);
    const failure = new Error("Session storage unavailable");
    state.sessionError = failure;
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft(enabled)).catch(error => error); });
    expect(outcome).toBe(failure);
    expect(state.writes).toHaveLength(0);
  });

  it("requires a signed-in submitting account even if an old session is readable", async () => {
    state.renderedUser = null;
    const { result } = workspace(kind);
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft(enabled)).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
  });

  it.each(["empty", "owner", "target"])("rejects unconfirmed %s response data", async response => {
    const { result, invalidate } = workspace(kind);
    if (response === "empty") state.emptyResponse = true;
    if (response === "owner") state.responsePatch = { [owner]: accountB };
    if (response === "target") state.responsePatch = { [target]: "Different content or item" };
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft(enabled)).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("propagates database denials without marking queries successful", async () => {
    const { result, invalidate } = workspace(kind);
    state.responseError = true;
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft(enabled)).catch(error => error); });
    expect(outcome).toMatchObject({ code: "42501", message: "Write rejected by database policy" });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("refreshes the relevant query only after confirmation", async () => {
    const { result, invalidate } = workspace(kind);
    await act(async () => { await result.current.mutateAsync(draft(enabled)); });
    expect(state.writes).toHaveLength(1);
    expect(state.writes[0].filters.select).toContain(owner);
    expect(state.writes[0].filters.select).toContain(target);
    const keys = invalidate.mock.calls.map(([input]) => input?.queryKey);
    if (kind === "interest") expect(keys).toEqual([["opportunity-interests", accountA]]);
    if (kind === "vote") expect(keys).toEqual([["essays"], ["essay-upvotes", accountA]]);
    if (kind === "essay") expect(keys).toEqual([["essays"]]);
    if (kind === "studio") expect(keys).toEqual([["studio-submissions"]]);
  });
});

describe.each(["essay", "studio"] as const)("$s submission receipt", kind => {
  it.each(["", null, 123])("rejects invalid saved identifiers: %s", async id => {
    const { result, invalidate } = workspace(kind);
    state.responsePatch = { id };
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft()).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
    expect(invalidate).not.toHaveBeenCalled();
  });
  it("rejects a receipt for a different submitted title", async () => {
    const { result } = workspace(kind);
    state.responsePatch = { title: "Different title" };
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft()).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
  });
});

describe("Studio URL validation", () => {
  it.each(["repoUrl", "demoUrl"] as const)("rejects an unsafe %s before a write", async key => {
    const { result } = workspace("studio");
    const input = { ...draft(), [key]: "javascript:alert(1)" };
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(input).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
    expect(state.writes).toHaveLength(0);
  });
  it.each(["repo_url", "demo_url"] as const)("rejects an altered %s in the receipt", async key => {
    const { result } = workspace("studio");
    state.responsePatch = { [key]: "https://example.org/different" };
    let outcome: unknown;
    await act(async () => { outcome = await result.current.mutateAsync(draft()).catch(error => error); });
    expect(outcome).toBeInstanceOf(Error);
  });
  it("saves and confirms omitted optional URLs as null", async () => {
    const { result } = workspace("studio");
    const input = { ...draft(), repoUrl: undefined, demoUrl: undefined };
    await act(async () => { await result.current.mutateAsync(input); });
    expect(state.writes[0].payload).toMatchObject({ repo_url: null, demo_url: null });
  });
});
