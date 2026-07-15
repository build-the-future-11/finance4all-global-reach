import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AuthLayout from "@/components/portal/AuthLayout";
import SetupBanner from "@/components/portal/SetupBanner";

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: false,
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    profile: { id: "user-1", role: "member" },
  }),
}));

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("production service messaging", () => {
  it("shows polished account-service unavailable copy on auth screens", () => {
    renderWithProviders(
      <AuthLayout
        title="Welcome back"
        subtitle="Sign in to continue."
        footer={<span>Create an account</span>}
      >
        <button type="button">Sign in</button>
      </AuthLayout>,
    );

    expect(screen.getByText("Account service unavailable")).toBeInTheDocument();
    expect(screen.getByText(/Sign-in is temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText(/Supabase/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/VITE_/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\.env/i)).not.toBeInTheDocument();
  });

  it("does not expose backend setup instructions in the portal banner", () => {
    renderWithProviders(<SetupBanner />);

    expect(screen.getByText("Member services unavailable")).toBeInTheDocument();
    expect(screen.getByText(/cannot reach its account and data services/i)).toBeInTheDocument();
    expect(screen.queryByText(/Supabase/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/VITE_/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/migration/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\.env/i)).not.toBeInTheDocument();
  });
});
