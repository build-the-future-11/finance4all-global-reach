import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";
import { useReviewAccountDeletionRequest } from "@/hooks/portal/useAccountLifecycle";

const mock = vi.hoisted(() => ({ response: { data: null, error: null } as { data: { id: string } | null; error: { message: string } | null } }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: () => {
  const chain = { update: () => chain, eq: () => chain, select: () => chain, single: async () => mock.response };
  return chain;
} } }));
function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}
it.each([
  { data: null, error: null },
  { data: { id: "different" }, error: null },
  { data: null, error: { message: "forbidden" } },
])("rejects unconfirmed administrative changes: %j", async (response) => {
  mock.response = response;
  const { result } = renderHook(useReviewAccountDeletionRequest, { wrapper });
  await act(async () => {
    await expect(result.current.mutateAsync({ id: "request", status: "in_progress" })).rejects.toBeDefined();
  });
});
it("accepts the confirmed requested row", async () => {
  mock.response = { data: { id: "request" }, error: null };
  const { result } = renderHook(useReviewAccountDeletionRequest, { wrapper });
  await act(async () => {
    await expect(result.current.mutateAsync({ id: "request", status: "in_progress" })).resolves.toBeUndefined();
  });
});
