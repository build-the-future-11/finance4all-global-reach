import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCollaboration } from "@/hooks/portal/useCollaboration";

const selectedProject = "20000000-0000-4000-8000-000000000091";
const otherProject = "20000000-0000-4000-8000-000000000092";
const memberId = "10000000-0000-4000-8000-000000000091";

const mock = vi.hoisted(() => ({
  inserts: [] as Array<{ table: string; payload: unknown }>,
  updates: [] as Array<{ table: string; payload: unknown }>,
  filters: [] as Array<{ table: string; column: string; value: unknown }>,
}));

vi.mock("@/contexts/useAuth", () => ({
  useAuth: () => ({ user: { id: memberId } }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table: string) => {
      const chain = {
        select: () => chain,
        insert: (payload: unknown) => {
          mock.inserts.push({ table, payload });
          return chain;
        },
        update: (payload: unknown) => {
          mock.updates.push({ table, payload });
          return chain;
        },
        eq: (column: string, value: unknown) => {
          mock.filters.push({ table, column, value });
          return chain;
        },
        order: () => chain,
        single: async () => ({ data: { id: "confirmed", revision: 1 }, error: null }),
        maybeSingle: async () => ({ data: { id: "confirmed", revision: 1 }, error: null }),
        then: (resolve: (value: { data: unknown[]; error: null }) => unknown) =>
          Promise.resolve({ data: [], error: null }).then(resolve),
      };
      return chain;
    },
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;
}

describe("collaboration mutation boundaries", () => {
  beforeEach(() => {
    mock.inserts.length = 0;
    mock.updates.length = 0;
    mock.filters.length = 0;
  });

  it("binds a new task to the selected project instead of trusting a caller project id", async () => {
    const { result } = renderHook(() => useCollaboration(selectedProject), { wrapper });
    await act(async () => {
      await result.current.createTask.mutateAsync({
        project_id: otherProject,
        title: "Verify member isolation",
        kind: "task",
      });
    });
    expect(mock.inserts.find((entry) => entry.table === "project_tasks")?.payload).toMatchObject({
      project_id: selectedProject,
      title: "Verify member isolation",
    });
  });

  it("scopes task updates to the selected project as well as the task revision", async () => {
    const { result } = renderHook(() => useCollaboration(selectedProject), { wrapper });
    mock.filters.length = 0;
    await act(async () => {
      await result.current.updateTask.mutateAsync({ id: "task-1", revision: 3, status: "in_progress", evidence_url: "" });
    });
    expect(mock.filters).toContainEqual({ table: "project_tasks", column: "project_id", value: selectedProject });
  });

  it("rejects malformed member identifiers before sending an invitation", async () => {
    const { result } = renderHook(() => useCollaboration(selectedProject), { wrapper });
    await act(async () => {
      await expect(result.current.invite.mutateAsync("------------------------------------")).rejects.toThrow("valid member account ID");
    });
    expect(mock.inserts.filter((entry) => entry.table === "project_memberships")).toHaveLength(0);
  });

  it("rejects submitted work without evidence before issuing a database update", async () => {
    const { result } = renderHook(() => useCollaboration(selectedProject), { wrapper });
    await act(async () => {
      await expect(result.current.updateTask.mutateAsync({ id: "task-1", revision: 3, status: "submitted", evidence_url: "  " })).rejects.toThrow("evidence link is required");
    });
    expect(mock.updates.filter((entry) => entry.table === "project_tasks")).toHaveLength(0);
  });
});
