import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import Research from "@/pages/Research";
import Programs from "@/pages/Programs";
import { filterResearch, researchProjects, researchTopics } from "@/content/research";
import { filterPrograms, getProgramAction, programs, type Program } from "@/content/programs";
import { publications, researchCategories } from "@/content/iyern";

afterEach(cleanup);
function show(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/research" element={<Research />} /><Route path="/research/projects/:slug" element={<Research />} /><Route path="/programs" element={<Programs />} /><Route path="/programs/:slug" element={<Programs />} /><Route path="/portal/programs" element={<Programs embedded />} /></Routes></MemoryRouter>);
}
describe("evidence-aware research directory", () => {
  it("maps discovery topics to existing publication categories without promoting research records to papers", () => {
    expect(new Set(researchTopics.map(t => t.id)).size).toBe(10);
    for (const topic of researchTopics) expect(researchCategories.some(c => c.id === topic.publicationCategory)).toBe(true);
    expect(publications).toEqual([]);
    const baseline = researchProjects.find(p => p.slug === "fi-jepa")!;
    expect(baseline.status).toBe("Engineering baseline");
    expect(baseline.findings).toMatch(/No real-market alpha/);
    expect(researchProjects.find(p => p.slug === "eigenfinance")!.sourceDate).toBe("2026-09-20");
    expect(researchProjects.find(p => p.slug === "eigenfinance")!.sourceNote).toMatch(/remote read failed/);
  });
  it("combines topic, status and case-insensitive query with stable sorting", () => {
    expect(filterResearch(researchProjects, "  COVARIANCE ", "financial-ml", "Repository available").map(p => p.slug)).toEqual(["eigen-jepa"]);
    expect(filterResearch(researchProjects, "covariance", "inclusion")).toEqual([]);
    const sorted = filterResearch(researchProjects, "", "all", "all", "title");
    expect(sorted.map(p => p.title)).toEqual([...sorted.map(p => p.title)].sort((a, b) => a.localeCompare(b)));
    expect(new Set(researchProjects.map(p => p.slug)).size).toBe(researchProjects.length);
    for (const project of researchProjects) expect(programs.some(p => p.slug === project.program)).toBe(true);
  });
  it("restores URL filters and clears an empty result", () => {
    show("/research?topic=inclusion&q=covariance&status=Repository%20available");
    expect(screen.getByLabelText("Research topic")).toHaveValue("inclusion");
    expect(screen.getByLabelText("Search research")).toHaveValue("covariance");
    expect(screen.getByRole("heading", { name: "No research matches these filters" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Clear research filters" }));
    expect(screen.getByLabelText("Research topic")).toHaveValue("all");
    expect(screen.getByRole("status")).toHaveTextContent(`${researchProjects.length} records found`);
  });
  it("renders the question, provenance, controls and limitations on a genuine detail route", () => {
    show("/research/projects/fi-jepa");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("FI-JEPA");
    for (const name of ["Data & provenance", "Baselines & evaluation", "Leakage & falsification controls", "Publication status"]) expect(screen.getByRole("heading", { name })).toBeVisible();
    expect(screen.getByText(/No real-market alpha, superiority/)).toBeVisible();
    expect(screen.getByRole("link", { name: /Source repository/ })).toHaveAttribute("href", "https://github.com/Finance-Meta-Research/FI-JEPA");
  });
  it("does not invent a project for an unknown route", () => { show("/research/projects/missing"); expect(screen.getByRole("heading", { name: "Research record unavailable" })).toBeVisible(); });
});

describe("program lifecycle and verified actions", () => {
  it("consolidates synonymous offerings while keeping each research link resolvable", () => {
    expect(new Set(programs.map(p => p.slug)).size).toBe(programs.length);
    expect(filterPrograms(programs, "Affiliate Clubs").map(p => p.slug)).toEqual(["chapters"]);
    expect(filterPrograms(programs, "Point-in-Time Market Data Integrity Toolkit").map(p => p.slug)).toEqual(["fintech-studio"]);
    for (const program of programs) for (const id of program.research) expect(researchProjects.some(p => p.slug === id)).toBe(true);
  });
  it("advertises interest only for held challenges, and never links dedicated draft forms", () => {
    for (const program of programs.filter(p => p.status === "On hold")) expect(getProgramAction(program)?.kind).toBe("interest");
    const publicActions = programs.map(p => getProgramAction(p)?.href).filter(Boolean).join(" ");
    for (const id of ["GxN8Vz", "Ek4aR4", "Qo22xp", "e5ZZNO", "WJ99ea", "6DJJ1B", "bZVV2o", "xXOMYo"]) expect(publicActions).not.toContain(id);
    expect(getProgramAction(programs.find(p => p.slug === "iyer-journal")!)?.kind).toBe("screening");
  });
  it("fails closed for unverified, unsafe or lifecycle-incompatible actions", () => {
    const program = programs.find(p => p.slug === "investment-model-challenge")!;
    const invalid = (overrides: Partial<NonNullable<Program["action"]>>) => ({ ...program, action: { ...program.action!, ...overrides } });
    expect(getProgramAction(invalid({ kind: "application" }))).toBeUndefined();
    expect(getProgramAction(invalid({ available: false }))).toBeUndefined();
    expect(getProgramAction(invalid({ verifiedAt: "" }))).toBeUndefined();
    expect(getProgramAction(invalid({ href: "javascript:alert(1)" }))).toBeUndefined();
    expect(getProgramAction(invalid({ href: "//outside.example" }))).toBeUndefined();
    expect(getProgramAction(invalid({ href: "https://tally.so.evil.example/r/kbayyj" }))).toBeUndefined();
  });
  it("supports accessible filters and an informative held-program detail", () => {
    show("/programs?status=On%20hold&q=Investment");
    expect(screen.getByLabelText("Program status")).toHaveValue("On hold");
    expect(screen.getByRole("status")).toHaveTextContent("1 program found");
    expect(screen.getByRole("link", { name: "Global Investment Model Challenge 2026" })).toHaveAttribute("href", "/programs/investment-model-challenge");
    cleanup();
    show("/programs/investment-model-challenge");
    expect(screen.getByText(/Submission form remains a draft/)).toBeVisible();
    expect(screen.getByRole("link", { name: /Request rules and launch updates/ })).toHaveAttribute("href", "https://tally.so/r/kbayyj");
    expect(screen.getByText(/does not accept an entry/)).toBeVisible();
    expect(screen.getByText("Not announced")).toBeVisible();
  });
  it("does not claim journal publication or a confirmed December deadline", () => {
    show("/programs/iyer-journal");
    expect(screen.getByText(/December 1, 2026 is an unresolved planning milestone/)).toBeVisible();
    expect(screen.getByText(/Submission is not publication or acceptance/)).toBeVisible();
  });
  it("renders an embedded member directory without a duplicate public navigation", () => {
    const { container } = show("/portal/programs");
    expect(within(container).queryByRole("navigation", { name: "Public navigation" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("A useful next step");
  });
  it("handles an unavailable program without a fabricated intake", () => { show("/programs/missing"); expect(screen.getByRole("heading", { name: "Program unavailable" })).toBeVisible(); });
});
