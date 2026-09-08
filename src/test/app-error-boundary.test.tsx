import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AppErrorBoundary from "@/components/AppErrorBoundary";

function BrokenView(): never {
  throw new Error("private provider detail");
}

describe("application render error boundary", () => {
  it("shows an actionable fallback without exposing the underlying error", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const preventJsdomError = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener("error", preventJsdomError);

    try {
      render(
        <AppErrorBoundary>
          <BrokenView />
        </AppErrorBoundary>,
      );

      expect(screen.getByRole("alert")).toHaveTextContent("This page could not load");
      expect(screen.getByRole("button", { name: "Reload page" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute("href", "/");
      expect(screen.queryByText("private provider detail")).not.toBeInTheDocument();
      expect(consoleError).toHaveBeenCalled();
    } finally {
      window.removeEventListener("error", preventJsdomError);
      consoleError.mockRestore();
    }
  });
});
