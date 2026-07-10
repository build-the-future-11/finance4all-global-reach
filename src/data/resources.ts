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
    title: "Catalyst CFEI facilitator guide",
    description: "How volunteers teach the same 90-minute session format used in school outreach.",
    href: "/portal/resources/catalyst-curriculum",
    tags: ["education", "volunteers"],
    free: true,
  },
  {
    id: "club-toolkit",
    type: "toolkit",
    title: "Global school club toolkit",
    description: "Month-by-month playbook to launch a faculty-supported chapter at your school.",
    href: "/portal/resources/club-toolkit",
    tags: ["clubs", "leadership"],
    free: true,
  },
  {
    id: "economics-journal",
    type: "journal",
    title: "Economics Journal standards",
    description: "What editors look for before promoting student writing externally.",
    href: "/portal/resources/economics-journal",
    tags: ["writing", "research"],
    free: true,
  },
  {
    id: "debriefed-substack",
    type: "partner",
    title: "Finance Debriefed newsletter",
    description: "Weekly macro and markets digest on Substack.",
    href: "https://financedebriefed.substack.com",
    tags: ["news", "macro"],
    free: true,
    external: true,
  },
  {
    id: "student-podcasts",
    type: "podcast",
    title: "Student founder podcast series",
    description: "Interviews with young entrepreneurs (external playlist).",
    href: "https://open.spotify.com/show/finance4all",
    tags: ["podcast", "startups"],
    free: true,
    external: true,
  },
  {
    id: "econ-olympiad",
    type: "partner",
    title: "Economics Olympiad prep",
    description: "Practice cases and competition links via Pathways.",
    href: "/portal/pathways",
    tags: ["competition", "olympiad"],
    free: true,
  },
  {
    id: "sister-program",
    type: "partner",
    title: "S.I.S.T.E.R summer research",
    description: "Free summer economics research cohorts with Finance4All partners.",
    href: "https://www.linkedin.com/company/finance-4-all-meta",
    tags: ["summer", "research"],
    free: true,
    external: true,
  },
  {
    id: "explainers-hub",
    type: "toolkit",
    title: "Finance glossary",
    description: "Searchable explainers written for the member portal.",
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
    description: "Walk through the week's macro data and how to read Debriefed.",
    href: "/portal/debriefed",
  },
  {
    id: "lab-info",
    title: "Meta Labs application clinic",
    host: "Atlas Economics Lab",
    date: "Bi-weekly",
    description: "Motivation statements, mentor matching, and project selection.",
    href: "/portal/labs",
  },
  {
    id: "pathways-office",
    title: "Pathways office hours",
    host: "Axiom Pathways",
    date: "Weekly",
    description: "Resume review and internship strategy for members.",
    href: "/portal/pathways",
  },
];
