import { describe, expect, it } from "vitest";
import { createAuthHydrationGuard } from "@/lib/authHydrationGuard";

describe("auth hydration generation guard", () => {
  it("accepts only the newest begun auth transition", () => {
    const guard = createAuthHydrationGuard();

    const initial = guard.begin();
    expect(guard.isCurrent(initial)).toBe(true);

    const newer = guard.begin();
    expect(guard.isCurrent(initial)).toBe(false);
    expect(guard.isCurrent(newer)).toBe(true);
  });

  it("invalidates an in-flight hydration during cleanup or sign-out transitions", () => {
    const guard = createAuthHydrationGuard();
    const token = guard.begin();

    guard.invalidate();

    expect(guard.isCurrent(token)).toBe(false);
    expect(guard.snapshot()).toBeGreaterThan(token);
  });

  it("provides a stable snapshot until a newer auth transition begins", () => {
    const guard = createAuthHydrationGuard();
    const token = guard.begin();

    expect(guard.snapshot()).toBe(token);
    expect(guard.isCurrent(guard.snapshot())).toBe(true);

    guard.begin();
    expect(guard.isCurrent(token)).toBe(false);
  });
});
