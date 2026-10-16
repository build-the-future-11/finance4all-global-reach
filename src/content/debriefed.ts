import { editorialExplainers, findEditorialExplainer } from "@/content/editorial";
import { normalizeExternalHttpUrl } from "@/lib/external-url";

export const debriefedTopics = ["Macroeconomics", "Markets", "Companies and IPOs", "Personal Finance", "Financial Systems", "Quantitative Finance", "Policy", "Financial Literacy", "Research Explained"] as const;
export type DebriefedTopic = typeof debriefedTopics[number];
export type EditorialState = "published" | "reviewed-approved" | "complete-awaiting-approval" | "editorial-draft" | "planned" | "archived";

const topics: Record<string, DebriefedTopic[]> = {
  "ipo-from-private-company-to-public-market": ["Companies and IPOs", "Markets", "Financial Literacy"],
  "how-interest-rates-move-through-the-economy": ["Macroeconomics", "Policy", "Personal Finance"],
  "upi-payments-and-the-economics-of-a-network": ["Financial Systems", "Personal Finance", "Financial Literacy"],
  "reading-an-economic-claim-without-getting-fooled": ["Research Explained", "Financial Literacy", "Quantitative Finance"],
};

export function articleSources(body: string) {
  const sources = new Map<string, { label: string; href: string }>();
  for (const match of body.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
    const href = normalizeExternalHttpUrl(match[2]);
    if (href) sources.set(href, { label: match[1], href });
  }
  return [...sources.values()];
}

export function articleSections(body: string) {
  return body.split(/\n\n+/).flatMap((block, index) => {
    const heading = /^## (.+)$/.exec(block.trim());
    return heading ? [{ id: `section-${index}`, title: heading[1] }] : [];
  });
}

export const publishedDebriefedArticles = editorialExplainers.map(article => ({
  ...article,
  publicationState: "published" as const,
  topics: topics[article.slug] ?? ["Financial Literacy" as const],
  sources: articleSources(article.body),
  sections: articleSections(article.body),
  // A source commit is evidence of repository inclusion, not a dated external
  // publication or independent editorial approval. Do not fabricate either.
  originalPublishedAt: null,
  author: "Finance4All editorial library",
  authorNote: "Individual author attribution is not recorded in the source.",
  publicationBasis: "Existing public repository guide; source-reviewed asset under the repository publication policy. Independent editorial certification is not recorded.",
  rights: "Original repository educational text. External references retain their owners' rights. No separate reuse licence is recorded.",
  version: "Repository edition · 0604470",
  corrections: [{ date: "2026-10-16", note: "Added provenance, sources and reading navigation. Repaired source URLs where a current official destination was verified. Explanatory prose is unchanged; no fresh factual review is claimed." }],
}));
export type DebriefedArticle = typeof publishedDebriefedArticles[number];

export function findPublishedDebriefed(slug: string | undefined) {
  const canonical = findEditorialExplainer(slug)?.slug;
  return publishedDebriefedArticles.find(article => article.slug === canonical);
}

export function searchDebriefed(query: string, topic: DebriefedTopic | "all", sort: "title" | "shortest" | "reviewed" = "reviewed") {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return publishedDebriefedArticles.filter(article =>
    (topic === "all" || article.topics.includes(topic)) &&
    terms.every(term => `${article.title} ${article.summary} ${article.relatedTerms.join(" ")} ${article.topics.join(" ")} ${article.body}`.toLocaleLowerCase().includes(term)),
  ).sort((a, b) => sort === "shortest" ? a.readMinutes - b.readMinutes || a.title.localeCompare(b.title) : sort === "title" ? a.title.localeCompare(b.title) : b.reviewedAt.localeCompare(a.reviewedAt) || a.title.localeCompare(b.title));
}
