import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import PortalSearch from "@/components/portal/PortalSearch";

const state = vi.hoisted(() => ({ isLoading: true, data: [], error: null as Error | null, refetch: vi.fn() }));
vi.mock("@/hooks/portal/usePortalSearch", () => ({ usePortalSearch: () => state }));
vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: { id: "member-a" } }) }));

function Location() { return <output data-testid="location">{useLocation().pathname}{useLocation().search}</output>; }
beforeEach(() => {
  state.isLoading = true;
  state.error = null;
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
});
afterEach(() => { delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView; });

it("lets a reader use the public catalog while the member search is pending", async () => {
  render(<MemoryRouter><PortalSearch /><Location /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  fireEvent.change(screen.getByRole("combobox", { name: "Search portal" }), { target: { value: "Milan" } });
  const result = await screen.findByText("Milan, Italy");
  expect(screen.getByRole("status")).toHaveTextContent("Searching member records");
  expect(screen.queryByText("No results found.")).not.toBeInTheDocument();
  fireEvent.click(result);
  expect(screen.getByTestId("location")).toHaveTextContent("/chapters?city=milan");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("keeps public matches available after a member search failure", async () => {
  state.isLoading = false;
  state.error = new Error("Network failed");
  render(<MemoryRouter><PortalSearch /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  fireEvent.change(screen.getByRole("combobox", { name: "Search portal" }), { target: { value: "Milan" } });
  expect(await screen.findByText("Milan, Italy")).toBeVisible();
  expect(screen.getByRole("alert")).toHaveTextContent("Member search is unavailable");
  fireEvent.click(screen.getByRole("button", { name: "Retry member search" }));
  expect(state.refetch).toHaveBeenCalled();
});
