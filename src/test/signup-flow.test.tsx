import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Signup from "@/pages/auth/Signup";

const authMocks = vi.hoisted(() => ({ signUp: vi.fn(), signInWithGoogle: vi.fn() }));
const settingsMocks = vi.hoisted(() => ({ getPublicAuthSettings: vi.fn() }));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signUp: authMocks.signUp,
    signInWithGoogle: authMocks.signInWithGoogle,
    user: null,
    loading: false,
  }),
}));

vi.mock("@/lib/supabase", () => ({
  getPublicAuthSettings: settingsMocks.getPublicAuthSettings,
}));

describe("member signup flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    settingsMocks.getPublicAuthSettings.mockResolvedValue({
      signupsEnabled: true,
      emailEnabled: true,
      googleEnabled: true,
    });
  });

  it("waits for email confirmation when signup returns no session", async () => {
    authMocks.signUp.mockResolvedValue({ error: null, emailConfirmationRequired: true });
    render(<MemoryRouter><Signup /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "  Ada Student  " } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "  ada@example.com  " } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "a-secure-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account with email" }));

    expect(await screen.findByText(/check your inbox and confirm your email/i)).toBeInTheDocument();
    expect(authMocks.signUp).toHaveBeenCalledWith("ada@example.com", "a-secure-password", "Ada Student");
    expect(screen.getByRole("link", { name: "Go to sign in" })).toHaveAttribute("href", "/login");
  });

  it("fails closed when the provider reports that signup is disabled", async () => {
    settingsMocks.getPublicAuthSettings.mockResolvedValue({
      signupsEnabled: false,
      emailEnabled: true,
      googleEnabled: true,
    });
    render(<MemoryRouter><Signup /></MemoryRouter>);

    expect(await screen.findByRole("alert")).toHaveTextContent(/signup is currently closed/i);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create account with email" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Sign up with Google" })).toBeDisabled();
    });
    expect(authMocks.signUp).not.toHaveBeenCalled();
  });
});
