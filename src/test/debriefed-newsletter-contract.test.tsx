import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import DebriefedHub from "@/pages/portal/debriefed/DebriefedHub";

vi.mock("@/hooks/portal/useDebriefed", () => ({
  useNewsArticles: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/portal/useBookmarks", () => ({
  useNewsBookmarks: () => ({ data: new Set<string>() }),
  useToggleNewsBookmark: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

describe("Finance Debriefed newsletter boundary", () => {
  it("does not expose newsletter controls or a dead publication link", () => {
    render(
      <MemoryRouter>
        <DebriefedHub />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/enable weekly email digest/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/substack/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });
});
