import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/useAuth";

const mock = vi.hoisted(() => ({ confirmed: false }));
vi.mock("@/lib/supabase", () => ({
  getAuthRedirectUrl: () => "https://example.test/auth/callback",
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: { user: { id: "A", user_metadata: { avatar_url: "https://example.test/avatar.png" } } } }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: () => {
      const chain = {
        select: () => chain, eq: () => chain, update: () => chain,
        maybeSingle: async () => ({ data: { id: "A", display_name: "Member", role: "member", interests: [] }, error: null }),
        single: async () => ({ data: mock.confirmed ? { id: "A", avatar_url: "https://example.test/avatar.png" } : null, error: null }),
      };
      return chain;
    },
  },
}));
function Probe() {
  const { profile } = useAuth();
  return <div>{profile ? `${profile.displayName}:${profile.avatarUrl ?? "no-avatar"}` : "loading"}</div>;
}
it.each([false, true])("only displays persisted synchronization: %s", async (confirmed) => {
  mock.confirmed = confirmed;
  const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    render(<QueryClientProvider client={new QueryClient()}><AuthProvider><Probe /></AuthProvider></QueryClientProvider>);
    await waitFor(() => expect(screen.getByText(confirmed ? "Member:https://example.test/avatar.png" : "Member:no-avatar")).toBeInTheDocument());
    expect(warning).toHaveBeenCalledTimes(confirmed ? 0 : 1);
  } finally { warning.mockRestore(); }
});
