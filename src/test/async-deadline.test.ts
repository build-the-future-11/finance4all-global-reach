import { afterEach, describe, expect, it, vi } from "vitest";
import { DeadlineExceededError, withDeadline } from "@/lib/asyncDeadline";

afterEach(() => {
  vi.useRealTimers();
});

describe("withDeadline", () => {
  it("returns a fast operation result unchanged", async () => {
    await expect(withDeadline(async () => "ok", 100, "Profile hydration")).resolves.toBe("ok");
  });

  it("fails closed when an operation exceeds its deadline", async () => {
    vi.useFakeTimers();
    const pending = withDeadline(
      () => new Promise<string>(() => undefined),
      25,
      "Profile hydration",
    );
    const expectation = expect(pending).rejects.toEqual(
      new DeadlineExceededError("Profile hydration", 25),
    );

    await vi.advanceTimersByTimeAsync(25);
    await expectation;
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid timeout %s before starting the operation",
    async (timeoutMs) => {
      const operation = vi.fn(async () => "should-not-run");

      await expect(withDeadline(operation, timeoutMs, "Profile hydration")).rejects.toThrow(
        "timeoutMs must be a positive integer",
      );
      expect(operation).not.toHaveBeenCalled();
    },
  );
});
