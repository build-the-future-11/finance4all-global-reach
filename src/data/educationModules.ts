export type EducationDifficulty = "beginner" | "intermediate" | "advanced";

export interface EducationLesson {
  id: string;
  title: string;
  durationMin: number;
  summary: string;
  objectives: string[];
}

export interface EducationModule {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  difficulty: EducationDifficulty;
  inclusiveNote?: string;
  lessons: EducationLesson[];
}

export const EDUCATION_MODULES: EducationModule[] = [
  {
    id: "catalyst-basics",
    eyebrow: "Catalyst CFEI",
    title: "Financial literacy foundations",
    description:
      "Free, beginner-friendly curriculum designed for high-schoolers and first-gen students — no prior finance background required.",
    difficulty: "beginner",
    inclusiveNote: "Available in plain language with glossary support in every lesson.",
    lessons: [
      {
        id: "budgeting",
        title: "Budgeting & saving",
        durationMin: 20,
        summary: "Build a simple budget, understand needs vs wants, and set your first savings goal.",
        objectives: ["Create a monthly budget", "Define an emergency fund", "Track spending habits"],
      },
      {
        id: "banking",
        title: "Banking & accounts",
        durationMin: 15,
        summary: "Checking, savings, interest, and how to choose accounts that work for you.",
        objectives: ["Compare account types", "Understand APY", "Avoid common fees"],
      },
      {
        id: "investing-101",
        title: "Investing 101",
        durationMin: 25,
        summary: "Stocks, bonds, diversification, and why time in market matters.",
        objectives: ["Define asset classes", "Explain diversification", "Understand risk vs return"],
      },
    ],
  },
  {
    id: "markets-intro",
    eyebrow: "Debriefed Academy",
    title: "Markets & macro essentials",
    description:
      "Connect daily headlines to economic concepts — ideal before joining Meta Labs or the Economics Journal.",
    difficulty: "intermediate",
    lessons: [
      {
        id: "macro-pulse",
        title: "Reading the macro pulse",
        durationMin: 30,
        summary: "GDP, inflation, employment, and how central banks respond.",
        objectives: ["Interpret CPI prints", "Link rates to valuations", "Follow Fed communications"],
      },
      {
        id: "equity-markets",
        title: "How equity markets work",
        durationMin: 25,
        summary: "Exchanges, indices, sectors, and what moves prices day-to-day.",
        objectives: ["Read an index chart", "Map sectors to themes", "Understand earnings season"],
      },
    ],
  },
  {
    id: "research-skills",
    eyebrow: "Atlas Lab prep",
    title: "Student research skills",
    description:
      "Publication-quality habits for Atlas Economics Lab and Meta Labs applications.",
    difficulty: "advanced",
    lessons: [
      {
        id: "hypothesis",
        title: "Forming a research question",
        durationMin: 35,
        summary: "From curiosity to testable hypothesis with credible data sources.",
        objectives: ["Write a research question", "Find primary data", "Cite sources properly"],
      },
      {
        id: "writing",
        title: "Writing for publication",
        durationMin: 40,
        summary: "Structure, clarity, and peer review — the Economics Journal standard.",
        objectives: ["Draft an abstract", "Use charts effectively", "Respond to feedback"],
      },
    ],
  },
];
