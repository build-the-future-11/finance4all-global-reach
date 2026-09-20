import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSavedExplainers } from "@/hooks/portal/useSavedExplainers";
import { editorialExplainers } from "@/content/editorial";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), updateUser: vi.fn() }));
vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: { id: "member-a", user_metadata: {} } }) }));
vi.mock("@/lib/supabase", () => ({ supabase: { auth: mocks } }));

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return renderHook(() => useSavedExplainers(), { wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
}

describe("saved reading guides", () => {
  const slug = editorialExplainers[0].slug;
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: "member-a", user_metadata: {} } }, error: null });
    mocks.updateUser.mockImplementation(async ({ data }) => ({ data: { user: { user_metadata: data } }, error: null }));
  });

  it("confirms a saved guide from the write response", async () => {
    const { result } = setup();
    await act(async () => { expect(await result.current.toggle.mutateAsync(slug)).toBe(true); });
    expect(mocks.updateUser).toHaveBeenCalledWith({ data: { saved_explainer_slugs: [slug] } });
  });

  it("removes a saved guide using fresh server metadata", async () => {
    const other = editorialExplainers[1].slug;
    mocks.getUser.mockResolvedValue({ data: { user: { id: "member-a", user_metadata: { saved_explainer_slugs: [slug, other] } } }, error: null });
    const { result } = setup();
    await act(async () => { expect(await result.current.toggle.mutateAsync(slug)).toBe(false); });
    expect(mocks.updateUser).toHaveBeenCalledWith({ data: { saved_explainer_slugs: [other] } });
  });

  it("rejects account changes without writing to the new account", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "member-b" } }, error: null });
    const { result } = setup();
    await act(async () => { await expect(result.current.toggle.mutateAsync(slug)).rejects.toThrow(/session changed/i); });
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("does not report success for an unconfirmed write", async () => {
    mocks.updateUser.mockResolvedValue({ data: { user: { user_metadata: {} } }, error: null });
    const { result } = setup();
    await act(async () => { await expect(result.current.toggle.mutateAsync(slug)).rejects.toThrow(/could not be confirmed/i); });
  });
});
