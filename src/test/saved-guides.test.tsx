import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSavedExplainers } from "@/hooks/portal/useSavedExplainers";
import { editorialExplainers } from "@/content/editorial";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), getSession: vi.fn(), write: vi.fn() }));
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
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "member-a" }, access_token: "token-member-a" } }, error: null });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "member-a", user_metadata: {} } }, error: null });
    mocks.write.mockImplementation(async (_url, options) => ({ ok: true, json: async () => ({ id: "member-a", user_metadata: JSON.parse(options.body).data }) }));
    vi.stubGlobal("fetch", mocks.write);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("confirms a saved guide from the write response", async () => {
    const { result } = setup();
    await act(async () => { expect(await result.current.toggle.mutateAsync(slug)).toBe(true); });
    expect(JSON.parse(mocks.write.mock.calls[0][1].body)).toEqual({ data: { saved_explainer_slugs: [slug] } });
    await waitFor(() => expect(result.current.slugs).toEqual([slug]));
  });

  it("removes a saved guide using fresh server metadata", async () => {
    const other = editorialExplainers[1].slug;
    mocks.getUser.mockResolvedValue({ data: { user: { id: "member-a", user_metadata: { saved_explainer_slugs: [slug, other] } } }, error: null });
    const { result } = setup();
    await act(async () => { expect(await result.current.toggle.mutateAsync(slug)).toBe(false); });
    expect(JSON.parse(mocks.write.mock.calls[0][1].body)).toEqual({ data: { saved_explainer_slugs: [other] } });
  });

  it("rejects account changes without writing to the new account", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "member-b" } }, error: null });
    const { result } = setup();
    await act(async () => { await expect(result.current.toggle.mutateAsync(slug)).rejects.toThrow(/session changed/i); });
    expect(mocks.write).not.toHaveBeenCalled();
  });

  it("does not report success for an unconfirmed write", async () => {
    mocks.write.mockResolvedValue({ ok: true, json: async () => ({ id: "member-a", user_metadata: {} }) });
    const { result } = setup();
    await act(async () => { await expect(result.current.toggle.mutateAsync(slug)).rejects.toThrow(/could not be confirmed/i); });
  });

  it("pins the original token if the account switches between fresh read and write", async () => {
    const { result } = setup();
    mocks.getUser.mockImplementation(async (token?: string) => {
      if (token) mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "member-b" }, access_token: "token-member-b" } }, error: null });
      return { data: { user: { id: "member-a", user_metadata: {} } }, error: null };
    });
    await act(async () => { await result.current.toggle.mutateAsync(slug); });
    expect(mocks.getUser).toHaveBeenCalledWith("token-member-a");
    expect(mocks.write.mock.calls[0][1].headers.Authorization).toBe("Bearer token-member-a");
  });

  it("rejects a receipt from another account even when its saved list matches", async () => {
    mocks.write.mockImplementation(async (_url, options) => ({ ok: true, json: async () => ({ id: "member-b", user_metadata: JSON.parse(options.body).data }) }));
    const { result } = setup();
    await act(async () => { await expect(result.current.toggle.mutateAsync(slug)).rejects.toThrow(/could not be confirmed/i); });
    expect(result.current.slugs).toEqual([]);
  });
});
