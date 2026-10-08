import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LearningWorkspace from "@/pages/portal/LearningWorkspace";
import { editorialExplainers } from "@/content/editorial";

const state = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn(), userId: "member-a" }));
vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: { id: state.userId } }) }));
vi.mock("@/lib/supabase", () => ({
  supabase: { from: () => {
    let operation = "read";
    let payload: unknown;
    const filters: Record<string, unknown> = {};
    const finish = () => operation === "read" ? state.read() : state.write(operation, payload, filters);
    const chain = {
      select: () => chain,
      eq: (key: string, value: unknown) => { filters[key] = value; return chain; },
      order: finish,
      insert: (value: unknown) => { operation = "insert"; payload = value; return chain; },
      update: (value: unknown) => { operation = "update"; payload = value; return chain; },
      single: finish,
      maybeSingle: finish,
    };
    return chain;
  } },
}));

const lesson = editorialExplainers[0];
const saved = { user_id: "member-a", lesson_id: lesson.slug, completed: false, notes: "Previously saved notes", revision: 4, updated_at: "2026-10-07T12:00:00Z" };
const clients: QueryClient[] = [];

function workspace(withSavedData = true) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } } });
  clients.push(client);
  if (withSavedData) client.setQueryData(["member-learning", "member-a"], [saved]);
  render(<QueryClientProvider client={client}><MemoryRouter><LearningWorkspace /></MemoryRouter></QueryClientProvider>);
  if (withSavedData) fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: lesson.slug } });
  return client;
}

beforeEach(() => {
  state.userId = "member-a";
  state.read.mockReset().mockResolvedValue({ data: [saved], error: null });
  state.write.mockReset().mockResolvedValue({ data: { ...saved, revision: 5 }, error: null });
});
afterEach(() => { cleanup(); clients.splice(0).forEach(client => client.clear()); vi.restoreAllMocks(); });

describe("learning notes persistence", () => {
  it("keeps unsaved notes when switching lessons is cancelled", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    workspace();
    fireEvent.change(screen.getByLabelText("Private notes"), { target: { value: "Keep my unfinished analysis" } });
    fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: editorialExplainers[1].slug } });
    expect(confirm).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Lesson")).toHaveValue(lesson.slug);
    expect(screen.getByLabelText("Private notes")).toHaveValue("Keep my unfinished analysis");
    expect(state.write).not.toHaveBeenCalled();
  });

  it("protects unsaved reading progress when clearing the lesson selection", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    workspace();
    fireEvent.click(screen.getByLabelText("I have read this lesson"));
    fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: "" } });
    expect(confirm).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Lesson")).toHaveValue(lesson.slug);
    expect(screen.getByLabelText("I have read this lesson")).toBeChecked();
  });

  it("discards a lesson draft only after confirming the switch", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    workspace();
    fireEvent.change(screen.getByLabelText("Private notes"), { target: { value: "Draft I choose to discard" } });
    fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: editorialExplainers[1].slug } });
    expect(confirm).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Lesson")).toHaveValue(editorialExplainers[1].slug);
    fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: lesson.slug } });
    expect(confirm).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Private notes")).toHaveValue(saved.notes);
  });

  it("allows a confirmed saved lesson to change without a discard prompt", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    workspace();
    fireEvent.change(screen.getByLabelText("Private notes"), { target: { value: "My confirmed notes" } });
    state.write.mockResolvedValue({ data: { ...saved, notes: "My confirmed notes", revision: 5 }, error: null });
    fireEvent.click(screen.getByRole("button", { name: "Save progress & notes" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Saved to your account"));
    fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: editorialExplainers[1].slug } });
    expect(confirm).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Lesson")).toHaveValue(editorialExplainers[1].slug);
  });

  it("keeps the discard guard after a failed save", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    workspace();
    fireEvent.change(screen.getByLabelText("Private notes"), { target: { value: "Unsaved after network failure" } });
    state.write.mockResolvedValue({ data: null, error: new Error("Offline") });
    fireEvent.click(screen.getByRole("button", { name: "Save progress & notes" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Offline"));
    fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: editorialExplainers[1].slug } });
    expect(confirm).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Private notes")).toHaveValue("Unsaved after network failure");
  });

  it("does not let an earlier reload clear the current lesson's discard guard", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    let finish: (result: unknown) => void = () => {};
    state.read.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    workspace();
    fireEvent.click(screen.getByRole("button", { name: "Reload saved version" }));
    await waitFor(() => expect(state.read).toHaveBeenCalledOnce());
    fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: editorialExplainers[1].slug } });
    fireEvent.change(screen.getByLabelText("Private notes"), { target: { value: "The next lesson's unsaved notes" } });
    await act(async () => { finish({ data: [{ ...saved, revision: 5 }], error: null }); });
    confirm.mockClear().mockReturnValue(false);
    fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: lesson.slug } });
    expect(confirm).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Lesson")).toHaveValue(editorialExplainers[1].slug);
    expect(screen.getByLabelText("Private notes")).toHaveValue("The next lesson's unsaved notes");
  });

  it("keeps the guard when an old reload finishes after returning to the same lesson", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    let finish: (result: unknown) => void = () => {};
    state.read.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    workspace();
    fireEvent.click(screen.getByRole("button", { name: "Reload saved version" }));
    await waitFor(() => expect(state.read).toHaveBeenCalledOnce());
    fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: editorialExplainers[1].slug } });
    fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: lesson.slug } });
    fireEvent.change(screen.getByLabelText("Private notes"), { target: { value: "New draft for the returned lesson" } });
    await act(async () => { finish({ data: [{ ...saved, revision: 5 }], error: null }); });
    confirm.mockClear().mockReturnValue(false);
    fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: editorialExplainers[1].slug } });
    expect(confirm).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Lesson")).toHaveValue(lesson.slug);
    expect(screen.getByLabelText("Private notes")).toHaveValue("New draft for the returned lesson");
  });

  it("protects edits even when the lesson changes before a rerender", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    workspace();
    act(() => {
      fireEvent.change(screen.getByLabelText("Private notes"), { target: { value: "Same-render notes" } });
      fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: editorialExplainers[1].slug } });
    });
    expect(confirm).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Lesson")).toHaveValue(lesson.slug);
    expect(screen.getByLabelText("Private notes")).toHaveValue("Same-render notes");
  });

  it("clears the selection and discard state when the signed-in account changes", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } } });
    clients.push(client);
    client.setQueryData(["member-learning", "member-a"], [saved]);
    client.setQueryData(["member-learning", "member-b"], [{ ...saved, user_id: "member-b", notes: "Other account's saved notes" }]);
    const tree = () => <QueryClientProvider client={client}><MemoryRouter><LearningWorkspace /></MemoryRouter></QueryClientProvider>;
    const view = render(tree());
    fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: lesson.slug } });
    fireEvent.change(screen.getByLabelText("Private notes"), { target: { value: "First account's unsaved notes" } });
    state.userId = "member-b";
    view.rerender(tree());
    expect(screen.getByLabelText("Lesson")).toHaveValue("");
    expect(screen.queryByLabelText("Private notes")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: lesson.slug } });
    expect(screen.getByLabelText("Private notes")).toHaveValue("Other account's saved notes");
    expect(confirm).not.toHaveBeenCalled();
  });

  it("keeps unsaved notes through a refresh failure without overwriting a newer saved revision", async () => {
    const client = workspace();
    fireEvent.change(screen.getByLabelText("Private notes"), { target: { value: "My unsaved evaluation notes" } });
    fireEvent.click(screen.getByLabelText("I have read this lesson"));
    state.read.mockResolvedValue({ data: null, error: new Error("Network offline") });
    await act(async () => { await client.invalidateQueries({ queryKey: ["member-learning", "member-a"] }); });
    await waitFor(() => expect(client.getQueryState(["member-learning", "member-a"])?.status).toBe("error"));
    expect(screen.getByLabelText("Private notes")).toHaveValue("My unsaved evaluation notes");
    expect(screen.getByLabelText("I have read this lesson")).toBeChecked();
    state.read.mockResolvedValue({ data: [{ ...saved, notes: "Another session's notes", revision: 5 }], error: null });
    fireEvent.click(screen.getByRole("button", { name: /Try again|Retry learning refresh/ }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(screen.getByLabelText("Private notes")).toHaveValue("My unsaved evaluation notes");
    expect(state.write).not.toHaveBeenCalled();
    state.write.mockResolvedValue({ data: null, error: null });
    fireEvent.click(screen.getByRole("button", { name: "Save progress & notes" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("changed in another session"));
    expect(state.write).toHaveBeenCalledWith("update", { completed: true, notes: "My unsaved evaluation notes" }, { user_id: "member-a", lesson_id: lesson.slug, revision: 4 });
    expect(screen.getByLabelText("Private notes")).toHaveValue("My unsaved evaluation notes");
    expect(screen.getByRole("status")).not.toHaveTextContent("Saved to your account");
  });

  it("clears the saved acknowledgement when notes change again", async () => {
    workspace();
    fireEvent.click(screen.getByRole("button", { name: "Save progress & notes" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Saved to your account"));
    fireEvent.change(screen.getByLabelText("Private notes"), { target: { value: "A later unsaved edit" } });
    expect(screen.getByRole("status")).not.toHaveTextContent("Saved to your account");
    expect(screen.getByRole("status")).toHaveTextContent("Unsaved changes");
  });

  it("does not replace notes when an explicitly requested reload fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const client = workspace();
    fireEvent.change(screen.getByLabelText("Private notes"), { target: { value: "Keep these notes until reload succeeds" } });
    state.read.mockResolvedValue({ data: null, error: new Error("Reload unavailable") });
    fireEvent.click(screen.getByRole("button", { name: "Reload saved version" }));
    await waitFor(() => expect(client.getQueryState(["member-learning", "member-a"])?.status).toBe("error"));
    expect(screen.getByLabelText("Private notes")).toHaveValue("Keep these notes until reload succeeds");
  });

  it("does not present an initial failed read as an empty learning account", async () => {
    state.read.mockResolvedValue({ data: null, error: new Error("Learning unavailable") });
    workspace(false);
    await waitFor(() => expect(screen.getByText("Learning unavailable")).toBeVisible());
    expect(screen.queryByLabelText("Lesson")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export learning records" })).not.toBeInTheDocument();
  });

  it("suppresses same-render duplicate saves and holds edits until the write is confirmed", async () => {
    let finish: (result: unknown) => void = () => {};
    state.write.mockReturnValue(new Promise(resolve => { finish = resolve; }));
    workspace();
    const button = screen.getByRole("button", { name: "Save progress & notes" });
    act(() => { fireEvent.click(button); fireEvent.click(button); });
    await waitFor(() => expect(state.write).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText("Private notes")).toBeDisabled();
    expect(screen.getByLabelText("I have read this lesson")).toBeDisabled();
    await act(async () => { finish({ data: { ...saved, revision: 5 }, error: null }); });
    await waitFor(() => expect(screen.getByLabelText("Private notes")).toBeEnabled());
    expect(screen.getByRole("status")).toHaveTextContent("Saved to your account");
  });

  it("replaces local edits only after a confirmed successful reload", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    workspace();
    fireEvent.change(screen.getByLabelText("Private notes"), { target: { value: "Edits I chose to discard" } });
    state.read.mockResolvedValue({ data: [{ ...saved, notes: "Confirmed saved version", completed: true, revision: 6 }], error: null });
    fireEvent.click(screen.getByRole("button", { name: "Reload saved version" }));
    await waitFor(() => expect(screen.getByLabelText("Private notes")).toHaveValue("Confirmed saved version"));
    expect(screen.getByLabelText("I have read this lesson")).toBeChecked();
  });

  it("serializes reloads and holds the current editor until the saved read is confirmed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    let finish: (result: unknown) => void = () => {};
    state.read.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    workspace();
    fireEvent.change(screen.getByLabelText("Private notes"), { target: { value: "Edits awaiting a confirmed reload" } });
    const reload = screen.getByRole("button", { name: "Reload saved version" });
    const save = screen.getByRole("button", { name: "Save progress & notes" });
    act(() => { fireEvent.click(reload); fireEvent.click(reload); fireEvent.click(save); });
    await waitFor(() => expect(state.read).toHaveBeenCalledTimes(1));
    expect(state.write).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Private notes")).toBeDisabled();
    expect(screen.getByLabelText("I have read this lesson")).toBeDisabled();
    expect(reload).toBeDisabled();
    expect(save).toBeDisabled();
    expect(screen.getByLabelText("Private notes")).toHaveValue("Edits awaiting a confirmed reload");
    await act(async () => { finish({ data: [{ ...saved, notes: "Fresh saved version", revision: 6 }], error: null }); });
    await waitFor(() => expect(screen.getByLabelText("Private notes")).toBeEnabled());
    expect(screen.getByLabelText("Private notes")).toHaveValue("Fresh saved version");
    fireEvent.click(save);
    await waitFor(() => expect(state.write).toHaveBeenCalledWith("update", { completed: false, notes: "Fresh saved version" }, { user_id: "member-a", lesson_id: lesson.slug, revision: 6 }));
  });

  it("does not let a previous lesson's pending reload discard new lesson notes", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    let finish: (result: unknown) => void = () => {};
    state.read.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    workspace();
    fireEvent.click(screen.getByRole("button", { name: "Reload saved version" }));
    await waitFor(() => expect(state.read).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText("Lesson"), { target: { value: editorialExplainers[1].slug } });
    fireEvent.change(screen.getByLabelText("Private notes"), { target: { value: "New lesson notes, unrelated to the earlier reload" } });
    await act(async () => { finish({ data: [{ ...saved, notes: "Fresh earlier lesson version", revision: 5 }], error: null }); });
    await waitFor(() => expect(screen.getByLabelText("Private notes")).toHaveValue("New lesson notes, unrelated to the earlier reload"));
    expect(screen.getByRole("status")).toHaveTextContent("Unsaved changes");
  });
});
