import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import DebriefedLibrary from "@/components/debriefed/DebriefedLibrary";
import DebriefedArticleView from "@/components/debriefed/DebriefedArticleView";
import { articleSections, articleSources, findPublishedDebriefed, publishedDebriefedArticles, searchDebriefed } from "@/content/debriefed";
import { editorialInventory } from "./fixtures/editorial-inventory";
import { parseEditorialDraft } from "@/lib/editorial-import";

vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/lib/supabase", () => ({ supabase: { auth: {} } }));
function mount(element: React.ReactNode, route = "/debriefed") {
  const client = new QueryClient();
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[route]}>{element}</MemoryRouter></QueryClientProvider>);
}

describe("Debriefed publication boundaries", () => {
  it("preserves all eleven inventoried records while exposing only four established public guides", () => {
    expect(editorialInventory).toHaveLength(11);
    expect(editorialInventory.filter(item => item.state === "complete-awaiting-approval")).toHaveLength(6);
    expect(editorialInventory.filter(item => item.state === "editorial-draft")).toHaveLength(1);
    expect(publishedDebriefedArticles).toHaveLength(4);
    expect(findPublishedDebriefed("lower-inflation-does-not-mean-lower-prices")).toBeUndefined();
    expect(findPublishedDebriefed("before-the-backtest-point-in-time-safe-data")).toBeUndefined();
    expect(findPublishedDebriefed("what-is-an-ipo")?.slug).toBe("ipo-from-private-company-to-public-market");
  });
  it("does not invent publication dates or individual authors and includes primary sources", () => {
    for (const article of publishedDebriefedArticles) {
      expect(article.originalPublishedAt).toBeNull();
      expect(article.authorNote).toContain("not recorded");
      expect(article.sources.length).toBeGreaterThan(0);
      expect(article.rights).toContain("No separate reuse licence");
      expect(article.corrections.length).toBeGreaterThan(0);
    }
  });
  it("searches full text, respects topic and sorts deterministically", () => {
    expect(searchDebriefed("greenshoe", "all")[0]?.slug).toContain("ipo");
    expect(searchDebriefed("greenshoe", "Policy")).toHaveLength(0);
    expect(searchDebriefed("", "Financial Systems")[0]?.slug).toContain("upi");
    expect(searchDebriefed("no-matching-string", "all")).toHaveLength(0);
    const results = searchDebriefed("", "all", "shortest");
    expect(results.map(item => item.readMinutes)).toEqual(results.map(item => item.readMinutes).sort((a, b) => a - b));
  });
  it("renders an accessible public library and searches without authenticating", () => {
    mount(<DebriefedLibrary />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search articles" }), { target: { value: "greenshoe" } });
    expect(screen.getByRole("status")).toHaveTextContent("1 guide");
    fireEvent.change(screen.getByRole("combobox", { name: "Topic" }), { target: { value: "Policy" } });
    expect(screen.getByText("No guides match this selection.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByRole("status")).toHaveTextContent("4 guides");
  });
  it("renders complete anonymous article text with matching table-of-contents anchors", () => {
    const article = publishedDebriefedArticles[0];
    const { container } = mount(<DebriefedArticleView article={article} />);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByText(/IPO does not prove that a company is profitable/)).toBeInTheDocument();
    expect(screen.getByText("Sign in to save").closest("a")).toHaveAttribute("href", "/login");
    expect(screen.queryByText("Mark as read")).not.toBeInTheDocument();
    for (const section of article.sections) expect(container.querySelector(`[id="${section.id}"]`)).toHaveTextContent(section.title);
  });
  it("deduplicates sources and rejects unsafe links", () => {
    expect(articleSources("[one](https://example.org) [again](https://example.org) [bad](javascript:alert)")).toHaveLength(1);
    expect(articleSections("# Title\n\n## Same\n\ntext\n\n## Same").map(item => item.id)).toEqual(["section-1", "section-3"]);
  });
});

describe("restricted draft package parser", () => {
  const source = { title: "Example private draft", url: "https://docs.google.com/document/d/example/edit", modifiedAt: "2026-09-19T10:28:23.651Z", content: "DRAFT — NOT PUBLISHED" };
  const draft = { format: "finance-debriefed-draft-v1", state: "editorial-draft", source, claimPack: source, article: { slug: "example-draft", title: "Example draft", summary: "An example educational draft awaiting editorial review.", body: "Draft content. ".repeat(20), difficulty: "beginner", related_terms: [] }, requiredReviews: ["Research and rights review"] };
  it("accepts a restricted review package without turning source access into approval", () => {
    expect(parseEditorialDraft(JSON.stringify(draft)).state).toBe("editorial-draft");
  });
  it("rejects attempts to smuggle publication state or reviewer metadata into content", () => {
    expect(() => parseEditorialDraft(JSON.stringify({ ...draft, state: "published" }))).toThrow();
    expect(() => parseEditorialDraft(JSON.stringify({ ...draft, article: { ...draft.article, publication_state: "published" } }))).toThrow();
    expect(() => parseEditorialDraft(JSON.stringify({ ...draft, publication_reviewed_by: "admin" }))).toThrow();
  });
  it("rejects oversized packages and unsafe source references", () => {
    expect(() => parseEditorialDraft("x".repeat(150001))).toThrow(/150 KB/);
    expect(() => parseEditorialDraft(JSON.stringify({ ...draft, source: { ...source, url: "javascript:alert(1)" } }))).toThrow();
  });
});
