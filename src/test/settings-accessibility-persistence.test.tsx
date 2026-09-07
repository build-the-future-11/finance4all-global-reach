import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Settings from "@/pages/portal/Settings";

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  signOut: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/contexts/useAuth", () => ({
  useAuth: () => ({
    profile: {
      displayName: "Ada Member",
      bio: "Original bio",
      interests: ["macro"],
      openToCollaborate: false,
      role: "member",
    },
    user: { email: "ada@example.com" },
    signOut: mocks.signOut,
  }),
}));

vi.mock("@/hooks/portal/useEvents", () => ({
  useChapters: () => ({ data: [] }),
}));

vi.mock("@/hooks/portal/useNetwork", () => ({
  useUpdateMyProfile: () => ({ mutateAsync: mocks.mutateAsync, isPending: false }),
}));

vi.mock("sonner", () => ({
  toast: { success: mocks.success, error: mocks.error },
}));

describe("member settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutateAsync.mockResolvedValue({ error: null });
  });

  it("labels profile controls and submits the complete persistence payload", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    const displayName = screen.getByLabelText("Display name");
    const bio = screen.getByLabelText("Bio");
    const collaboration = screen.getByRole("switch", { name: "Open to collaborate" });
    const macro = screen.getByRole("button", { name: "macro" });
    const research = screen.getByRole("button", { name: "research" });

    expect(displayName).toHaveValue("Ada Member");
    expect(bio).toHaveValue("Original bio");
    expect(collaboration).toHaveAccessibleDescription("Shown on your public profile");
    expect(macro).toHaveAttribute("aria-pressed", "true");
    expect(research).toHaveAttribute("aria-pressed", "false");

    fireEvent.change(displayName, { target: { value: "  Ada Updated  " } });
    fireEvent.change(bio, { target: { value: "  Durable profile  " } });
    fireEvent.click(research);
    fireEvent.click(collaboration);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        displayName: "Ada Updated",
        bio: "Durable profile",
        interests: ["macro", "research"],
        openToCollaborate: true,
        chapterId: undefined,
      });
    });
    expect(mocks.success).toHaveBeenCalledWith("Profile updated");
  });
});
