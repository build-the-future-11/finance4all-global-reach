import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RoleGuard from "@/components/portal/RoleGuard";
import type { UserProfile } from "@/types/domain";

const baseProfile: UserProfile = {
  id: "00000000-0000-4000-8000-000000000001",
  displayName: "Test User",
  email: "test@example.com",
  role: "member",
  interests: [],
  openToCollaborate: false,
  chapterId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/contexts/AuthContext";

describe("RoleGuard", () => {
  it("renders children for allowed roles", () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: { ...baseProfile, role: "admin" },
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter>
        <RoleGuard allowed={["admin"]}>
          <p>Secret admin panel</p>
        </RoleGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText("Secret admin panel")).toBeInTheDocument();
  });

  it("blocks members from admin routes", () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: baseProfile,
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter>
        <RoleGuard allowed={["admin"]}>
          <p>Secret admin panel</p>
        </RoleGuard>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Secret admin panel")).not.toBeInTheDocument();
    expect(screen.getByText(/elevated access/i)).toBeInTheDocument();
  });

  it("allows lead_researcher on lab review routes", () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: { ...baseProfile, role: "lead_researcher" },
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter>
        <RoleGuard allowed={["lead_researcher", "admin"]}>
          <p>Lab review queue</p>
        </RoleGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText("Lab review queue")).toBeInTheDocument();
  });
});
