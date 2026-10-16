import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import Dashboard from "@/pages/portal/Dashboard";
import { publishedDebriefedArticles } from "@/content/debriefed";
import type { ReadingEntry } from "@/hooks/portal/useReadingHistory";

const state = vi.hoisted(() => ({
  query: { data: [], isLoading: false, error: null, refetch: vi.fn() },
  learning: [] as { lesson_id: string; completed: boolean }[],
  entries: [] as ReadingEntry[],
  continueReading: [] as (ReadingEntry & { article: typeof publishedDebriefedArticles[number] })[],
}));
vi.mock("@/contexts/useAuth", () => ({ useAuth: () => ({ user: { id: "member-a" }, profile: { displayName: "Member A", role: "member" } }) }));
vi.mock("@/hooks/portal/useActivityFeed", () => ({ useActivityFeed: () => state.query }));
vi.mock("@/hooks/portal/useDebriefed", () => ({ useNewsArticles: () => state.query }));
vi.mock("@/hooks/portal/useNetwork", () => ({ useConnectionRequests: () => state.query }));
vi.mock("@/hooks/portal/useEvents", () => ({ useEvents: () => state.query }));
vi.mock("@/hooks/portal/useLabs", () => ({ useMyLabApplications: () => state.query, useResearchProjects: () => state.query }));
vi.mock("@/hooks/portal/usePathways", () => ({ useOpportunities: () => state.query }));
vi.mock("@/hooks/portal/useIntake", () => ({ useIntakeSubmissions: () => ({ ...state.query, data: { pages: [] } }) }));
vi.mock("@/hooks/portal/useSavedExplainers", () => ({ useSavedExplainers: () => ({ articles: [] }) }));
vi.mock("@/hooks/portal/useMemberLearning", () => ({ useMemberLearning: () => ({ records: { ...state.query, data: state.learning } }) }));
vi.mock("@/hooks/portal/useReadingHistory", () => ({ useReadingHistory: () => ({ entries: state.entries, continueReading: state.continueReading, error: null }) }));

const article = publishedDebriefedArticles[0];
const entry = { slug: article.slug, section: article.sections[1].id, completed: true, updatedAt: "2026-10-16T00:00:00Z" };
beforeEach(() => { state.learning = []; state.entries = []; state.continueReading = []; });
function renderDashboard() { render(<MemoryRouter><Dashboard /></MemoryRouter>); }

it("counts reader completions and recommends an unread guide", () => {
  state.entries = [entry];
  renderDashboard();
  expect(screen.getByText("Lessons marked read").closest("a")?.querySelector("strong")).toHaveTextContent("1");
  const next = screen.getByRole("region", { name: "Your next move" });
  expect(within(next).getByText(publishedDebriefedArticles[1].title).closest("a")).toHaveAttribute("href", `/portal/debriefed/explainers/${publishedDebriefedArticles[1].slug}`);
  expect(within(next).queryByText(article.title)).not.toBeInTheDocument();
});

it("counts each completed lesson once across notes and reader history", () => {
  state.entries = [entry];
  state.learning = [{ lesson_id: article.slug, completed: true }, { lesson_id: publishedDebriefedArticles[1].slug, completed: true }];
  renderDashboard();
  expect(screen.getByText("Lessons marked read").closest("a")?.querySelector("strong")).toHaveTextContent("2");
  expect(within(screen.getByRole("region", { name: "Your next move" })).getByText(publishedDebriefedArticles[2].title)).toBeVisible();
});

it("resumes at the saved section from the primary dashboard action", () => {
  state.continueReading = [{ ...entry, completed: false, article }];
  renderDashboard();
  const next = screen.getByRole("region", { name: "Your next move" });
  expect(within(next).getByText(article.title).closest("a")).toHaveAttribute("href", `/portal/debriefed/explainers/${article.slug}#${entry.section}`);
});
