import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { searchResultCommandValue } from "@/lib/search-result-command";
import { searchFilter, usePortalSearch } from "@/hooks/portal/usePortalSearch";

const state = vi.hoisted(() => ({ failed: false, filteredBeforeLimit: true, crowded: false }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: (table: string) => {
  let filtered = false;
  const rows = Array.from({ length: 50 }, (_, i) => ({ id: String(i), title: i === 40 ? "Needle" : state.crowded ? "Needle extended" : "Other", summary: "summary" }));
  let data = table === "news_articles" ? rows : [];
  const chain = {
    select: () => chain, neq: () => chain, eq: () => chain, order: () => chain,
    or: (filter: string) => {
      filtered = true; expect(filter).toContain("needle");
      data = data.filter((row) => {
        const title = row.title.toLowerCase();
        if (filter.includes('not.ilike."needle%"')) return title.includes("needle") && !title.startsWith("needle");
        if (filter.includes('not.ilike."needle"')) return title.startsWith("needle") && title !== "needle";
        return title === "needle";
      });
      return chain;
    },
    limit: (limit: number) => { state.filteredBeforeLimit &&= filtered; data = data.slice(0, limit); return chain; },
    abortSignal: () => Promise.resolve({ data, error: state.failed ? { message: "private server details" } : null }),
  };
  return chain;
} } }));

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;
}
beforeEach(() => { state.failed = false; state.filteredBeforeLimit = true; state.crowded = false; });

it("finds a matching row beyond the old unfiltered limit", async () => {
  const { result } = renderHook(() => usePortalSearch("needle"), { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.map((row) => row.id)).toEqual(["40"]);
  expect(state.filteredBeforeLimit).toBe(true);
  expect(result.current.data?.[0].href).toContain("?selected=40");
});
it("finds the exact match beyond a crowded prefix candidate window", async () => {
  state.crowded = true;
  const { result } = renderHook(() => usePortalSearch("needle"), { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.[0].id).toBe("40");
  expect(result.current.data).toHaveLength(12);
  expect(new Set(result.current.data?.map((row) => row.id)).size).toBe(12);
});
it("assigns command items identity independent of shared titles", () => {
  const first = { id: "news-1", type: "news" as const };
  const second = { id: "news-2", type: "news" as const };
  const crossType = { id: "news-1", type: "event" as const };
  expect(searchResultCommandValue(first)).toBe("news:news-1");
  expect(searchResultCommandValue(second)).not.toBe(searchResultCommandValue(first));
  expect(searchResultCommandValue(crossType)).not.toBe(searchResultCommandValue(first));
});
it("builds disjoint server-side relevance tiers", () => {
  expect(searchFilter(["title", "summary"], "needle", "exact")).toBe('title.ilike."needle"');
  expect(searchFilter(["title", "summary"], "needle", "prefix")).toBe('and(title.ilike."needle%",title.not.ilike."needle")');
  expect(searchFilter(["title", "summary"], "needle", "remaining")).toBe('and(or(title.ilike."%needle%",summary.ilike."%needle%"),title.not.ilike."needle%")');
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
