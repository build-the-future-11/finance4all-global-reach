import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Research from "@/pages/Research";
import Programs from "@/pages/Programs";
import DebriefedLibrary from "@/components/debriefed/DebriefedLibrary";
import IYERN from "@/pages/IYERN";

vi.mock("@/hooks/portal/useReadingHistory", () => ({ useReadingHistory: () => ({ continueReading: [] }) }));
vi.mock("@/hooks/portal/useSavedExplainers", () => ({ useSavedExplainers: () => ({ user: null, slugs: [] }) }));

afterEach(cleanup);

function NavigationProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return <><div aria-label="Current query">{location.search}</div>
    <Link to="/research?q=risk&topic=financial-ml">Open another research filter</Link>
    <button onClick={() => navigate(-1)}>Back</button>
    <button onClick={() => navigate(1)}>Forward</button></>;
}

function show(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><NavigationProbe /><Routes>
    <Route path="/research" element={<Research />} />
    <Route path="/programs" element={<Programs />} />
    <Route path="/debriefed" element={<DebriefedLibrary showHero={false} />} />
    <Route path="/iyern" element={<IYERN />} />
  </Routes></MemoryRouter>);
}

function query() { return new URLSearchParams(screen.getByLabelText("Current query").textContent ?? ""); }

describe("catalog query updates before a navigation commits", () => {
  it("retains research search, topic and status changed in one batch", () => {
    show("/research?campaign=existing");
    act(() => {
      fireEvent.change(screen.getByLabelText("Search research"), { target: { value: "covariance" } });
      fireEvent.change(screen.getByLabelText("Research topic"), { target: { value: "financial-ml" } });
      fireEvent.change(screen.getByLabelText("Evidence status"), { target: { value: "Repository available" } });
    });
    expect(Object.fromEntries(query())).toEqual({ campaign: "existing", q: "covariance", topic: "financial-ml", status: "Repository available" });
    expect(screen.getByLabelText("Search research")).toHaveValue("covariance");
    expect(screen.getByLabelText("Research topic")).toHaveValue("financial-ml");
    expect(screen.getByRole("status")).toHaveTextContent("1 record found");
  });

  it("retains program query, family and status changed in one batch", () => {
    show("/programs");
    act(() => {
      fireEvent.change(screen.getByLabelText("Search programs"), { target: { value: "investment" } });
      fireEvent.change(screen.getByLabelText("Program family"), { target: { value: "Research" } });
      fireEvent.change(screen.getByLabelText("Program status"), { target: { value: "On hold" } });
    });
    expect(Object.fromEntries(query())).toEqual({ q: "investment", family: "Research", status: "On hold" });
    expect(screen.getByLabelText("Search programs")).toHaveValue("investment");
    expect(screen.getByLabelText("Program family")).toHaveValue("Research");
  });

  it("retains article search when sorting changes before navigation commits", () => {
    show("/debriefed");
    act(() => {
      fireEvent.change(screen.getByLabelText("Search articles"), { target: { value: "inflation" } });
      fireEvent.change(screen.getByLabelText("Sort by"), { target: { value: "title" } });
    });
    expect(Object.fromEntries(query())).toEqual({ q: "inflation", sort: "title" });
    expect(screen.getByLabelText("Search articles")).toHaveValue("inflation");
  });

  it("retains preprint query and category changed in one batch", () => {
    show("/iyern");
    act(() => {
      fireEvent.change(screen.getByRole("searchbox"), { target: { value: "inflation" } });
      fireEvent.change(screen.getByLabelText("Research category"), { target: { value: "policy" } });
    });
    expect(Object.fromEntries(query())).toEqual({ q: "inflation", category: "policy" });
    expect(screen.getByRole("searchbox")).toHaveValue("inflation");
  });

  it("uses the latest back/forward location for subsequent changes", () => {
    show("/research?q=covariance");
    fireEvent.click(screen.getByRole("link", { name: "Open another research filter" }));
    expect(screen.getByLabelText("Search research")).toHaveValue("risk");
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Search research")).toHaveValue("covariance");
    fireEvent.click(screen.getByRole("button", { name: "Forward" }));
    act(() => {
      fireEvent.change(screen.getByLabelText("Evidence status"), { target: { value: "Repository available" } });
      fireEvent.change(screen.getByLabelText("Sort research"), { target: { value: "title" } });
    });
    expect(Object.fromEntries(query())).toEqual({ q: "risk", topic: "financial-ml", status: "Repository available", sort: "title" });
  });

  it("does not resurrect cleared filters when another control changes immediately", () => {
    show("/research?q=covariance&topic=financial-ml&status=Repository+available");
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Clear research filters" }));
      fireEvent.change(screen.getByLabelText("Sort research"), { target: { value: "title" } });
    });
    expect(Object.fromEntries(query())).toEqual({ sort: "title" });
    expect(screen.getByLabelText("Search research")).toHaveValue("");
    expect(screen.getByLabelText("Research topic")).toHaveValue("all");
  });
});
