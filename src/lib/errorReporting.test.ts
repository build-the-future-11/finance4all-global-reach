import { describe, expect, it, vi } from "vitest";
import { reportError } from "./errorReporting";

describe("reportError", () => {
  it("logs in development without throwing", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    reportError(new Error("test failure"), { tags: { area: "auth" } });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
