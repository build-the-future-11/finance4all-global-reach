import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { expect, it } from "vitest";
import { useSelectedRecord } from "@/hooks/useSelectedRecord";

function Probe() {
  const { selectedId, notice } = useSelectedRecord();
  const location = useLocation();
  return <>{notice}<span data-testid="selection">{selectedId ?? "all"}</span><span data-testid="query">{location.search}</span></>;
}
it("opens the selected record and removes only its selection when returning", () => {
  render(<MemoryRouter initialEntries={["/portal/events?selected=record-id&view=list"]}><Probe /></MemoryRouter>);
  expect(screen.getByTestId("selection")).toHaveTextContent("record-id");
  fireEvent.click(screen.getByRole("button", { name: "Show all results" }));
  expect(screen.getByTestId("selection")).toHaveTextContent("all");
  expect(screen.getByTestId("query")).toHaveTextContent("?view=list");
});
it("does not display a selection notice for ordinary list navigation", () => {
  render(<MemoryRouter><Probe /></MemoryRouter>);
  expect(screen.queryByRole("button", { name: "Show all results" })).not.toBeInTheDocument();
});
