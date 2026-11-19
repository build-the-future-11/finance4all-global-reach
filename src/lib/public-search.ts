import { researchProjects } from "@/content/research";
import { programs } from "@/content/programs";
import { publishedDebriefedArticles } from "@/content/debriefed";
import { communityLocations, chapterStatuses } from "@/content/community";
import type { SearchResult } from "@/hooks/portal/usePortalSearch";

export function publicSearch(query: string): SearchResult[] {
  const q = query.trim().toLocaleLowerCase();
  if (q.length < 2 || q.length > 128 || [...q].some(character => character.charCodeAt(0) < 32 || character === "*")) return [];
  const records: (SearchResult & { text: string })[] = [
    ...researchProjects.map(project => ({ id: `research-${project.slug}`, type: "lab" as const, title: project.title, subtitle: project.status, href: `/research/projects/${project.slug}`, text: `${project.abstract} ${project.tags.join(" ")}` })),
    ...programs.map(program => ({ id: `program-${program.slug}`, type: "program" as const, title: program.title, subtitle: `${program.family} · ${program.status}`, href: `/programs/${program.slug}`, text: `${program.summary} ${program.aliases.join(" ")}` })),
    ...publishedDebriefedArticles.map(article => ({ id: `guide-${article.slug}`, type: "explainer" as const, title: article.title, subtitle: `${article.readMinutes} min · Finance Debriefed`, href: `/debriefed/${article.slug}`, text: `${article.summary} ${article.topics.join(" ")} ${article.body}` })),
    ...communityLocations.map(city => ({ id: `city-${city.id}`, type: "chapter" as const, title: `${city.city}, ${city.country}`, subtitle: chapterStatuses[city.status ?? "unverified"], href: `/chapters?city=${encodeURIComponent(city.id)}`, text: city.continent })),
    { id: "five-foundations", type: "resource", title: "Five Foundations", subtitle: "Free financial literacy lesson", href: "/learn/five-foundations", text: "compound interest inflation diversification borrowing APR risk return" },
    { id: "ecosystem", type: "resource", title: "Finance4All & FinanceMeta ecosystem", subtitle: "Programs, research, networks and current status", href: "/ecosystem", text: "Finance4All FinanceMeta IYER journal fellowship research challenge investment model Finance4 Impact Europe Gulf YEFA FFI YIS YEL NSRI PriorMoves FI-JEPA Eigen-JEPA causal modeling" },
  ];
  const terms = q.split(/\s+/);
  return records.filter(record => terms.every(term => `${record.title} ${record.text}`.toLocaleLowerCase().includes(term)))
    .sort((a, b) => searchRank(a, q) - searchRank(b, q) || a.title.localeCompare(b.title))
    .slice(0, 12).map(({ text: _text, ...record }) => record);
}

export function searchRank(item: SearchResult, query: string) {
  const title = item.title.toLocaleLowerCase();
  return title === query ? 0 : title.startsWith(query) ? 1 : 2;
}
