import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ApplicationDraft, { type DraftAnswers } from "@/components/portal/ApplicationDraft";

const state = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn() }));

vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: { id: "member-a" } }) }));
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => {
      let operation = "read";
      let payload: unknown;
      const filters: Record<string, unknown> = {};
      const finish = () => operation === "read" ? state.read() : state.write(operation, payload, filters);
      const chain = {
        select: () => chain,
        eq: (key: string, value: unknown) => { filters[key] = value; return chain; },
        insert: (value: unknown) => { operation = "insert"; payload = value; return chain; },
        update: (value: unknown) => { operation = "update"; payload = value; return chain; },
        delete: () => { operation = "delete"; return chain; },
        single: finish,
        maybeSingle: finish,
      };
      return chain;
    },
  },
}));

const savedAnswers: DraftAnswers = {
  motivation: "My earlier research application answer",
  preparation: "Python and chronological evaluation",
  availability: "Four hours per week, UTC",
  work_url: "https://example.com/research",
};
const emptyAnswers: DraftAnswers = { motivation: "", preparation: "", availability: "", work_url: "" };
const savedDraft = { user_id: "member-a", call_id: "quant-research", ...savedAnswers, revision: 7, updated_at: "2026-10-07T12:00:00Z" };
const clients: QueryClient[] = [];

function draftView(answers = savedAnswers) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } } });
  clients.push(client);
  client.setQueryData(["application-draft", "member-a", "quant-research"], savedDraft);
  const onRestore = vi.fn();
  const page = (current: DraftAnswers) => <QueryClientProvider client={client}><ApplicationDraft callId="quant-research" answers={current} onRestore={onRestore} /></QueryClientProvider>;
  const view = render(page(answers));
  return { client, onRestore, updateAnswers: (current: DraftAnswers) => view.rerender(page(current)) };
}

async function advanceAutosave() {
  await act(async () => { await vi.advanceTimersByTimeAsync(1_100); });
}

beforeEach(() => {
  vi.useFakeTimers();
  state.read.mockReset().mockResolvedValue({ data: savedDraft, error: null });
  state.write.mockReset().mockResolvedValue({ data: { ...savedDraft, revision: 8 }, error: null });
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  cleanup();
  clients.splice(0).forEach(client => client.clear());
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("private application draft persistence", () => {
  it("persists clearing every answer in an existing draft", async () => {
    const view = draftView();
    fireEvent.click(screen.getByRole("button", { name: "Resume saved draft" }));
    view.updateAnswers(emptyAnswers);
    await advanceAutosave();
    expect(state.write).toHaveBeenCalledWith("update", emptyAnswers, { user_id: "member-a", call_id: "quant-research", revision: 7 });
    expect(screen.getByRole("status")).toHaveTextContent("Private draft saved");
  });

  it("removes the stale resume action after confirmed deletion and keeps autosave paused", async () => {
    const view = draftView();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Delete saved draft" })); });
    expect(screen.getByRole("status")).toHaveTextContent("Draft deleted");
    expect(screen.queryByRole("button", { name: "Resume saved draft" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete saved draft" })).not.toBeInTheDocument();
    view.updateAnswers({ ...savedAnswers, motivation: "Answers retained in the form after deletion" });
    await advanceAutosave();
    expect(state.write).toHaveBeenCalledTimes(1);
    expect(view.client.getQueryData(["application-draft", "member-a", "quant-research"])).toBeNull();
  });

  it("does not start a scheduled save while deletion is awaiting confirmation", async () => {
    state.write.mockImplementation((operation: string) => operation === "delete" ? new Promise(() => {}) : Promise.resolve({ data: { ...savedDraft, revision: 8 }, error: null }));
    const view = draftView();
    fireEvent.click(screen.getByRole("button", { name: "Resume saved draft" }));
    view.updateAnswers({ ...savedAnswers, motivation: "Unsaved changes before deleting the stored draft" });
    fireEvent.click(screen.getByRole("button", { name: "Delete saved draft" }));
    await advanceAutosave();
    expect(state.write.mock.calls.map(call => call[0])).toEqual(["delete"]);
    expect(screen.getByRole("button", { name: /Delet(e|ing).*draft/ })).toBeDisabled();
  });

  it("suppresses same-render duplicate deletion requests", () => {
    state.write.mockReturnValue(new Promise(() => {}));
    draftView();
    const button = screen.getByRole("button", { name: "Delete saved draft" });
    act(() => { fireEvent.click(button); fireEvent.click(button); });
    expect(state.write).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
  });

  it("retains the current answers without claiming success after a revision conflict", async () => {
    state.write.mockResolvedValue({ data: null, error: null });
    const view = draftView();
    fireEvent.click(screen.getByRole("button", { name: "Resume saved draft" }));
    view.updateAnswers({ ...savedAnswers, motivation: "This session's unsaved answer" });
    await advanceAutosave();
    expect(screen.getByRole("alert")).toHaveTextContent("Draft changed in another session");
    expect(screen.getByRole("status")).not.toHaveTextContent("Private draft saved");
    expect(view.onRestore).toHaveBeenCalledTimes(1);
    await advanceAutosave();
    expect(state.write).toHaveBeenCalledTimes(1);
  });

  it("keeps the saved draft available when deletion returns no confirmed row", async () => {
    state.write.mockResolvedValue({ data: null, error: null });
    const view = draftView();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Delete saved draft" })); });
    expect(screen.getByRole("alert")).toHaveTextContent("Deletion could not be confirmed");
    expect(screen.getByRole("status")).not.toHaveTextContent("Draft deleted");
    expect(view.client.getQueryData(["application-draft", "member-a", "quant-research"])).toEqual(savedDraft);
  });

  it("reports a rejected deletion without an unhandled rejection or false success", async () => {
    state.write.mockRejectedValue(new Error("Connection failed"));
    draftView();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Delete saved draft" })); });
    expect(screen.getByRole("alert")).toHaveTextContent("Deletion could not be confirmed");
    expect(screen.getByRole("status")).not.toHaveTextContent("Draft deleted");
    expect(screen.getByRole("button", { name: "Delete saved draft" })).toBeEnabled();
  });
});
