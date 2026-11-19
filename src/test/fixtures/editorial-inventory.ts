import { publishedDebriefedArticles, type EditorialState } from "@/content/debriefed";

// Review metadata only. The canonical inventory is in
// docs/FINANCE_DEBRIEFED_CONTENT_INVENTORY.md; no draft belongs in the app bundle.
export const editorialInventory: { title: string; state: EditorialState; source: string }[] = [
  ...publishedDebriefedArticles.map(article => ({ title: article.title, state: article.publicationState, source: "src/content/editorial.ts" })),
  ...["Why lower inflation does not mean lower prices", "Why bond prices fall when yields rise", "How a profitable company can run short of cash", "What a weaker currency changes", "A stock split does not make a company cheaper", "Why a rising stock index is not the whole economy"].map(title => ({ title, state: "complete-awaiting-approval" as const, source: "src/content/editorial-series.ts" })),
  { title: "Before the Backtest: What Makes Historical Market Data Point-in-Time Safe?", state: "editorial-draft", source: "Restricted Google Docs editorial workflow" },
];
