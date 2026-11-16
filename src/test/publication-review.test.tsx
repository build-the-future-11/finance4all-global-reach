import { act, cleanup, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useReviewPublication } from "@/hooks/portal/usePublication";
import { isVisibleContent } from "@/lib/content-visibility";

const state = vi.hoisted(() => ({
  session: "reviewer", nextSession: false, response: {} as unknown,
  error: null as { message: string } | null, calls: [] as unknown[], headers: [] as unknown[],
}));
vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: { id: "reviewer" }, profile: { role: "admin" } }) }));
vi.mock("@/lib/supabase", () => ({ supabase: {
  auth: { getSession: async () => {
    const user = state.session;
    if (state.nextSession) state.session = "another-user";
    return { data: { session: { user: { id: user }, access_token: `token-${user}` } }, error: null };
  } },
  rpc: (name: string, payload: unknown) => {
    state.calls.push({ name, payload });
    return { setHeader: async (name: string, value: string) => {
      state.headers.push({ name, value });
      return { data: state.response, error: state.error };
    } };
  },
} }));
const row = { id: "article", title: "Reviewed copy", publication_state: "draft" as const, publication_revision: 3 };
function mount() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue();
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { ...renderHook(useReviewPublication, { wrapper }), invalidate };
}
beforeEach(() => {
  state.session = "reviewer"; state.nextSession = false; state.calls = []; state.headers = []; state.error = null;
  state.response = { ...row, publication_state: "published", publication_revision: 4 };
});
afterEach(cleanup);
it("requires explicit publication metadata, independent of a title or seed ID", () => {
  expect(isVisibleContent("news", {})).toBe(false);
  for (const publication_state of ["draft", "archived", "PUBLIC", ""]) expect(isVisibleContent("news", { publication_state })).toBe(false);
  expect(isVisibleContent("news", { publication_state: "published" })).toBe(true);
});
it("sends the observed revision and pins the checked reviewer's credentials", async () => {
  const { result, invalidate } = mount(); state.nextSession = true;
  await act(async () => { await result.current.review({ table: "news_articles", row, state: "published", note: "  Sources checked for this revision.  " }); });
  expect(state.calls).toEqual([{ name: "review_publication", payload: { content_table: "news_articles", content_id: "article", expected_revision: 3, next_state: "published", review_note: "Sources checked for this revision." } }]);
  expect(state.headers).toEqual([{ name: "Authorization", value: "Bearer token-reviewer" }]);
  expect(invalidate).toHaveBeenCalledOnce();
});
it("blocks a review when the active account has changed", async () => {
  const { result } = mount(); state.session = "another-user";
  await act(async () => { await expect(result.current.review({ table: "news_articles", row, state: "published", note: "Sources checked." })).rejects.toThrow("account changed"); });
  expect(state.calls).toEqual([]);
});
it.each([null, { ...row, publication_state: "published", publication_revision: 3 }, { ...row, publication_revision: 4 }, { ...row, id: "wrong", publication_state: "published", publication_revision: 4 }])("rejects an unconfirmed review receipt %j", async response => {
  const { result, invalidate } = mount(); state.response = response;
  await act(async () => { await expect(result.current.review({ table: "news_articles", row, state: "published", note: "Sources checked." })).rejects.toThrow("could not be confirmed"); });
  expect(invalidate).not.toHaveBeenCalled();
});
it("surfaces server conflict/quota errors without reporting a successful review", async () => {
  const { result, invalidate } = mount(); state.error = { message: "Content changed. Reload and review the current version." };
  await act(async () => { await expect(result.current.review({ table: "news_articles", row, state: "published", note: "Sources checked." })).rejects.toThrow("Content changed"); });
  expect(invalidate).not.toHaveBeenCalled();
});
