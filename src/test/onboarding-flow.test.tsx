import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Onboarding from "@/pages/auth/Onboarding";

const mocks = vi.hoisted(() => ({ updateProfile: vi.fn(), updateUser: vi.fn(), navigate: vi.fn() }));
vi.mock("@/contexts/useAuth", () => ({
  useAuth: () => ({ profile: { displayName: "Ada", bio: "", interests: [] }, user: { user_metadata: {} }, updateProfile: mocks.updateProfile }),
}));
vi.mock("@/hooks/portal/useEvents", () => ({ useChapters: () => ({ data: [] }) }));
vi.mock("@/lib/supabase", () => ({ isSupabaseConfigured: true, supabase: { auth: { updateUser: mocks.updateUser } } }));
vi.mock("react-router-dom", async importOriginal => ({
  ...await importOriginal<typeof import("react-router-dom")>(), useNavigate: () => mocks.navigate,
}));

function completeEducation() {
  fireEvent.change(screen.getByLabelText("School, university, or learning community"), { target: { value: " Example School " } });
  fireEvent.change(screen.getByLabelText("Age group"), { target: { value: "Prefer not to say" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

describe("two-stage member onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    mocks.updateProfile.mockResolvedValue({ error: null });
    mocks.updateUser.mockResolvedValue({ data: { user: { user_metadata: { onboarding_version: 1 } } }, error: null });
  });

  it("saves education privately and verifies completion before opening the portal", async () => {
    window.sessionStorage.setItem("financemeta.postAuthPath", "/portal/pathways?track=research");
    render(<MemoryRouter><Onboarding /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "A little about you" })).toBeInTheDocument();
    completeEducation();
    expect(mocks.updateProfile).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Bio"), { target: { value: "Interested in economics." } });
    fireEvent.click(screen.getByRole("button", { name: "research" }));
    fireEvent.click(screen.getByRole("button", { name: "Enter portal" }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/portal/pathways?track=research", { replace: true }));
    expect(mocks.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ bio: "Interested in economics.", interests: ["research"] }));
    expect(mocks.updateProfile.mock.calls[0][0]).not.toHaveProperty("school");
    expect(mocks.updateProfile.mock.calls[0][0]).not.toHaveProperty("age_band");
    expect(mocks.updateUser).toHaveBeenCalledWith({ data: { school: "Example School", age_band: "Prefer not to say", onboarding_version: 1 } });
  });

  it("preserves entered education when moving back without saving early", () => {
    render(<MemoryRouter><Onboarding /></MemoryRouter>);
    completeEducation();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("School, university, or learning community")).toHaveValue(" Example School ");
    expect(screen.getByLabelText("Age group")).toHaveValue("Prefer not to say");
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("does not mark setup complete if the public profile fails to save", async () => {
    mocks.updateProfile.mockResolvedValue({ error: "Profile could not be saved" });
    render(<MemoryRouter><Onboarding /></MemoryRouter>);
    completeEducation();
    fireEvent.click(screen.getByRole("button", { name: "Enter portal" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Profile could not be saved");
    expect(mocks.updateUser).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("keeps the member on setup when private details are not confirmed", async () => {
    mocks.updateUser.mockResolvedValue({ data: { user: { user_metadata: {} } }, error: null });
    render(<MemoryRouter><Onboarding /></MemoryRouter>);
    completeEducation();
    fireEvent.click(screen.getByRole("button", { name: "Enter portal" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not confirm/i);
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Enter portal" })).toBeEnabled();
  });
});
