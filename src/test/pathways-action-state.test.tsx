import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AxiomPathways from "@/pages/portal/pathways/AxiomPathways";
import PathwaysEssays from "@/pages/portal/pathways/PathwaysEssays";

const state = vi.hoisted(() => ({
  items: undefined as Set<string> | undefined,
  isSuccess: false,
  isFetching: false,
  error: null as Error | null,
  mutationPending: false,
  publicationState: "published",
  mutate: vi.fn(),
  refetch: vi.fn(),
  success: vi.fn(),
  failure: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: state.success, error: state.failure } }));
vi.mock("@/hooks/portal/useLabs", () => ({ useProfilesByIds: () => ({ data: {} }) }));
vi.mock("@/hooks/portal/usePathways", () => ({
  useOpportunities: () => ({ data: [{ id: "item-1", title: "Research fellowship", organization: "FinanceMeta", type: "program", description: "Current opportunity", tags: [] }], isLoading: false, error: null }),
  useEssays: () => ({ data: [{ id: "item-1", title: "Research essay", authorId: "author-1", body: "A member essay", upvoteCount: 2, publicationState: state.publicationState }], isLoading: false, error: null }),
  useOpportunityInterests: () => ({ data: state.items, isSuccess: state.isSuccess, isFetching: state.isFetching, error: state.error, refetch: state.refetch }),
  useMyEssayUpvotes: () => ({ data: state.items, isSuccess: state.isSuccess, isFetching: state.isFetching, error: state.error, refetch: state.refetch }),
  useToggleOpportunityInterest: () => ({ mutateAsync: state.mutate, isPending: state.mutationPending }),
  useToggleEssayUpvote: () => ({ mutateAsync: state.mutate, isPending: state.mutationPending }),
  useSubmitEssay: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const cases = [
  { kind: "opportunity", title: "Research fellowship", checking: /Checking saved status/, unavailable: "Saved status unavailable", retry: "Retry saved status", add: "Save", remove: "Saved" },
  { kind: "essay", title: "Research essay", checking: /Checking your vote for Research essay/, unavailable: "Vote unavailable for Research essay", retry: "Retry upvote status", add: "Upvote Research essay", remove: "Remove your upvote for Research essay" },
] as const;
const page = (kind: "opportunity" | "essay") => <MemoryRouter>{kind === "opportunity" ? <AxiomPathways /> : <PathwaysEssays />}</MemoryRouter>;

beforeEach(() => {
  vi.clearAllMocks();
  state.items = undefined;
  state.isSuccess = false;
  state.isFetching = false;
  state.error = null;
  state.mutationPending = false;
  state.publicationState = "published";
  state.mutate.mockResolvedValue(undefined);
  state.refetch.mockResolvedValue({ data: new Set(), error: null });
});
afterEach(cleanup);

describe.each(cases)("$kind action state", ({ kind, title, checking, unavailable, retry, add, remove }) => {
  it("waits for confirmed member state while keeping published content readable", () => {
    render(page(kind));
    expect(screen.getByText(title)).toBeVisible();
    const button = screen.getByRole("button", { name: checking });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(state.mutate).not.toHaveBeenCalled();
  });

  it.each([undefined, new Set(["item-1"])])("shows failed reads with retry without assuming an absent record", items => {
    state.items = items;
    state.error = new Error("Network unavailable");
    render(page(kind));
    expect(screen.getByRole("alert")).toHaveTextContent(/unavailable/i);
    expect(screen.getByRole("button", { name: unavailable })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: retry }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
    expect(state.mutate).not.toHaveBeenCalled();
  });

  it("blocks changes during a refresh even with cached member state", () => {
    state.items = new Set(["item-1"]);
    state.isSuccess = true;
    state.isFetching = true;
    render(page(kind));
    expect(screen.getByRole("button", { name: checking })).toBeDisabled();
    expect(state.mutate).not.toHaveBeenCalled();
  });

  it("uses the recovered saved state to remove rather than reinsert", async () => {
    const view = render(page(kind));
    state.items = new Set(["item-1"]);
    state.isSuccess = true;
    view.rerender(page(kind));
    fireEvent.click(screen.getByRole("button", { name: remove }));
    await waitFor(() => expect(state.mutate).toHaveBeenCalledWith(kind === "opportunity"
      ? { opportunityId: "item-1", interested: false }
      : { essayId: "item-1", upvoted: false }));
  });

  it("allows one mutation for repeated clicks before the UI rerenders", async () => {
    state.items = new Set();
    state.isSuccess = true;
    let resolve!: () => void;
    state.mutate.mockReturnValue(new Promise<void>(done => { resolve = done; }));
    render(page(kind));
    const button = screen.getByRole("button", { name: add });
    act(() => { fireEvent.click(button); fireEvent.click(button); });
    expect(state.mutate).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    expect(state.success).not.toHaveBeenCalled();
    await act(async () => resolve());
  });

  it("waits for refreshed member state after the write completes", async () => {
    state.items = new Set();
    state.isSuccess = true;
    let refreshed!: () => void;
    state.refetch.mockReturnValue(new Promise<void>(done => { refreshed = done; }));
    render(page(kind));
    const button = screen.getByRole("button", { name: add });
    fireEvent.click(button);
    await waitFor(() => expect(state.refetch).toHaveBeenCalledWith({ cancelRefetch: false }));
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(state.mutate).toHaveBeenCalledTimes(1);
    await act(async () => refreshed());
  });

  it("honors the hook's pending state", () => {
    state.items = new Set();
    state.isSuccess = true;
    state.mutationPending = true;
    render(page(kind));
    const button = screen.getByRole("button", { name: kind === "opportunity" ? /Updating saved status/ : /Updating your vote for Research essay/ });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(state.mutate).not.toHaveBeenCalled();
  });

  it("preserves the current action after a failed write and allows an honest retry", async () => {
    state.items = new Set();
    state.isSuccess = true;
    state.mutate.mockRejectedValue(new Error("Write failed"));
    render(page(kind));
    fireEvent.click(screen.getByRole("button", { name: add }));
    await waitFor(() => expect(state.failure).toHaveBeenCalledWith("Write failed"));
    expect(state.success).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: add })).toBeEnabled();
  });
});

it("does not offer new votes for unpublished essays", () => {
  state.items = new Set();
  state.isSuccess = true;
  state.publicationState = "draft";
  render(page("essay"));
  const button = screen.getByRole("button", { name: "Upvote Research essay" });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(state.mutate).not.toHaveBeenCalled();
});

it("still allows a confirmed existing vote to be withdrawn from an archived essay", async () => {
  state.items = new Set(["item-1"]);
  state.isSuccess = true;
  state.publicationState = "archived";
  render(page("essay"));
  fireEvent.click(screen.getByRole("button", { name: "Remove your upvote for Research essay" }));
  await waitFor(() => expect(state.mutate).toHaveBeenCalledExactlyOnceWith({ essayId: "item-1", upvoted: false }));
});
