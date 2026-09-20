import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";

vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: null, loading: false, signIn: vi.fn(), signUp: vi.fn(), signInWithGoogle: vi.fn() }) }));
vi.mock("@/lib/supabase", () => ({ isSupabaseConfigured: false, getPublicAuthSettings: async () => null }));

describe("unconnected authentication preview", () => {
  it("explains why sign-in is unavailable and disables both sign-in actions", () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText("Member access is not connected in this environment.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sign in with email" })).toBeDisabled();
  });

  it("does not offer account creation against an unconfigured backend", () => {
    render(<MemoryRouter><Signup /></MemoryRouter>);
    expect(screen.getByRole("button", { name: "Sign up with Google" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Create account with email" })).toBeDisabled();
  });
});
