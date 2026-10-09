import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Collaboration from "@/pages/portal/Collaboration";

const memberId = "10000000-0000-4000-8000-000000000091";
const projectId = "20000000-0000-4000-8000-000000000091";
const taskId = "30000000-0000-4000-8000-000000000091";
const queryKey = ["project-tasks", memberId, projectId];
const state = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn() }));

vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: { id: memberId }, profile: { role: "member" } }) }));
vi.mock("@/hooks/portal/useLabs", () => ({ useResearchProjects: () => ({ data: [{ id: projectId, leadResearcherId: memberId, title: "Test project" }], isLoading: false, error: null, refetch: vi.fn() }) }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: (table: string) => {
  let operation = "read";
  let payload: unknown;
  const filters: Record<string, unknown> = {};
  const finish = () => operation === "read" ? state.read(table) : state.write(table, operation, payload, filters);
  const chain = {
    select: () => chain,
    eq: (column: string, value: unknown) => { filters[column] = value; return chain; },
    order: () => chain,
    insert: (value: unknown) => { operation = "insert"; payload = value; return chain; },
    update: (value: unknown) => { operation = "update"; payload = value; return chain; },
    single: finish,
    maybeSingle: finish,
    then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) => Promise.resolve(finish()).then(resolve, reject),
  };
  return chain;
} } }));

const saved = { id: taskId, project_id: projectId, title: "Evaluate the baseline", description: "Check chronological evaluation", kind: "task", assignee_id: memberId, due_date: null, status: "in_progress", evidence_url: "https://example.com/saved", revision: 6, created_at: "2026-10-07T12:00:00Z", updated_at: "2026-10-07T12:00:00Z" };
const clients: QueryClient[] = [];

function workspace() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } } });
  clients.push(client);
  client.setQueryData(queryKey, [saved]);
  client.setQueryData(["project-memberships", memberId, projectId], []);
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={["/portal/collaboration?project=" + projectId]}><Collaboration /></MemoryRouter></QueryClientProvider>);
  return client;
}

beforeEach(() => {
  state.read.mockReset().mockImplementation(async table => ({ data: table === "project_tasks" ? [saved] : [], error: null }));
  state.write.mockReset().mockResolvedValue({ data: { ...saved, revision: 7 }, error: null });
});
afterEach(() => { cleanup(); clients.splice(0).forEach(client => client.clear()); vi.restoreAllMocks(); });

describe("collaboration editor persistence", () => {
  it("preserves unsent evidence and the original revision when another session updates the task", async () => {
    const client = workspace();
    fireEvent.change(screen.getByLabelText("HTTPS evidence link"), { target: { value: "https://example.com/my-unsent-evidence" } });
    act(() => { client.setQueryData(queryKey, [{ ...saved, evidence_url: "https://example.com/another-session", revision: 7 }]); });
    await waitFor(() => expect(screen.getByRole("link", { name: "Open submitted evidence" })).toHaveAttribute("href", "https://example.com/another-session"));
    expect(screen.getByLabelText("HTTPS evidence link")).toHaveValue("https://example.com/my-unsent-evidence");
    state.write.mockResolvedValue({ data: null, error: null });
    fireEvent.click(screen.getByRole("button", { name: "Save task" }));
    await waitFor(() => expect(screen.getByText(/This task changed or access was removed/)).toBeVisible());
    expect(state.write).toHaveBeenCalledWith("project_tasks", "update", { status: "in_progress", evidence_url: "https://example.com/my-unsent-evidence" }, { project_id: projectId, id: taskId, revision: 6 });
    expect(screen.getByLabelText("HTTPS evidence link")).toHaveValue("https://example.com/my-unsent-evidence");
  });

  it("keeps the evidence editor through a transient refresh error", async () => {
    const client = workspace();
    fireEvent.change(screen.getByLabelText("HTTPS evidence link"), { target: { value: "https://example.com/unsent-work" } });
    state.read.mockImplementation(async table => table === "project_tasks" ? { data: null, error: new Error("Task refresh unavailable") } : { data: [], error: null });
    await act(async () => { await client.invalidateQueries({ queryKey }); });
    await waitFor(() => expect(client.getQueryState(queryKey)?.status).toBe("error"));
    expect(screen.getByLabelText("HTTPS evidence link")).toHaveValue("https://example.com/unsent-work");
    expect(state.write).not.toHaveBeenCalled();
  });

  it("removes a task after a confirmed response no longer exposes it", async () => {
    const client = workspace();
    fireEvent.change(screen.getByLabelText("HTTPS evidence link"), { target: { value: "https://example.com/unsent-work" } });
    act(() => { client.setQueryData(queryKey, []); });
    await waitFor(() => expect(screen.queryByLabelText("HTTPS evidence link")).not.toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Save task" })).not.toBeInTheDocument();
    expect(state.write).not.toHaveBeenCalled();
  });

  it("adopts a fresh saved task when there are no unsent edits", async () => {
    const client = workspace();
    act(() => { client.setQueryData(queryKey, [{ ...saved, evidence_url: "https://example.com/fresh-saved", revision: 7 }]); });
    await waitFor(() => expect(screen.getByLabelText("HTTPS evidence link")).toHaveValue("https://example.com/fresh-saved"));
    expect(state.write).not.toHaveBeenCalled();
  });

  it("keeps edits after a failed reload and adopts the revision from a successful explicit reload", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    workspace();
    fireEvent.change(screen.getByLabelText("HTTPS evidence link"), { target: { value: "https://example.com/retain-until-confirmed" } });
    state.read.mockImplementation(async table => table === "project_tasks" ? { data: null, error: new Error("Task reload unavailable") } : { data: [], error: null });
    fireEvent.click(screen.getByRole("button", { name: "Reload saved task" }));
    await waitFor(() => expect(screen.getByText("Task reload unavailable")).toBeVisible());
    expect(screen.getByLabelText("HTTPS evidence link")).toHaveValue("https://example.com/retain-until-confirmed");
    state.read.mockImplementation(async table => ({ data: table === "project_tasks" ? [{ ...saved, evidence_url: "https://example.com/confirmed-reload", revision: 8 }] : [], error: null }));
    fireEvent.click(screen.getByRole("button", { name: "Reload saved task" }));
    await waitFor(() => expect(screen.getByLabelText("HTTPS evidence link")).toHaveValue("https://example.com/confirmed-reload"));
    fireEvent.change(screen.getByLabelText("HTTPS evidence link"), { target: { value: "https://example.com/edited-after-reload" } });
    fireEvent.click(screen.getByRole("button", { name: "Save task" }));
    await waitFor(() => expect(state.write).toHaveBeenCalled());
    expect(state.write.mock.calls[0][3]).toEqual({ project_id: projectId, id: taskId, revision: 8 });
  });

  it("serializes same-render saves and keeps the returned revision when the refreshed list is stale", async () => {
    let finish: (result: unknown) => void = () => {};
    state.write.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    workspace();
    const form = screen.getByRole("button", { name: "Save task" }).closest("form")!;
    act(() => { fireEvent.submit(form); fireEvent.submit(form); });
    await waitFor(() => expect(state.write).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText("HTTPS evidence link")).toBeDisabled();
    await act(async () => { finish({ data: { ...saved, revision: 7 }, error: null }); });
    await waitFor(() => expect(screen.getByText("Task saved.")).toBeVisible());
    fireEvent.change(screen.getByLabelText("HTTPS evidence link"), { target: { value: "https://example.com/next-edit" } });
    expect(screen.queryByText("Task saved.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save task" }));
    await waitFor(() => expect(state.write).toHaveBeenCalledTimes(2));
    expect(state.write.mock.calls[1][3]).toEqual({ project_id: projectId, id: taskId, revision: 7 });
  });
});
