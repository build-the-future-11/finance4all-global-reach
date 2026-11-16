import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Collaboration from "@/pages/portal/Collaboration";

const leadId = "10000000-0000-4000-8000-000000000091";
const memberA = "10000000-0000-4000-8000-000000000092";
const memberB = "10000000-0000-4000-8000-000000000093";
const projectA = "20000000-0000-4000-8000-000000000091";
const projectB = "20000000-0000-4000-8000-000000000092";
const state = vi.hoisted(() => ({ write: vi.fn() }));

vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: { id: leadId }, profile: { role: "member" } }) }));
vi.mock("@/hooks/portal/useLabs", () => ({ useResearchProjects: () => ({ data: [
  { id: projectA, leadResearcherId: leadId, title: "First project" },
  { id: projectB, leadResearcherId: leadId, title: "Second project" },
], isLoading: false, error: null, refetch: vi.fn() }) }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: (table: string) => {
  let payload: unknown;
  const chain = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    insert: (value: unknown) => { payload = value; return chain; },
    single: () => state.write(table, payload),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve),
  };
  return chain;
} } }));

const clients: QueryClient[] = [];
const saved = { project_id: projectA, user_id: memberA, status: "invited" };
function workspace() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  clients.push(client);
  for (const projectId of [projectA, projectB]) {
    client.setQueryData(["project-tasks", leadId, projectId], []);
    client.setQueryData(["project-memberships", leadId, projectId], []);
  }
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={["/portal/collaboration?project=" + projectA]}><Collaboration /></MemoryRouter></QueryClientProvider>);
}
function enterMember(value = memberA) {
  fireEvent.change(screen.getByLabelText("Member account ID"), { target: { value } });
}
function deferInvitation() {
  let finish: (result: unknown) => void = () => {};
  state.write.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  return async (error: Error | null = null) => { await act(async () => { finish({ data: error ? null : saved, error }); }); };
}

beforeEach(() => { state.write.mockReset().mockResolvedValue({ data: saved, error: null }); });
afterEach(() => { cleanup(); clients.splice(0).forEach(client => client.clear()); });

describe("collaboration invitation feedback", () => {
  it("reports a confirmed invitation in the project that submitted it", async () => {
    workspace(); enterMember();
    fireEvent.click(screen.getByRole("button", { name: "Create invitation" }));
    await waitFor(() => expect(screen.getByText(/Invitation recorded/)).toBeVisible());
    expect(state.write).toHaveBeenCalledWith("project_memberships", { project_id: projectA, user_id: memberA });
    expect(screen.getByLabelText("Member account ID")).toHaveValue("");
  });

  it("retains the draft and reports an unconfirmed invitation in its own form", async () => {
    state.write.mockResolvedValue({ data: null, error: new Error("Invitation unavailable") });
    workspace(); enterMember();
    fireEvent.click(screen.getByRole("button", { name: "Create invitation" }));
    await waitFor(() => expect(screen.getByText("Invitation unavailable")).toBeVisible());
    expect(screen.getByLabelText("Member account ID")).toHaveValue(memberA);
    expect(screen.queryByText(/Invitation recorded/)).not.toBeInTheDocument();
  });

  it("preserves a newer member draft while naming the invitation that was confirmed", async () => {
    const finish = deferInvitation();
    workspace(); enterMember();
    fireEvent.click(screen.getByRole("button", { name: "Create invitation" }));
    await waitFor(() => expect(state.write).toHaveBeenCalledTimes(1));
    enterMember(memberB);
    await finish();
    expect(screen.getByLabelText("Member account ID")).toHaveValue(memberB);
    expect(screen.getByText(/Invitation recorded/)).toHaveTextContent(memberA);
    expect(screen.getByText(/Invitation recorded/)).toHaveTextContent("Your newer edits have not been submitted.");
    expect(state.write).toHaveBeenCalledWith("project_memberships", { project_id: projectA, user_id: memberA });
  });

  it("suppresses duplicate submits before React renders the pending state", async () => {
    const finish = deferInvitation();
    workspace(); enterMember();
    const form = screen.getByRole("button", { name: "Create invitation" }).closest("form")!;
    act(() => { fireEvent.submit(form); fireEvent.submit(form); });
    await waitFor(() => expect(state.write).toHaveBeenCalledTimes(1));
    await finish();
  });

  it("starts a separate member draft when the selected project changes", () => {
    workspace(); enterMember();
    fireEvent.change(screen.getByRole("combobox", { name: "Project" }), { target: { value: projectB } });
    expect(screen.getByLabelText("Member account ID")).toHaveValue("");
  });

  it("keeps an earlier project's success out of the new project's invitation form", async () => {
    const finish = deferInvitation();
    workspace(); enterMember();
    fireEvent.click(screen.getByRole("button", { name: "Create invitation" }));
    await waitFor(() => expect(state.write).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByRole("combobox", { name: "Project" }), { target: { value: projectB } });
    enterMember(memberB);
    await finish();
    expect(screen.queryByText(/Invitation recorded/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Member account ID")).toHaveValue(memberB);
  });

  it("keeps an earlier project's failure out of the new project's invitation form", async () => {
    const finish = deferInvitation();
    workspace(); enterMember();
    fireEvent.click(screen.getByRole("button", { name: "Create invitation" }));
    await waitFor(() => expect(state.write).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByRole("combobox", { name: "Project" }), { target: { value: projectB } });
    enterMember(memberB);
    await finish(new Error("First project invitation unavailable"));
    expect(screen.queryByText("First project invitation unavailable")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Member account ID")).toHaveValue(memberB);
  });
});
