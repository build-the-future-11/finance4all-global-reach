import { act, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/useAuth";

const mock = vi.hoisted(() => ({
  listener: (_event: string, _session: Session | null) => {},
  resolveA: (_value: unknown) => {},
}));
vi.mock("@/lib/supabase", () => ({
  getAuthRedirectUrl: () => "https://example.test/auth/callback",
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (listener: typeof mock.listener) => { mock.listener = listener; return { data: { subscription: { unsubscribe: vi.fn() } } }; },
    },
    from: () => {
      let id = "";
      const chain = {
        select: () => chain,
        eq: (_column: string, value: string) => { id = value; return chain; },
        maybeSingle: () => id === "A" ? new Promise((resolve) => { mock.resolveA = resolve; }) : Promise.resolve({ data: { id, display_name: id, role: "member", interests: [] }, error: null }),
      };
      return chain;
    },
  },
}));

function Probe() {
  const { user, profile } = useAuth();
  return <div>{user?.id ?? "signed-out"}:{profile?.displayName ?? "no-profile"}</div>;
}
function session(id: string) { return { user: { id, user_metadata: {} } } as Session; }

it("clears private query data and ignores a previous member's late profile response", async () => {
  const client = new QueryClient();
  render(<QueryClientProvider client={client}><AuthProvider><Probe /></AuthProvider></QueryClientProvider>);
  await waitFor(() => expect(screen.getByText("signed-out:no-profile")).toBeInTheDocument());
  act(() => mock.listener("SIGNED_IN", session("A")));
  client.setQueryData(["private-bookmarks"], ["A-private"]);
  await act(async () => mock.listener("SIGNED_IN", session("B")));
  await waitFor(() => expect(screen.getByText("B:B")).toBeInTheDocument());
  expect(client.getQueryData(["private-bookmarks"])).toBeUndefined();
  await act(async () => mock.resolveA({ data: { id: "A", display_name: "A", role: "admin", interests: [] }, error: null }));
  expect(screen.getByText("B:B")).toBeInTheDocument();
  client.setQueryData(["private-bookmarks"], ["B-private"]);
  act(() => mock.listener("SIGNED_OUT", null));
  expect(client.getQueryData(["private-bookmarks"])).toBeUndefined();
  expect(screen.getByText("signed-out:no-profile")).toBeInTheDocument();
});
