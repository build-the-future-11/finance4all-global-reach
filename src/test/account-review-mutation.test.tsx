import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { useReviewAccountDeletionRequest } from "@/hooks/portal/useAccountLifecycle";

const mock = vi.hoisted(() => ({
  response: { data: null, error: null } as { data: { id: string } | null; error: { message: string } | null },
  eqCalls: [] as Array<[string, string]>,
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => {
      const chain = {
        update: () => chain,
        eq: (column: string, value: string) => {
          mock.eqCalls.push([column, value]);
          return chain;
        },
        select: () => chain,
        maybeSingle: async () => mock.response,
      };
      return chain;
    },
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  mock.eqCalls = [];
});

it.each([
  { data: null, error: null },
  { data: { id: "different" }, error: null },
  { data: null, error: { message: "forbidden" } },
])("rejects unconfirmed administrative changes: %j", async (response) => {
  mock.response = response;
  const { result } = renderHook(useReviewAccountDeletionRequest, { wrapper });
  await act(async () => {
    await expect(result.current.mutateAsync({
      id: "request",
      status: "in_progress",
      expectedUpdatedAt: "2026-09-18T00:00:00Z",
    })).rejects.toBeDefined();
  });
});

it("binds the write to the loaded row version and accepts the confirmed requested row", async () => {
  mock.response = { data: { id: "request" }, error: null };
  const { result } = renderHook(useReviewAccountDeletionRequest, { wrapper });
  await act(async () => {
    await expect(result.current.mutateAsync({
      id: "request",
      status: "in_progress",
      reviewNote: "verified",
      expectedUpdatedAt: "2026-09-18T00:00:00Z",
    })).resolves.toBeUndefined();
  });

  expect(mock.eqCalls).toContainEqual(["id", "request"]);
  expect(mock.eqCalls).toContainEqual(["updated_at", "2026-09-18T00:00:00Z"]);
});
