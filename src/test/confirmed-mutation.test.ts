import { describe, expect, it } from "vitest";
import { requireConfirmedRow } from "@/lib/confirmed-mutation";

describe("confirmed mutation results", () => {
  it("returns the row only when persistence is confirmed", () => {
    expect(requireConfirmedRow({ data: { id: "row-1" }, error: null }, "Saving the row"))
      .toEqual({ id: "row-1" });
  });

  it("fails when authorization or a race affects zero rows", () => {
    expect(() => requireConfirmedRow({ data: null, error: null }, "Saving the row"))
      .toThrow("Saving the row was not confirmed");
  });

  it("preserves the provider error", () => {
    const error = new Error("permission denied");
    expect(() => requireConfirmedRow({ data: null, error }, "Saving the row"))
      .toThrow(error);
  });
});
