import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/portal/ProtectedRoute";
import { useAuth } from "@/contexts/useAuth";

const mock = vi.hoisted(() => ({
  failed: true,
  sessionFailed: false,
  listener: (_event: string, _session: Session | null) => {},
}));
vi.mock("@/lib/supabase", () => ({
  getAuthRedirectUrl: () => "https://example.test/auth/callback",
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: { user: { id: "A", user_metadata: {} } } }, error: mock.sessionFailed ? new Error("private service detail") : null }),
      onAuthStateChange: (listener: typeof mock.listener) => { mock.listener = listener; return { data: { subscription: { unsubscribe: vi.fn() } } }; },
    },
    from: () => {
      let id = "A";
      const chain = {
        select: () => chain,
        eq: (_column: string, value: string) => { id = value; return chain; },
        maybeSingle: async () => ({ data: mock.failed ? null : { id, display_name: id, role: "member", interests: [] }, error: mock.failed ? { message: "private service detail" } : null }),
      };
      return chain;
    },
  },
}));
function Probe() {
  const { profile } = useAuth();
  return <p>Workspace for {profile?.displayName}</p>;
}
function mount() {
  return render(<QueryClientProvider client={new QueryClient()}><MemoryRouter initialEntries={["/onboarding"]}><AuthProvider><Routes>
    <Route path="/onboarding" element={<ProtectedRoute><Probe /></ProtectedRoute>} />
    <Route path="/login" element={<p>Login screen</p>} />
  </Routes></AuthProvider></MemoryRouter></QueryClientProvider>);
}
beforeEach(() => { mock.failed = true; mock.sessionFailed = false; vi.spyOn(console, "error").mockImplementation(() => {}); });
afterEach(() => vi.restoreAllMocks());

it("blocks protected content on profile failure and recovers without signing out", async () => {
  mount();
  expect(await screen.findByRole("heading", { name: "Account temporarily unavailable" })).toBeInTheDocument();
  expect(screen.queryByText(/Workspace for/)).not.toBeInTheDocument();
  expect(screen.queryByText("Login screen")).not.toBeInTheDocument();
  expect(screen.getByRole("alert")).not.toHaveTextContent("private service detail");
  mock.failed = false;
  fireEvent.click(screen.getByRole("button", { name: "Retry account loading" }));
  expect(await screen.findByText("Workspace for A")).toBeInTheDocument();
});

it("allows retry after session bootstrap fails instead of claiming the member is signed out", async () => {
  mock.sessionFailed = true;
  mount();
  await screen.findByRole("alert");
  expect(screen.queryByText("Login screen")).not.toBeInTheDocument();
  mock.sessionFailed = false; mock.failed = false;
  fireEvent.click(screen.getByRole("button", { name: "Retry account loading" }));
  expect(await screen.findByText("Workspace for A")).toBeInTheDocument();
});

it("clears a previous member's failure when another member signs in", async () => {
  mount();
  await screen.findByRole("alert");
  mock.failed = false;
  act(() => mock.listener("SIGNED_IN", { user: { id: "B", user_metadata: {} } } as Session));
  await waitFor(() => expect(screen.getByText("Workspace for B")).toBeInTheDocument());
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
