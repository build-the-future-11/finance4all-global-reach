export type ResourceType = "curriculum" | "journal" | "podcast" | "toolkit" | "partner" | "webinar";

export interface ResourceItem {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  href: string;
  tags: string[];
  free: boolean;
  external?: boolean;
}

export const RESOURCE_LIBRARY: ResourceItem[] = [
  {
    id: "catalyst-curriculum",
    type: "curriculum",
    title: "Catalyst facilitator guide",
    description: "90-minute session format: hook, concept, exercise, discussion, portal signup.",
    href: "/portal/resources/catalyst-curriculum",
    tags: ["education", "volunteers"],
    free: true,
  },
  {
    id: "club-toolkit",
    type: "toolkit",
    title: "School chapter playbook",
    description: "Month-by-month steps to launch a faculty-backed club — officers, first event, reporting.",
    href: "/portal/resources/club-toolkit",
    tags: ["clubs", "leadership"],
    free: true,
  },
  {
    id: "economics-journal",
    type: "journal",
    title: "Journal submission standards",
    description: "What editors check before promoting student writing: thesis, evidence, clarity.",
    href: "/portal/resources/economics-journal",
    tags: ["writing", "research"],
    free: true,
  },
  {
    id: "debriefed-substack",
    type: "partner",
    title: "Finance Debriefed newsletter",
    description: "Weekly macro and markets digest on Substack — optional alongside the portal feed.",
    href: "https://financedebriefed.substack.com",
    tags: ["news", "macro"],
    free: true,
    external: true,
  },
  {
    id: "student-podcasts",
    type: "podcast",
    title: "Founder interview playlist",
    description: "External Spotify playlist — students building companies while still in school.",
    href: "https://open.spotify.com/show/finance4all",
    tags: ["podcast", "startups"],
    free: true,
    external: true,
  },
  {
    id: "econ-olympiad",
    type: "partner",
    title: "Economics Olympiad prep",
    description: "Practice cases and competition links collected on the Pathways opportunity board.",
    href: "/portal/pathways",
    tags: ["competition", "olympiad"],
    free: true,
  },
  {
    id: "sister-program",
    type: "partner",
    title: "S.I.S.T.E.R summer cohorts",
    description: "Partner-run summer economics research program — application details on Pathways.",
    href: "https://www.linkedin.com/company/finance-4-all-meta",
    tags: ["summer", "research"],
    free: true,
    external: true,
  },
  {
    id: "explainers-hub",
    type: "toolkit",
    title: "Finance glossary",
    description: "Searchable explainers on IPOs, rates, sectors — linked from lessons and Debriefed.",
    href: "/portal/debriefed/explainers",
    tags: ["glossary", "beginner"],
    free: true,
  },
];

export const UPCOMING_WEBINARS = [
  {
    id: "macro-101",
    title: "Macro 101 for new members",
    host: "Finance Debriefed",
    date: "Monthly · first Thursday",
    description: "Walk through the week's CPI, jobs, and rates data — and where to find it on Debriefed.",
    href: "/portal/debriefed",
  },
  {
    id: "lab-info",
    title: "Lab application workshop",
    host: "Atlas Economics Lab",
    date: "Bi-weekly",
    description: "How to write a motivation statement, pick a project, and what leads look for in applications.",
    href: "/portal/labs",
  },
  {
    id: "pathways-office",
    title: "Pathways office hours",
    host: "Axiom Pathways",
    date: "Weekly",
    description: "Ask about internships, essay submissions, and how to structure a Pathways application.",
    href: "/portal/pathways",
  },
];
