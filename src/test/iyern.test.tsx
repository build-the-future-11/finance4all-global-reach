import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import IYERN from "@/pages/IYERN";
import ApplicationCTA from "@/components/iyern/ApplicationCTA";
import PublicationPreview from "@/components/iyern/PublicationPreview";
import { filterPublications, isPublicPublication, publications, type ResearchPublication } from "@/content/iyern";

beforeAll(() => { Element.prototype.scrollIntoView = vi.fn(); });
afterEach(cleanup);
const fixture: ResearchPublication = {
  slug: "test-only", title: "A test paper", authors: ["Test Author"], abstract: "Test abstract", keywords: ["inflation"], category: "policy", publishedAt: "2026-10-14", version: "1", kind: "preprint", status: "Preprint — not peer reviewed",
  release: { authorConsent: true, rightsCleared: true, confidentialityCleared: true, moderationApproved: true, publicationAuthorized: true, reviewCompleted: false },
};
function portal(path = "/iyern") { return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/iyern/*" element={<IYERN />} /><Route path="/iyern/articles/:slug" element={<IYERN />} /></Routes></MemoryRouter>); }
describe("IYERN public portal", () => {
  it("keeps the archive empty while routing journal and preprint applications separately", () => {
    expect(publications).toEqual([]); portal();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Researching the Economy of Tomorrow");
    expect(screen.getByRole("link", { name: /Explore roles & express interest/ })).toHaveAttribute("href", "https://tally.so/r/kbayyj");
    expect(screen.getByText(/Challenge registration is not open/)).toBeVisible();
    expect(screen.getByText("Preprints are not peer-reviewed journal publications.")).toBeVisible();
    expect(screen.getByRole("link", { name: /Submit for journal screening/ })).toHaveAttribute("href", "https://tally.so/r/kbayyj");
    expect(screen.getByRole("link", { name: /Submit a preprint/ })).toHaveAttribute("href", "https://tally.so/r/RGXXLJ?utm_source=member_portal&utm_medium=website&fm_route=forum&fm_version=conversion-v1");
    expect(screen.getByRole("heading", { name: /FinanceMeta Labs/ })).toBeVisible();
    expect(screen.getByText("First-issue date and manuscript cutoff: not confirmed.")).toBeVisible();
    expect(screen.queryByText(/Mentorship is offered for every submitted paper/)).not.toBeInTheDocument();
  });
  it("restores URL filters, updates them and clears the empty result", () => {
    portal("/iyern/forum?category=policy&q=inflation");
    expect(screen.getByLabelText("Research category")).toHaveValue("policy");
    expect(screen.getByRole("searchbox")).toHaveValue("inflation");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "trade" } });
    expect(screen.getByRole("searchbox")).toHaveValue("trade");
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByLabelText("Research category")).toHaveValue("all");
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });
  it("rejects every missing publication permission and unreviewed journal articles", () => {
    for (const flag of ["authorConsent", "rightsCleared", "confidentialityCleared", "moderationApproved", "publicationAuthorized"] as const) expect(isPublicPublication({ ...fixture, release: { ...fixture.release, [flag]: false } })).toBe(false);
    expect(isPublicPublication({ ...fixture, kind: "journal", status: "Reviewed journal article" })).toBe(false);
    expect(isPublicPublication({ ...fixture, status: "Reviewed journal article" })).toBe(false);
    expect(filterPublications([fixture], "policy", "TEST AUTHOR")).toHaveLength(1);
    expect(filterPublications([fixture], "all", "inflation")).toHaveLength(1);
    expect(filterPublications([fixture], "behavioral", "")).toEqual([]);
  });
  it("renders authorized previews without unsafe resource links", () => {
    render(<MemoryRouter><PublicationPreview paper={{ ...fixture, manuscriptUrl: "javascript:alert(1)", codeUrl: "https://example.org/code" }} /></MemoryRouter>);
    expect(screen.queryByText(/Download manuscript/)).not.toBeInTheDocument();
    expect(screen.getByText(/Supporting code/)).toHaveAttribute("href", "https://example.org/code");
  });
  it("does not expose unavailable articles", () => { portal("/iyern/articles/missing"); expect(screen.getByRole("heading", { name: "Article unavailable" })).toBeVisible(); });
  it("requires a safe approved application URL", () => { render(<ApplicationCTA label="Apply" pending="Pending" approvedUrl="javascript:alert(1)" />); expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled(); });
});
