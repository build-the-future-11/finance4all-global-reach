import { LESSON_CONTENT } from "@/data/lessonContent";
import { portalRoutes } from "@/routes/portal";
import { sanitizeSearchQuery } from "@/lib/security";

export interface GlossaryResult {
  title: string;
  snippet: string;
  href: string;
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
}

function score(queryTokens: string[], haystack: string): number {
  const lower = haystack.toLowerCase();
  return queryTokens.reduce((acc, t) => acc + (lower.includes(t) ? 1 : 0), 0);
}

export function searchGlossary(
  query: string,
  explainers: { title: string; summary: string; body: string; slug: string }[],
): GlossaryResult[] {
  const cleaned = sanitizeSearchQuery(query);
  const queryTokens = tokenize(cleaned);
  if (queryTokens.length === 0) return [];

  const results: { score: number; result: GlossaryResult }[] = [];

  for (const e of explainers) {
    const text = `${e.title} ${e.summary} ${e.body}`;
    const s = score(queryTokens, text);
    if (s > 0) {
      results.push({
        score: s,
        result: {
          title: e.title,
          snippet: e.summary,
          href: `${portalRoutes.debriefedExplainers}/${e.slug}`,
        },
      });
    }
  }

  for (const [lessonId, content] of Object.entries(LESSON_CONTENT)) {
    const text = `${content.body} ${content.keyTerms.join(" ")}`;
    const s = score(queryTokens, text);
    if (s > 0) {
      results.push({
        score: s,
        result: {
          title: `Lesson: ${lessonId.replace(/-/g, " ")}`,
          snippet: content.body.slice(0, 120).replace(/[#*]/g, "") + "…",
          href: `${portalRoutes.education}/${lessonId}`,
        },
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((r) => r.result);
}
