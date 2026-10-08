import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Collaboration from "@/pages/portal/Collaboration";

const memberId = "10000000-0000-4000-8000-000000000091";
const projectA = "20000000-0000-4000-8000-000000000091";
const projectB = "20000000-0000-4000-8000-000000000092";
const state = vi.hoisted(() => ({ write: vi.fn() }));

vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: { id: memberId }, profile: { role: "member" } }) }));
vi.mock("@/hooks/portal/useLabs", () => ({ useResearchProjects: () => ({ data: [
  { id: projectA, leadResearcherId: memberId, title: "First project" },
  { id: projectB, leadResearcherId: memberId, title: "Second project" },
], isLoading: false, error: null, refetch: vi.fn() }) }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: (table: string) => {
  let payload: unknown;
  const chain = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    insert: (value: unknown) => { payload = value; return chain; },
    single: () => state.write(table, payload),
    then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve, reject),
  };
  return chain;
} } }));

const clients: QueryClient[] = [];
const saved = { id: "30000000-0000-4000-8000-000000000091", project_id: projectA, revision: 1 };

function workspace() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } } });
  clients.push(client);
  for (const projectId of [projectA, projectB]) {
    client.setQueryData(["project-tasks", memberId, projectId], []);
    client.setQueryData(["project-memberships", memberId, projectId], []);
  }
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={["/portal/collaboration?project=" + projectA]}><Collaboration /></MemoryRouter></QueryClientProvider>);
}

function draft(title = "Audit the baseline", description = "Check timestamps and a frozen split") {
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: title } });
  fireEvent.change(screen.getByLabelText("Description"), { target: { value: description } });
}

function deferCreation() {
  let finish: (result: unknown) => void = () => {};
  state.write.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  return async (error: Error | null = null) => {
    await act(async () => { finish({ data: error ? null : saved, error }); });
  };
}

beforeEach(() => { state.write.mockReset().mockResolvedValue({ data: saved, error: null }); });
afterEach(() => { cleanup(); clients.splice(0).forEach(client => client.clear()); onlineManager.setOnline(true); });

describe("collaboration task creation", () => {
  it("clears an unchanged draft only after the creation is confirmed", async () => {
    const finish = deferCreation();
    workspace(); draft();
    fireEvent.click(screen.getByRole("button", { name: "Create work item" }));
    await waitFor(() => expect(state.write).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText("Title")).toHaveValue("Audit the baseline");
    await finish();
    await waitFor(() => expect(screen.getByText(/Work item created/)).toBeVisible());
    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Description")).toHaveValue("");
    expect(state.write).toHaveBeenCalledWith("project_tasks", expect.objectContaining({ project_id: projectA, title: "Audit the baseline" }));
  });

  it("retains the draft after a failed creation", async () => {
    state.write.mockResolvedValue({ data: null, error: new Error("Task creation unavailable") });
    workspace(); draft();
    fireEvent.click(screen.getByRole("button", { name: "Create work item" }));
    await waitFor(() => expect(screen.getByText("Task creation unavailable")).toBeVisible());
    expect(screen.getByLabelText("Title")).toHaveValue("Audit the baseline");
    expect(screen.getByLabelText("Description")).toHaveValue("Check timestamps and a frozen split");
    expect(screen.queryByText(/Work item created/)).not.toBeInTheDocument();
  });

  it("suppresses duplicate submit events before a pending render", async () => {
    const finish = deferCreation();
    workspace(); draft();
    const form = screen.getByRole("button", { name: "Create work item" }).closest("form")!;
    act(() => { fireEvent.submit(form); fireEvent.submit(form); });
    await waitFor(() => expect(state.write).toHaveBeenCalledTimes(1));
    await finish();
  });

  it("preserves newer title and description edits while an earlier creation finishes", async () => {
    const finish = deferCreation();
    workspace(); draft();
    fireEvent.click(screen.getByRole("button", { name: "Create work item" }));
    await waitFor(() => expect(state.write).toHaveBeenCalledTimes(1));
    draft("Check the second signal", "These are later unsent edits");
    await finish();
    await waitFor(() => expect(screen.getByText(/Work item created/)).toBeVisible());
    expect(screen.getByLabelText("Title")).toHaveValue("Check the second signal");
    expect(screen.getByLabelText("Description")).toHaveValue("These are later unsent edits");
    expect(state.write).toHaveBeenCalledWith("project_tasks", expect.objectContaining({ title: "Audit the baseline", description: "Check timestamps and a frozen split" }));
  });

  it("preserves the complete newer draft when only its scheduling fields change", async () => {
    const finish = deferCreation();
    workspace(); draft();
    fireEvent.click(screen.getByRole("button", { name: "Create work item" }));
    await waitFor(() => expect(state.write).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText("Due date"), { target: { value: "2026-10-20" } });
    fireEvent.change(screen.getByLabelText("Kind"), { target: { value: "milestone" } });
    await finish();
    await waitFor(() => expect(screen.getByText(/Work item created/)).toBeVisible());
    expect(screen.getByLabelText("Title")).toHaveValue("Audit the baseline");
    expect(screen.getByLabelText("Description")).toHaveValue("Check timestamps and a frozen split");
    expect(screen.getByLabelText("Due date")).toHaveValue("2026-10-20");
    expect(screen.getByLabelText("Kind")).toHaveValue("milestone");
  });

  it("does not clear another project's draft or announce the old project's result there", async () => {
    const finish = deferCreation();
    workspace(); draft();
    fireEvent.click(screen.getByRole("button", { name: "Create work item" }));
    await waitFor(() => expect(state.write).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByRole("combobox", { name: "Project" }), { target: { value: projectB } });
    draft("Second project deliverable", "Keep this project-specific work");
    await finish();
    await waitFor(() => expect(screen.getByRole("button", { name: "Create work item" })).not.toBeDisabled());
    expect(screen.getByLabelText("Title")).toHaveValue("Second project deliverable");
    expect(screen.getByLabelText("Description")).toHaveValue("Keep this project-specific work");
    expect(screen.queryByText(/Work item created/)).not.toBeInTheDocument();
    expect(state.write).toHaveBeenCalledWith("project_tasks", expect.objectContaining({ project_id: projectA }));
  });

  it("keeps a late failure scoped to the form that issued the request", async () => {
    const finish = deferCreation();
    workspace(); draft();
    fireEvent.click(screen.getByRole("button", { name: "Create work item" }));
    await waitFor(() => expect(state.write).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByRole("combobox", { name: "Project" }), { target: { value: projectB } });
    draft("Second project deliverable", "Keep this project-specific work");
    await finish(new Error("First project creation unavailable"));
    await waitFor(() => expect(screen.getByRole("button", { name: "Create work item" })).not.toBeDisabled());
    expect(screen.queryByText("First project creation unavailable")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("Second project deliverable");
  });

  it("pins a queued creation to the submitted project across an offline switch", async () => {
    workspace(); draft();
    onlineManager.setOnline(false);
    fireEvent.click(screen.getByRole("button", { name: "Create work item" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Create work item" })).toBeDisabled());
    expect(state.write).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("combobox", { name: "Project" }), { target: { value: projectB } });
    draft("Second project deliverable", "Keep this project-specific work");
    onlineManager.setOnline(true);
    await waitFor(() => expect(state.write).toHaveBeenCalledTimes(1));
    expect(state.write).toHaveBeenCalledWith("project_tasks", expect.objectContaining({ project_id: projectA, title: "Audit the baseline" }));
    expect(screen.getByLabelText("Title")).toHaveValue("Second project deliverable");
    expect(screen.queryByText(/Work item created/)).not.toBeInTheDocument();
  });
});
