import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";
import { useAccountDeletionRequests } from "@/hooks/portal/useAccountLifecycle";

vi.mock("@/lib/supabase", () => ({ supabase: { from: () => {
  let cursor = -1;
  let limit = 0;
  const rows = Array.from({ length: 53 }, (_, i) => ({ id: String(i).padStart(3, "0"), requested_at: "2026-09-08T00:00:00+00:00" }));
  const chain = {
    select: () => chain, order: () => chain,
    limit: (size: number) => { limit = size; return chain; },
    or: (filter: string) => {
      expect(filter).toContain('requested_at.gt."2026-09-08T00:00:00+00:00"');
      cursor = Number(filter.match(/id\.gt\."(\d+)"/)?.[1]);
      return chain;
    },
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: rows.filter((row) => Number(row.id) > cursor).slice(0, limit), error: null }).then(resolve),
  };
  return chain;
} } }));

it("loads tied timestamps over multiple pages without gaps or duplicates", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function wrapper({ children }: { children: ReactNode }) { return <QueryClientProvider client={client}>{children}</QueryClientProvider>; }
  const { result } = renderHook(() => useAccountDeletionRequests(), { wrapper });
  await waitFor(() => expect(result.current.data).toHaveLength(25));
  await act(async () => { await result.current.fetchNextPage(); });
  await waitFor(() => expect(result.current.data).toHaveLength(50));
  await act(async () => { await result.current.fetchNextPage(); });
  await waitFor(() => expect(result.current.data).toHaveLength(53));
  expect(new Set(result.current.data?.map((row) => row.id)).size).toBe(53);
  expect(result.current.hasNextPage).toBe(false);
});
