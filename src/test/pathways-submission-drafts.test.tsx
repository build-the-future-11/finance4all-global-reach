import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PathwaysEssays from "@/pages/portal/pathways/PathwaysEssays";
import PathwaysStudios from "@/pages/portal/pathways/PathwaysStudios";

const state = vi.hoisted(() => ({
  pending: false,
  mutate: vi.fn(),
  success: vi.fn(),
  failure: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: state.success, error: state.failure } }));
vi.mock("@/hooks/portal/useLabs", () => ({ useProfilesByIds: () => ({ data: {} }) }));
vi.mock("@/hooks/portal/usePathways", () => ({
  useEssays: () => ({ data: [], isLoading: false, error: null }),
  useMyEssayUpvotes: () => ({ data: new Set(), isSuccess: true, isFetching: false, error: null, refetch: vi.fn() }),
  useToggleEssayUpvote: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSubmitEssay: () => ({ mutateAsync: state.mutate, isPending: state.pending }),
  useStudioSubmissions: () => ({ data: [], isLoading: false, error: null }),
  useSubmitStudio: () => ({ mutateAsync: state.mutate, isPending: state.pending }),
}));

const cases = [
  {
    kind: "essay",
    trigger: "Submit essay",
    dialog: "Submit your take",
    fields: { Title: "Original essay", Essay: "Original evidence and reasoning." },
    payload: { title: "Original essay", body: "Original evidence and reasoning." },
  },
  {
    kind: "studio",
    trigger: "Submit project",
    dialog: "Submit to Studios",
    fields: { Title: "Original project", Writeup: "Original project explanation.", "Repo URL (optional)": "https://example.test/repo", "Demo URL (optional)": "https://example.test/demo" },
    payload: { title: "Original project", writeup: "Original project explanation.", repoUrl: "https://example.test/repo", demoUrl: "https://example.test/demo" },
  },
] as const;

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

function openForm(form: typeof cases[number]) {
  render(form.kind === "essay" ? <PathwaysEssays /> : <PathwaysStudios />);
  fireEvent.click(screen.getByRole("button", { name: form.trigger }));
  for (const [label, value] of Object.entries(form.fields)) {
    fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });
  }
  return screen.getByRole("dialog", { name: form.dialog }).querySelector("form")!;
}

beforeEach(() => {
  vi.clearAllMocks();
  state.pending = false;
  state.mutate.mockResolvedValue(undefined);
});
afterEach(cleanup);

describe.each(cases)("$kind submission draft", form => {
  it("submits only once when two submit events arrive before the next render", async () => {
    const saved = deferred();
    state.mutate.mockReturnValue(saved.promise);
    const element = openForm(form);
    act(() => { fireEvent.submit(element); fireEvent.submit(element); });
    expect(state.mutate).toHaveBeenCalledExactlyOnceWith(form.payload);
    expect(screen.getByRole("button", { name: /Saving for review/ })).toBeDisabled();
    await act(async () => saved.resolve());
  });

  it.each(Object.keys(form.fields))("keeps a newer %s edit after the older submission is acknowledged", async label => {
    const saved = deferred();
    state.mutate.mockReturnValue(saved.promise);
    const element = openForm(form);
    fireEvent.submit(element);
    const value = label.includes("URL") ? "https://example.test/newer-unsent" : "Newer unsent edit";
    fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });
    expect(state.mutate).toHaveBeenCalledExactlyOnceWith(form.payload);
    await act(async () => saved.resolve());
    expect(screen.getByRole("dialog", { name: form.dialog })).toBeVisible();
    expect(screen.getByLabelText(label, { exact: true })).toHaveValue(value);
    expect(screen.getByRole("status")).toHaveTextContent(/earlier version.*saved.*newer edits.*not been submitted/i);
    expect(screen.getByRole("button", { name: "Submit for review" })).toBeEnabled();
  });

  it("preserves newer edits through closing and reopening while the original save is pending", async () => {
    const saved = deferred();
    state.mutate.mockReturnValue(saved.promise);
    const element = openForm(form);
    fireEvent.submit(element);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: form.trigger }));
    fireEvent.change(screen.getByLabelText("Title", { exact: true }), { target: { value: "Reopened unsent draft" } });
    await act(async () => saved.resolve());
    expect(screen.getByRole("dialog", { name: form.dialog })).toBeVisible();
    expect(screen.getByLabelText("Title", { exact: true })).toHaveValue("Reopened unsent draft");
    expect(state.mutate).toHaveBeenCalledTimes(1);
  });

  it("closes and clears an unchanged draft only after confirmed success", async () => {
    const saved = deferred();
    state.mutate.mockReturnValue(saved.promise);
    const element = openForm(form);
    fireEvent.submit(element);
    expect(screen.getByRole("dialog", { name: form.dialog })).toBeVisible();
    expect(state.success).not.toHaveBeenCalled();
    await act(async () => saved.resolve());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(state.success).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: form.trigger }));
    for (const label of Object.keys(form.fields)) expect(screen.getByLabelText(label, { exact: true })).toHaveValue("");
  });

  it("sends the preserved newer version only when the member submits it explicitly", async () => {
    const saved = deferred();
    state.mutate.mockReturnValueOnce(saved.promise);
    const element = openForm(form);
    fireEvent.submit(element);
    fireEvent.change(screen.getByLabelText("Title", { exact: true }), { target: { value: "Newer unsent title" } });
    await act(async () => saved.resolve());
    expect(state.mutate).toHaveBeenCalledTimes(1);
    fireEvent.submit(screen.getByRole("dialog", { name: form.dialog }).querySelector("form")!);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(state.mutate).toHaveBeenCalledTimes(2);
    expect(state.mutate).toHaveBeenLastCalledWith({ ...form.payload, title: "Newer unsent title" });
  });

  it("keeps every field after a rejected save and allows a later retry", async () => {
    const saved = deferred();
    state.mutate.mockReturnValueOnce(saved.promise);
    const element = openForm(form);
    fireEvent.submit(element);
    await act(async () => saved.reject(new Error("Saved row could not be confirmed")));
    expect(state.failure).toHaveBeenCalledWith("Saved row could not be confirmed");
    expect(state.success).not.toHaveBeenCalled();
    for (const [label, value] of Object.entries(form.fields)) expect(screen.getByLabelText(label, { exact: true })).toHaveValue(value);
    fireEvent.submit(element);
    await waitFor(() => expect(state.mutate).toHaveBeenCalledTimes(2));
    expect(state.mutate).toHaveBeenLastCalledWith(form.payload);
  });

  it("does not dispatch another submission while the hook already has a pending write", () => {
    state.pending = true;
    const element = openForm(form);
    fireEvent.submit(element);
    expect(state.mutate).not.toHaveBeenCalled();
  });
});
