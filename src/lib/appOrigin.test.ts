import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getAppOrigin, getAuthCallbackUrl, getResetPasswordUrl, parseAuthHashError } from "@/lib/appOrigin";

describe("appOrigin", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.stubEnv("PROD", false);
    vi.stubEnv("VITE_APP_URL", "");
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
    vi.unstubAllEnvs();
  });

  it("uses browser origin in development", () => {
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, origin: "http://localhost:5173" },
      writable: true,
    });
    expect(getAppOrigin()).toBe("http://localhost:5173");
    expect(getAuthCallbackUrl()).toBe("http://localhost:5173/auth/callback");
    expect(getResetPasswordUrl()).toBe("http://localhost:5173/reset-password");
  });

  it("prefers configured production URL over localhost", () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_APP_URL", "https://finance4all.vercel.app");
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, origin: "http://localhost:4173" },
      writable: true,
    });
    expect(getAppOrigin()).toBe("https://finance4all.vercel.app");
  });

  it("parses OAuth hash errors safely", () => {
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        hash: "#error=access_denied&error_description=User%20cancelled",
      },
      writable: true,
    });
    expect(parseAuthHashError()).toBe("User cancelled");
  });

  it("returns null when hash has no error", () => {
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, hash: "" },
      writable: true,
    });
    expect(parseAuthHashError()).toBeNull();
  });
});
