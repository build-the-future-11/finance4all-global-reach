import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "@/components/portal/ProtectedRoute";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/contexts/AuthContext";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route path="/onboarding" element={<p>Onboarding page</p>} />
        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <p>Portal home</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

function LoginState() {
  const location = useLocation();
  return <p>{(location.state as { from?: string } | null)?.from ?? "no destination"}</p>;
}

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to login", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      needsOnboarding: false,
    } as ReturnType<typeof useAuth>);

    renderAt("/portal");
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("preserves query strings and hashes after an auth redirect", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      needsOnboarding: false,
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter initialEntries={["/portal?article=123#saved"]}>
        <Routes>
          <Route path="/login" element={<LoginState />} />
          <Route path="/portal" element={<ProtectedRoute><p>Portal home</p></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("/portal?article=123#saved")).toBeInTheDocument();
  });

  it("shows loading state while session resolves", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      needsOnboarding: false,
    } as ReturnType<typeof useAuth>);

    renderAt("/portal");
    expect(screen.getByText(/Securing your session/i)).toBeInTheDocument();
  });

  it("redirects to onboarding when profile is incomplete", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "u1" },
      profile: { id: "u1", displayName: "Test" },
      loading: false,
      needsOnboarding: true,
    } as ReturnType<typeof useAuth>);

    renderAt("/portal");
    expect(screen.getByText("Onboarding page")).toBeInTheDocument();
  });

  it("renders portal content for authenticated users", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "u1" },
      profile: { id: "u1", displayName: "Test" },
      loading: false,
      needsOnboarding: false,
    } as ReturnType<typeof useAuth>);

    renderAt("/portal");
    expect(screen.getByText("Portal home")).toBeInTheDocument();
  });
});
