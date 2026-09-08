import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Onboarding from "@/pages/auth/Onboarding";

const authState = vi.hoisted(() => ({
  profile: {
    displayName: "Ada",
    avatarUrl: "https://example.com/avatar.png",
    interests: [],
    openToCollaborate: false,
  },
  user: { user_metadata: {}, app_metadata: { provider: "email", providers: ["email"] } },
  updateProfile: vi.fn(),
}));

vi.mock("@/contexts/useAuth", () => ({ useAuth: () => authState }));
vi.mock("@/hooks/portal/useEvents", () => ({ useChapters: () => ({ data: [] }) }));

describe("onboarding identity provider label", () => {
  beforeEach(() => {
    authState.user.app_metadata = { provider: "email", providers: ["email"] };
  });

  it("does not infer Google sign-in from an avatar URL", () => {
    render(<MemoryRouter><Onboarding /></MemoryRouter>);
    expect(screen.queryByText("Signed in with Google")).not.toBeInTheDocument();
  });

  it("shows Google context when the authenticated identity lists Google", () => {
    authState.user.app_metadata = { provider: "google", providers: ["google"] };
    render(<MemoryRouter><Onboarding /></MemoryRouter>);
    expect(screen.getByText("Signed in with Google")).toBeInTheDocument();
  });
});
