import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PortalLayout from "@/layouts/PortalLayout";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

vi.mock("@/contexts/useAuth", () => ({
  useAuth: () => ({
    profile: {
      displayName: "Ada Member",
      role: "member",
      avatarUrl: "",
    },
    signOut: vi.fn(),
  }),
}));

vi.mock("@/components/ThemeToggle", () => ({ default: () => null }));
vi.mock("@/components/portal/MobileBottomNav", () => ({ default: () => null }));
vi.mock("@/components/portal/NotificationsCenter", () => ({ default: () => null }));
vi.mock("@/components/portal/PortalSearch", () => ({ default: () => null }));

function NetworkPage() {
  useDocumentTitle("Network");
  return <h1>Network</h1>;
}

describe("member portal document titles", () => {
  beforeEach(() => {
    document.title = "Finance for All — Member Space";
    window.localStorage.clear();
  });

  it("keeps the active member page title instead of replacing it with the layout title", async () => {
    render(
      <MemoryRouter initialEntries={["/portal/network"]}>
        <Routes>
          <Route path="/portal" element={<PortalLayout />}>
            <Route path="network" element={<NetworkPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Network · Finance for All");
    });
  });
});
