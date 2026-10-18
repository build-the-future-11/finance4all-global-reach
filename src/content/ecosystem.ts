export type EcosystemStatus = "Active" | "In development" | "In discussion" | "Outstanding";

export interface EcosystemItem {
  title: string;
  status: EcosystemStatus;
  description: string;
  href?: string;
}

export const ecosystemOverview = {
  recognition: "Finance4All is a UNICEF-recognized financial-literacy initiative.",
  scale: "FinanceMeta reports a research ecosystem of 500+ researchers across quantitative finance, economics, investment modeling and financial education.",
  scaleBoundary: "The 500+ figure is organizer-reported. A public, permission-cleared roster supporting that total is not attached to this site.",
};

export const activeProgramSnapshot: EcosystemItem[] = [
  {
    title: "IYER Research Journal",
    status: "Active",
    description: "Editorial screening is open for an inaugural edition targeted for 1 December 2026. Publication still depends on completed review, author permissions and editorial authorization.",
    href: "/programs/iyer-journal",
  },
  {
    title: "IYER Fellowship",
    status: "In development",
    description: "Contributor interest and research pathways are being developed while cohort dates, selection criteria and mentoring capacity are confirmed.",
    href: "/programs/research-fellowship",
  },
  {
    title: "FinanceMeta Grand Research Challenge",
    status: "In development",
    description: "Competition outreach is progressing across economics, quantitative finance, economic modeling and applied research. Rules, judges, eligibility and dates remain pending.",
    href: "/programs/global-research-challenge",
  },
  {
    title: "Global Investment Model Challenge 2026",
    status: "In development",
    description: "A transparent investment-model competition is being prepared. The final rules, deadline, judging structure and submission route are not yet frozen.",
    href: "/programs/investment-model-challenge",
  },
  {
    title: "Finance4 Impact",
    status: "Active",
    description: "Financial-education workshops and school or community pilots are being developed with facilitator, safeguarding, curriculum and measurement checks.",
    href: "/programs/finance4-impact",
  },
  {
    title: "International research networks",
    status: "In development",
    description: "European and Gulf networks are being organized to convert regional interest into scoped research projects, accountable working teams and inspectable outputs.",
    href: "/programs/regional-research-networks",
  },
];

export const collaborationPipeline: EcosystemItem[] = [
  {
    title: "YEFA",
    status: "In discussion",
    description: "A proposed channel for sharing relevant international opportunities. A formal partnership scope and delivered exchange remain to be confirmed.",
  },
  {
    title: "FFI",
    status: "In discussion",
    description: "Financial-education materials are under discussion. Publication rights, review responsibility and a defined delivery remain outstanding.",
  },
  {
    title: "YIS / Bay Area Stock Pitch",
    status: "In discussion",
    description: "Collaboration is being explored in connection with the Bay Area Stock Pitch. Roles, rules and public attribution require formal confirmation.",
  },
  {
    title: "YEL, NSRI & international researchers",
    status: "In discussion",
    description: "Exploratory conversations cover research, challenge outreach and individual collaboration. Discussions and contacts are not presented as confirmed institutional partnerships.",
  },
];

export const technicalWork: EcosystemItem[] = [
  { title: "FI-JEPA", status: "Active", description: "Financial representation learning with an engineering baseline and an explicit real-market verification boundary.", href: "/research/projects/fi-jepa" },
  { title: "Eigen-JEPA", status: "Active", description: "Research on covariance geometry, eigenspaces and changing market regimes, with a public repository and synthetic evaluation scope.", href: "/research/projects/eigen-jepa" },
  { title: "Portfolio optimization", status: "Active", description: "Walk-forward comparison of transparent portfolio baselines, costs and risk through the EigenFinance research record.", href: "/research/projects/eigenfinance" },
  { title: "Causal financial modeling", status: "In development", description: "A proposed lane for causal questions in markets and economics, with identification assumptions, negative controls and sensitivity checks required before a result claim.", href: "/research/projects/causal-financial-modeling" },
  { title: "PriorMoves", status: "In development", description: "An independent evaluation project intended to assess claims against a frozen protocol, preserved outputs and an explicit external-evidence boundary.", href: "/research/projects/priormoves" },
];

export const operatingPriorities: EcosystemItem[] = [
  { title: "Contributor onboarding", status: "Active", description: "Contributor intake, bounded research assignments, editorial work and reviewer matching are progressing." },
  { title: "Education delivery", status: "In development", description: "Workshop materials, facilitators, safeguarding and useful post-session evidence are being developed together." },
  { title: "Competition outreach", status: "In development", description: "Participant, reviewer and collaborator outreach is progressing while rules and dates remain under review." },
  { title: "Platform deployment", status: "Outstanding", description: "Production migration, live authorization, privacy, support and release checks remain required before unrestricted onboarding." },
  { title: "Research verification", status: "Outstanding", description: "Repository and software checks do not replace exact experiment receipts, independent evaluation or publication review." },
  { title: "Partnership confirmation", status: "Outstanding", description: "Named discussions require a written scope, accountable contacts and a delivered or accepted contribution before formal partnership language is used." },
];
