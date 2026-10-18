import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import About from "@/pages/About";
import Ecosystem from "@/pages/Ecosystem";
import { activeProgramSnapshot, collaborationPipeline, ecosystemOverview, operatingPriorities, technicalWork } from "@/content/ecosystem";
import { programs } from "@/content/programs";
import { researchProjects } from "@/content/research";

afterEach(cleanup);

describe("Finance4All and FinanceMeta ecosystem snapshot", () => {
  it("keeps every linked program and research item resolvable", () => {
    for (const item of activeProgramSnapshot.filter(item => item.href?.startsWith("/programs/"))) {
      expect(programs.some(program => `/programs/${program.slug}` === item.href)).toBe(true);
    }
    for (const item of technicalWork.filter(item => item.href?.startsWith("/research/projects/"))) {
      expect(researchProjects.some(project => `/research/projects/${project.slug}` === item.href)).toBe(true);
    }
    expect(programs.some(program => program.slug === "regional-research-networks")).toBe(true);
    expect(researchProjects.some(project => project.slug === "priormoves")).toBe(true);
    expect(researchProjects.some(project => project.slug === "causal-financial-modeling")).toBe(true);
  });

  it("renders the reported scale, programs, pipeline, technical work and outstanding gates", () => {
    render(<MemoryRouter><About /></MemoryRouter>);
    expect(screen.getByText(ecosystemOverview.scaleBoundary)).toBeVisible();
    for (const name of ["IYER Research Journal", "FinanceMeta Grand Research Challenge", "International research networks", "YEFA", "FFI", "YIS / Bay Area Stock Pitch", "PriorMoves", "Causal financial modeling", "Platform deployment", "Partnership confirmation"]) {
      expect(screen.getByRole("heading", { name })).toBeVisible();
    }
    expect(collaborationPipeline.every(item => item.status === "In discussion")).toBe(true);
    expect(operatingPriorities.some(item => item.status === "Outstanding")).toBe(true);
  });

  it("renders a dedicated ecosystem route with status definitions and honest scale context", () => {
    render(<MemoryRouter><Ecosystem /></MemoryRouter>);
    expect(screen.getByRole("heading", { level: 1, name: /One ecosystem/ })).toBeVisible();
    expect(screen.getByText("500+")).toBeVisible();
    expect(screen.getByText(ecosystemOverview.scaleBoundary)).toBeVisible();
    expect(screen.getByRole("heading", { name: "Status is part of the story." })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Models need evidence. Claims need limits." })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Regional interest, turned into accountable work." })).toBeVisible();
    expect(screen.getAllByText("In discussion").length).toBeGreaterThan(1);
    expect(screen.getByRole("link", { name: /Explore the regional network plan/ })).toHaveAttribute("href", "/programs/regional-research-networks");
  });
});
