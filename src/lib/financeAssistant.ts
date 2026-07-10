/** Client-side finance Q&A — matches explainers & education content (no external API required). */

export interface AssistantSource {
  title: string;
  href: string;
}

export interface AssistantReply {
  answer: string;
  sources: AssistantSource[];
  confidence: "high" | "medium" | "low";
}

interface KnowledgeChunk {
  keywords: string[];
  answer: string;
  source: AssistantSource;
}

const BUILTIN_KNOWLEDGE: KnowledgeChunk[] = [
  {
    keywords: ["ipo", "public", "listing", "s-1"],
    answer:
      "An IPO (initial public offering) is when a private company sells shares to the public for the first time. Companies IPO to raise capital, provide liquidity for early investors, and increase visibility. Key steps: hire underwriters, file with regulators, roadshow, set price, list on an exchange.",
    source: { title: "What is an IPO?", href: "/portal/debriefed/explainers/what-is-an-ipo" },
  },
  {
    keywords: ["rate", "fed", "cut", "hike", "inflation", "cpi"],
    answer:
      "Central bank rate decisions flow through borrowing costs, spending, and asset valuations. Rate cuts tend to support rate-sensitive sectors (real estate, growth tech); hikes cool inflation but can pressure valuations via higher discount rates.",
    source: { title: "Why do rate cuts matter?", href: "/portal/debriefed/explainers/rate-cuts-explained" },
  },
  {
    keywords: ["sector", "rotation", "cycle", "defensive"],
    answer:
      "Sector rotation is when capital shifts between industries as the economic cycle evolves. Early cycle often favors financials/industrials; late cycle energy/materials; recessions favor defensives like healthcare and staples.",
    source: { title: "What is sector rotation?", href: "/portal/debriefed/explainers/sector-rotation" },
  },
  {
    keywords: ["budget", "save", "saving", "emergency"],
    answer:
      "Start with a simple monthly budget: income minus fixed costs minus flexible spending. Aim for an emergency fund of 3–6 months of expenses in a liquid savings account before aggressive investing.",
    source: { title: "Catalyst: Budgeting & saving", href: "/portal/education" },
  },
  {
    keywords: ["diversify", "diversification", "portfolio", "risk"],
    answer:
      "Diversification means spreading investments across assets, sectors, and geographies so one bad outcome doesn't sink your whole portfolio. It's one of the few 'free lunches' in finance.",
    source: { title: "Catalyst: Investing 101", href: "/portal/education" },
  },
  {
    keywords: ["apply", "lab", "research", "atlas", "meta labs"],
    answer:
      "Meta Labs projects are open to all members. Complete your profile, browse open projects, and submit a motivation statement. Lead researchers review applications — highlight relevant coursework, skills, and why the topic matters to you.",
    source: { title: "Finance Meta Labs", href: "/portal/labs" },
  },
  {
    keywords: ["internship", "pathway", "opportunity", "career"],
    answer:
      "Axiom Pathways lists internships, fellowships, and project roles. Toggle interest on opportunities, submit essays for the Economics Journal, and join Pathways office hours for resume feedback.",
    source: { title: "Axiom Pathways", href: "/portal/pathways" },
  },
  {
    keywords: ["chapter", "network", "connect", "member"],
    answer:
      "Join a chapter in Settings, browse the Network directory, send connection requests, and post an introduction describing what you're looking for. All members can collaborate regardless of experience level.",
    source: { title: "Member network", href: "/portal/network" },
  },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function scoreMatch(queryTokens: string[], keywords: string[]): number {
  let score = 0;
  for (const token of queryTokens) {
    if (keywords.some((k) => k.includes(token) || token.includes(k))) score += 2;
  }
  return score;
}

export function askFinanceAssistant(
  question: string,
  explainers: { title: string; summary: string; body: string; slug: string }[] = [],
): AssistantReply {
  const q = question.trim();
  if (!q) {
    return {
      answer: "Ask me about IPOs, rates, budgeting, Meta Labs, pathways, or how to use the portal.",
      sources: [],
      confidence: "low",
    };
  }

  const queryTokens = tokenize(q);

  const explainerChunks: KnowledgeChunk[] = explainers.map((e) => ({
    keywords: tokenize(`${e.title} ${e.summary} ${e.body}`),
    answer: e.summary || e.body.slice(0, 400),
    source: { title: e.title, href: `/portal/debriefed/explainers/${e.slug}` },
  }));

  const all = [...BUILTIN_KNOWLEDGE, ...explainerChunks];
  const ranked = all
    .map((chunk) => ({ chunk, score: scoreMatch(queryTokens, chunk.keywords) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    return {
      answer:
        "I don't have a specific match yet. Try browsing Explainers, the Education hub, or ask about IPOs, interest rates, budgeting, labs, or pathways. Our community is inclusive of all experience levels — no question is too basic.",
      sources: [
        { title: "Explainers", href: "/portal/debriefed/explainers" },
        { title: "Education hub", href: "/portal/education" },
        { title: "Resources", href: "/portal/resources" },
      ],
      confidence: "low",
    };
  }

  const best = ranked[0];
  const sources = ranked
    .slice(0, 3)
    .map((r) => r.chunk.source)
    .filter((s, i, arr) => arr.findIndex((x) => x.href === s.href) === i);

  return {
    answer: best.chunk.answer,
    sources,
    confidence: best.score >= 4 ? "high" : best.score >= 2 ? "medium" : "low",
  };
}
