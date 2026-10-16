import fs from "node:fs";
import { researchProjects } from "@/content/research";
import { programs } from "@/content/programs";
import { publishedDebriefedArticles } from "@/content/debriefed";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import PublicLayout from "@/layouts/PublicLayout";
import { publicSearch } from "@/lib/public-search";

describe("public platform discovery", () => {
  it("lists each public detail in the sitemap without member or draft addresses", () => {
    const sitemap = fs.readFileSync("public/sitemap.xml", "utf8");
    for (const [base, records] of [["research/projects", researchProjects], ["programs", programs], ["debriefed", publishedDebriefedArticles]] as const) {
      for (const record of records) expect(sitemap).toContain(`/${base}/${record.slug}</loc>`);
    }
    expect(sitemap).not.toContain("vercel.app/portal");
    expect(sitemap).not.toContain("before-the-backtest");
  });
  it("finds research, programs, source text and city destinations without exposing drafts", () => {
    expect(publicSearch("Eigen-JEPA").some(result => result.href === "/research/projects/eigen-jepa")).toBe(true);
    expect(publicSearch("fellowship").some(result => result.type === "program")).toBe(true);
    expect(publicSearch("Milan").some(result => result.href === "/chapters?city=milan")).toBe(true);
    expect(publicSearch("APR").some(result => result.type === "resource")).toBe(true);
    expect(publicSearch("Before the Backtest")).toEqual([]);
    expect(publicSearch("Why bond prices fall").some(result => result.title === "Why bond prices fall when yields rise")).toBe(false);
    expect(publicSearch("*")).toEqual([]);
  });
  it("provides the complete public navigation and a keyboard-dismissable mobile menu", () => {
    render(<MemoryRouter><PublicLayout title="Programs" description="Find a useful next step."><h1>Programs</h1></PublicLayout></MemoryRouter>);
    const trigger = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toHaveTextContent("Finance Debriefed");
    expect(document.title).toBe("Programs · Finance for All");
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute("content", "Find a useful next step.");
  });
  it("uses the canonical reading URL for legacy article addresses", () => {
    render(<MemoryRouter initialEntries={["/learn/debriefs/example"]}><PublicLayout title="Guide"><h1>Guide</h1></PublicLayout></MemoryRouter>);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "https://finance4all-global-reach.vercel.app/debriefed/example");
  });
});
