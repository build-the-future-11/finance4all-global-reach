import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCollaboration } from "@/hooks/portal/useCollaboration";

const projectA = "20000000-0000-4000-8000-000000000091";
const projectB = "20000000-0000-4000-8000-000000000092";
const memberId = "10000000-0000-4000-8000-000000000091";

type Write = {
  table: string;
  payload: unknown;
  filters: Record<string, unknown>;
};
const state = vi.hoisted(() => ({ writes: [] as Write[] }));

vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: { id: memberId } }) }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: (table: string) => {
  let payload: unknown;
  const filters: Record<string, unknown> = {};
  const confirm = async () => {
    state.writes.push({ table, payload, filters: { ...filters } });
    return { data: { id: "confirmed", revision: 4 }, error: null };
  };
  const chain = {
    select: () => chain,
    insert: (value: unknown) => { payload = value; return chain; },
    update: (value: unknown) => { payload = value; return chain; },
    eq: (column: string, value: unknown) => { filters[column] = value; return chain; },
    order: () => chain,
    single: confirm,
    maybeSingle: confirm,
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve),
  };
  return chain;
} } }));

const clients: QueryClient[] = [];
function workspace() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  clients.push(client);
  for (const projectId of [projectA, projectB]) {
    client.setQueryData(["project-tasks", memberId, projectId], []);
    client.setQueryData(["project-memberships", memberId, projectId], []);
  }
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return renderHook(({ projectId }) => useCollaboration(projectId), { wrapper, initialProps: { projectId: projectA } });
}

beforeEach(() => { state.writes.length = 0; onlineManager.setOnline(true); });
afterEach(() => { cleanup(); clients.splice(0).forEach(client => client.clear()); onlineManager.setOnline(true); });

describe("collaboration requests paused while offline", () => {
  it("sends a queued invitation to the project selected at submission", async () => {
    const { result, rerender } = workspace();
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.invite.mutateAsync(memberId); });
    await waitFor(() => expect(result.current.invite.isPending).toBe(true));
    expect(state.writes).toHaveLength(0);
    rerender({ projectId: projectB });
    await act(async () => { onlineManager.setOnline(true); await pending; });
    expect(state.writes).toEqual([{
      table: "project_memberships",
      payload: { project_id: projectA, user_id: memberId },
      filters: {},
    }]);
  });

  it("retains the submitted project, task and revision for a queued update", async () => {
    const { result, rerender } = workspace();
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.updateTask.mutateAsync({ id: "task-a", revision: 3, status: "in_progress", evidence_url: "" }); });
    await waitFor(() => expect(result.current.updateTask.isPending).toBe(true));
    expect(state.writes).toHaveLength(0);
    rerender({ projectId: projectB });
    await act(async () => { onlineManager.setOnline(true); await pending; });
    expect(state.writes).toEqual([{
      table: "project_tasks",
      payload: { status: "in_progress", evidence_url: "" },
      filters: { project_id: projectA, id: "task-a", revision: 3 },
    }]);
  });

  it("snapshots task edits before queued execution instead of retaining the caller object", async () => {
    const { result } = workspace();
    const input = { id: "task-a", revision: 3, status: "submitted" as const, evidence_url: " https://example.org/original-evidence " };
    onlineManager.setOnline(false);
    let pending!: Promise<unknown>;
    act(() => { pending = result.current.updateTask.mutateAsync(input); });
    await waitFor(() => expect(result.current.updateTask.isPending).toBe(true));
    input.id = "task-b";
    input.revision = 8;
    input.evidence_url = "https://example.org/later-unsent-edit";
    await act(async () => { onlineManager.setOnline(true); await pending; });
    expect(state.writes).toEqual([{
      table: "project_tasks",
      payload: { status: "submitted", evidence_url: "https://example.org/original-evidence" },
      filters: { project_id: projectA, id: "task-a", revision: 3 },
    }]);
  });
});
