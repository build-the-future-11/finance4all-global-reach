import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "@/components/portal/ProtectedRoute";
import RoleGuard from "@/components/portal/RoleGuard";
import { portalRoutes } from "@/routes/portal";

const authState = vi.hoisted(() => ({
  user: null as unknown,
  profile: null as unknown,
  loading: false,
  needsOnboarding: false,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

function LoginProbe() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "";
  return <div data-testid="login-probe">{from}</div>;
}

function renderProtected(path = "/portal/pathways") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/portal/pathways"
          element={
            <ProtectedRoute>
              <div>protected-content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginProbe />} />
        <Route path="/onboarding" element={<div>onboarding-screen</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("router auth compatibility contract", () => {
  beforeEach(() => {
    authState.user = null;
    authState.profile = null;
    authState.loading = false;
    authState.needsOnboarding = false;
  });

  it("redirects unauthenticated users to login and preserves the attempted path", () => {
    renderProtected();

    expect(screen.getByTestId("login-probe")).toHaveTextContent("/portal/pathways");
    expect(screen.queryByText("protected-content")).not.toBeInTheDocument();
  });

  it("redirects authenticated users who still need onboarding", () => {
    authState.user = { id: "user-1" };
    authState.needsOnboarding = true;

    renderProtected();

    expect(screen.getByText("onboarding-screen")).toBeInTheDocument();
    expect(screen.queryByText("protected-content")).not.toBeInTheDocument();
  });

  it("renders protected content for authenticated, onboarded users", () => {
    authState.user = { id: "user-1" };

    renderProtected();

    expect(screen.getByText("protected-content")).toBeInTheDocument();
  });

  it("keeps role-denied users out of privileged content", () => {
    authState.profile = { role: "member" };

    render(
      <MemoryRouter initialEntries={[portalRoutes.admin]}>
        <Routes>
          <Route
            path={portalRoutes.admin}
            element={
              <RoleGuard allowed={["admin"]}>
                <div>admin-content</div>
              </RoleGuard>
            }
          />
          <Route path={portalRoutes.labs} element={<div>labs-fallback</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("labs-fallback")).toBeInTheDocument();
    expect(screen.queryByText("admin-content")).not.toBeInTheDocument();
  });

  it("allows an approved role to render privileged content", () => {
    authState.profile = { role: "admin" };

    render(
      <MemoryRouter initialEntries={[portalRoutes.admin]}>
        <Routes>
          <Route
            path={portalRoutes.admin}
            element={
              <RoleGuard allowed={["admin"]}>
                <div>admin-content</div>
              </RoleGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("admin-content")).toBeInTheDocument();
  });
});
