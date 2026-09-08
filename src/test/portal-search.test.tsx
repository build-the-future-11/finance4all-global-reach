import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { searchFilter, usePortalSearch } from "@/hooks/portal/usePortalSearch";

const state = vi.hoisted(() => ({ failed: false, filteredBeforeLimit: true }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: (table: string) => {
  let filtered = false;
  const rows = Array.from({ length: 50 }, (_, i) => ({ id: String(i), title: i === 40 ? "Needle" : "Other", summary: "summary" }));
  let data = table === "news_articles" ? rows : [];
  const chain = {
    select: () => chain, neq: () => chain, eq: () => chain, order: () => chain,
    or: (filter: string) => { filtered = true; expect(filter).toContain("%needle%"); data = data.filter((row) => row.title.toLowerCase().includes("needle")); return chain; },
    limit: (limit: number) => { state.filteredBeforeLimit &&= filtered; data = data.slice(0, limit); return chain; },
    abortSignal: () => Promise.resolve({ data, error: state.failed ? { message: "private server details" } : null }),
  };
  return chain;
} } }));

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;
}
beforeEach(() => { state.failed = false; state.filteredBeforeLimit = true; });

it("finds a matching row beyond the old unfiltered limit", async () => {
  const { result } = renderHook(() => usePortalSearch("needle"), { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.map((row) => row.id)).toEqual(["40"]);
  expect(state.filteredBeforeLimit).toBe(true);
});
it("fails explicitly when a category fails without leaking server details", async () => {
  state.failed = true;
  const { result } = renderHook(() => usePortalSearch("needle"), { wrapper });
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.error?.message).toBe("Search is temporarily unavailable. Please retry.");
  expect(result.current.data).toBeUndefined();
});
it("quotes filter punctuation and escapes SQL wildcard characters", () => {
  expect(searchFilter(["title"], 'a,b"c')).toBe('title.ilike."%a,b\\"c%"');
  expect(searchFilter(["title"], "a_b%")).toBe('title.ilike."%a\\\\_b\\\\%%"');
  expect(() => searchFilter(["title"], "*")).toThrow();
  expect(() => searchFilter(["title"], "x".repeat(129))).toThrow();
});
