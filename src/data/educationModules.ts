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
    eyebrow: "Module 1",
    title: "Financial literacy foundations",
    description:
      "Budgeting, banking, and investing basics — the same material chapter volunteers teach in 90-minute outreach sessions.",
    difficulty: "beginner",
    inclusiveNote: "Plain-language lessons with a glossary in every exercise. No prior finance class required.",
    lessons: [
      {
        id: "budgeting",
        title: "Budgeting & saving",
        durationMin: 20,
        summary: "Build a monthly budget, separate needs from wants, and set a first savings target.",
        objectives: ["Create a monthly budget", "Define an emergency fund", "Track spending for one week"],
      },
      {
        id: "banking",
        title: "Banking & accounts",
        durationMin: 15,
        summary: "Checking vs savings, how APY works, and fees to watch for on student accounts.",
        objectives: ["Compare account types", "Read an APY quote", "Identify one avoidable fee"],
      },
      {
        id: "investing-101",
        title: "Investing 101",
        durationMin: 25,
        summary: "Stocks, bonds, diversification, and why time horizon changes how much risk makes sense.",
        objectives: ["Name three asset classes", "Explain diversification in one sentence", "Match risk to a time horizon"],
      },
    ],
  },
  {
    id: "markets-intro",
    eyebrow: "Module 2",
    title: "Markets & macro essentials",
    description:
      "Read GDP, inflation, and employment data — then connect headlines on Debriefed to what moved in markets.",
    difficulty: "intermediate",
    lessons: [
      {
        id: "macro-pulse",
        title: "Reading the macro pulse",
        durationMin: 30,
        summary: "GDP, CPI, jobs data, and how central banks change rates in response.",
        objectives: ["Interpret a CPI headline", "Link rate moves to bond yields", "Skim a central bank statement"],
      },
      {
        id: "equity-markets",
        title: "How equity markets work",
        durationMin: 25,
        summary: "Exchanges, indices, sectors, earnings season, and what actually moves prices day to day.",
        objectives: ["Explain what an index measures", "Name two sectors", "Read a basic P/E ratio"],
      },
    ],
  },
  {
    id: "research-skills",
    eyebrow: "Module 3",
    title: "Student research skills",
    description:
      "Form a testable question, find credible data, and write for editorial review — the workflow for lab applications and journal submissions.",
    difficulty: "advanced",
    lessons: [
      {
        id: "hypothesis",
        title: "Forming a research question",
        durationMin: 35,
        summary: "Turn a broad topic into a bounded, testable question with named data sources.",
        objectives: ["Write one research question", "List two primary data sources", "State what would falsify your claim"],
      },
      {
        id: "writing",
        title: "Writing for publication",
        durationMin: 40,
        summary: "Abstract, thesis, charts, and revision — the Economics Journal submission format.",
        objectives: ["Draft a 150-word abstract", "Design one chart with a single message", "Respond to sample peer feedback"],
      },
    ],
  },
];
