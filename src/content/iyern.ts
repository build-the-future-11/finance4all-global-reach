/** Public catalog only. Never populate from private member submissions. */
export const researchCategories = [
  { id: "quantitative", title: "Quantitative Finance & Econometrics", description: "Financial modeling, statistical analysis, quantitative investment research, forecasting, risk, and econometric methodology." },
  { id: "policy", title: "Macroeconomics & Public Policy", description: "Monetary policy, fiscal policy, inflation, trade, economic growth, and policy evaluation." },
  { id: "development", title: "Development Economics & Financial Inclusion", description: "Economic inequality, poverty, emerging markets, development policy, financial access, and economic mobility." },
  { id: "behavioral", title: "Behavioral Economics & Decision Science", description: "Behavioral finance, consumer decisions, incentives, experiments, and economic psychology." },
] as const;
export type ResearchCategory = typeof researchCategories[number]["id"];
export interface ResearchPublication {
  slug: string;
  title: string;
  authors: string[];
  abstract: string;
  keywords: string[];
  category: ResearchCategory;
  publishedAt: string;
  version: string;
  kind: "preprint" | "journal";
  status: "Preprint — not peer reviewed" | "Reviewed journal article";
  release: { authorConsent: boolean; rightsCleared: boolean; confidentialityCleared: boolean; moderationApproved: boolean; publicationAuthorized: boolean; reviewCompleted: boolean };
  manuscriptUrl?: string;
  codeUrl?: string;
  dataUrl?: string;
}
// Empty by design: no authorized public papers have been supplied.
export const publications: ResearchPublication[] = [];
export function isPublicPublication(paper: ResearchPublication) {
  const r = paper.release;
  return r.authorConsent && r.rightsCleared && r.confidentialityCleared && r.moderationApproved && r.publicationAuthorized
    && (paper.kind === "preprint" ? paper.status === "Preprint — not peer reviewed" : r.reviewCompleted && paper.status === "Reviewed journal article");
}
export function filterPublications(papers: ResearchPublication[], category: string, query: string) {
  const term = query.trim().toLocaleLowerCase();
  return papers.filter(p => isPublicPublication(p) && (category === "all" || p.category === category)
    && [p.title, ...p.authors, ...p.keywords].join(" ").toLocaleLowerCase().includes(term));
}
