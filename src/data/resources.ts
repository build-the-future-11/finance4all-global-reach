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
    title: "Catalyst CFEI curriculum pack",
    description: "Slide decks and worksheets for school clubs and outreach volunteers.",
    href: "/portal/education",
    tags: ["education", "clubs", "free"],
    free: true,
  },
  {
    id: "club-toolkit",
    type: "toolkit",
    title: "Global school club toolkit",
    description: "Start a Finance4All chapter at your school — meeting templates, outreach scripts, Jane Street–aligned activities.",
    href: "/portal/education",
    tags: ["clubs", "leadership"],
    free: true,
  },
  {
    id: "economics-journal",
    type: "journal",
    title: "Economics Journal submissions",
    description: "Submit opinion pieces and market analysis for editorial review and global promotion.",
    href: "/portal/pathways/essays",
    tags: ["writing", "research"],
    free: true,
  },
  {
    id: "debriefed-substack",
    type: "partner",
    title: "Finance Debriefed newsletter",
    description: "Weekly macro and markets digest on Substack — free to subscribe.",
    href: "https://financedebriefed.substack.com",
    tags: ["news", "macro"],
    free: true,
    external: true,
  },
  {
    id: "student-podcasts",
    type: "podcast",
    title: "Student founder podcast series",
    description: "Conversations with young entrepreneurs — episodes curated for members.",
    href: "https://open.spotify.com/show/finance4all",
    tags: ["podcast", "startups"],
    free: true,
    external: true,
  },
  {
    id: "econ-olympiad",
    type: "partner",
    title: "Economics Olympiad prep",
    description: "Practice problems and case studies for global economic reasoning competitions.",
    href: "/portal/pathways",
    tags: ["competition", "olympiad"],
    free: true,
  },
  {
    id: "sister-program",
    type: "partner",
    title: "S.I.S.T.E.R summer research",
    description: "Partner program connecting high-schoolers to economics research tracks — 100% free cohorts.",
    href: "https://www.linkedin.com/company/finance-4-all-meta",
    tags: ["summer", "research"],
    free: true,
    external: true,
  },
  {
    id: "explainers-hub",
    type: "toolkit",
    title: "Finance glossary & explainers",
    description: "Beginner-friendly definitions with AI-assisted lookup in the member portal.",
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
    description: "Live walkthrough of the week's macro data and how to use Debriefed.",
    href: "/portal/debriefed",
  },
  {
    id: "lab-info",
    title: "Meta Labs application clinic",
    host: "Atlas Economics Lab",
    date: "Bi-weekly",
    description: "How to write a strong research application and match with lead mentors.",
    href: "/portal/labs",
  },
  {
    id: "pathways-office",
    title: "Pathways office hours",
    host: "Axiom Pathways",
    date: "Weekly",
    description: "Resume reviews, internship strategy, and opportunity Q&A for all members.",
    href: "/portal/pathways",
  },
];
