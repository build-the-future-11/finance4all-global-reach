import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPassword from "@/pages/auth/ForgotPassword";

const authMocks = vi.hoisted(() => ({ resetPasswordForEmail: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  getAuthRedirectUrl: () => "https://finance4all-global-reach.vercel.app/reset-password",
  supabase: { auth: authMocks },
}));

describe("password recovery", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns an account-neutral success message", async () => {
    authMocks.resetPasswordForEmail.mockResolvedValue({ error: null });
    render(<MemoryRouter><ForgotPassword /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: " member@example.com " } });
    fireEvent.click(screen.getByRole("button", { name: "Send recovery link" }));

    expect(await screen.findByRole("status")).toHaveTextContent("If an account exists");
    expect(authMocks.resetPasswordForEmail).toHaveBeenCalledWith("member@example.com", {
      redirectTo: "https://finance4all-global-reach.vercel.app/reset-password",
    });
  });
});
