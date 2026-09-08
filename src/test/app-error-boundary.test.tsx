import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import AppErrorBoundary from "@/components/AppErrorBoundary";

it("provides a reload path after a render or chunk-load failure", () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  function Broken(): never { throw new Error("Failed to fetch dynamically imported module"); }
  try {
    render(<AppErrorBoundary><Broken /></AppErrorBoundary>);
    expect(screen.getByRole("alert")).toHaveTextContent("This page could not load");
    expect(screen.getByRole("button", { name: "Reload page" })).toBeVisible();
  } finally { error.mockRestore(); }
});
