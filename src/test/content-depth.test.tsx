import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ChapterMap from "@/components/portal/ChapterMap";
import { applicationPaths, portfolioProjects, programFamilies } from "@/content/catalog";
import { editorialExplainers } from "@/content/editorial";

describe("content depth and claim boundaries", () => {
  it("ships a substantive IPO guide with primary sources and an advice boundary", () => {
    const ipo = editorialExplainers.find((article) => article.slug.includes("ipo"));
    expect(ipo).toBeDefined();
    expect(ipo!.body.split(/\s+/).length).toBeGreaterThanOrEqual(1000);
    expect(ipo!.body).toMatch(/SEC EDGAR/);
    expect(ipo!.body).toMatch(/not a recommendation/i);
  });

  it("keeps each published guide long-form with reading time derived from its body", () => {
    for (const article of editorialExplainers) {
      const words = article.body.trim().split(/\s+/).length;
      expect(words, article.slug).toBeGreaterThanOrEqual(1000);
      expect(words, article.slug).toBeLessThanOrEqual(2000);
      expect(article.readMinutes).toBe(Math.ceil(words / 220));
    }
    expect(new Set(editorialExplainers.map(article => article.slug)).size).toBe(editorialExplainers.length);
  });

  it("uses canonical organization routes instead of fabricated employers", () => {
    expect(applicationPaths.length).toBeGreaterThanOrEqual(6);
    expect(applicationPaths.every((path) => path.href.startsWith("https://tally.so/"))).toBe(true);
    expect(JSON.stringify(applicationPaths)).not.toMatch(/Global Asset Partners|Summer Markets Analyst/);
  });

  it("separates verified repositories, proposals, and coming-soon programs", () => {
    expect(portfolioProjects.some((project) => project.status === "Verified repository" && project.href?.includes("github.com/build-the-future-11"))).toBe(true);
    expect(portfolioProjects.some((project) => project.status === "Proposed" && !project.href)).toBe(true);
    expect(programFamilies.some((program) => program.state === "Coming soon")).toBe(true);
  });
});

describe("chapter map interaction", () => {
  it("selects a real record and exposes synchronized chapter details", () => {
    const onSelect = vi.fn();
    render(<ChapterMap chapters={[{ id: "70000000-0000-4000-8000-000000000099", name: "Test Chapter", city: "Pune", country: "India", latitude: 18.52, longitude: 73.85, memberCount: 3 }]} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "Test Chapter, Pune, India" }));
    expect(onSelect).toHaveBeenCalledWith("70000000-0000-4000-8000-000000000099");
  });
});
