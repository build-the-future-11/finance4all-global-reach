import type { LucideIcon } from "lucide-react";
import {
  BookOpenText,
  Building2,
  ChartNoAxesCombined,
  FlaskConical,
  Globe2,
  Landmark,
  Mic2,
  Network,
  School,
  ShieldCheck,
} from "lucide-react";

export type CatalogStatus = "Verified repository" | "Active intake" | "Proposed";

export type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  status: CatalogStatus;
  domain: string;
  tags: string[];
  page: string;
  website?: string;
  href?: string;
  evidence?: string;
};

const portfolioProjectRecords: Omit<PortfolioProject, "page">[] = [
  {
    id: "finance-meta-global",
    title: "FinanceMeta Global evidence workspace",
    description: "The public registry for finance, economics, quantitative research, operating standards, program gates, and inspectable project evidence.",
    status: "Verified repository",
    domain: "Research infrastructure",
    tags: ["economics", "registry", "open methods"],
    href: "https://github.com/build-the-future-11/FinanceMeta-Global",
    evidence: "Public repository verified 19 Sep 2026",
  },
  {
    id: "fi-jepa",
    title: "FI-JEPA: learning financial representations",
    description: "A research project exploring joint-embedding predictive architectures for financial sequences, market regimes, and risk. The work investigates useful representations, not guaranteed investment returns.",
    status: "Verified repository",
    domain: "Financial machine learning",
    tags: ["time series", "JEPA", "synthetic baseline"],
    href: "https://github.com/Finance-Meta-Research/FI-JEPA",
    evidence: "Public repository confirmed 20 Sep 2026; research in progress",
  },
  {
    id: "eigen-jepa",
    title: "Eigen-JEPA: market geometry and regimes",
    description: "Explore how covariance structure, eigenspaces, and changing correlations can help describe financial market regimes. A spectral perspective on financial representation learning.",
    status: "Verified repository", domain: "Financial machine learning", tags: ["JEPA", "covariance", "market regimes"],
    href: "https://github.com/Finance-Meta-Research/Eigen-JEPA", evidence: "Public repository confirmed 20 Sep 2026; research in progress",
  },
  {
    id: "eigenfinance",
    title: "EigenFinance: portfolio evaluation",
    description: "Compare equal-weight, inverse-volatility, and shrinkage minimum-variance strategies through walk-forward evaluation, an untouched holdout, and explicit transaction costs.",
    status: "Verified repository", domain: "Portfolio research", tags: ["portfolio", "risk", "walk-forward testing"],
    href: "https://github.com/Finance-Meta-Research/EigenFinance", evidence: "Public repository confirmed 20 Sep 2026; no real-market performance claim",
  },
  {
    id: "lgwm",
    title: "LGWM: Liquidation Graph World Models",
    description: "Study systemic risk as a connected process: how leverage, liquidity, and liquidation links can propagate a shock across institutions and assets. Contact the team to discuss participation.",
    status: "Proposed", domain: "Systemic risk", tags: ["networks", "liquidity", "stress testing"],
    evidence: "No member project brief is attached; repository is not public",
  },
  {
    id: "finimmunity",
    title: "Finimmunity: financial resilience and recovery",
    description: "An exploratory financial-immunology framework studying how markets respond to shocks, recover, and develop persistent feedback loops. A research direction, not a demonstrated trading strategy.",
    status: "Proposed", domain: "Financial resilience", tags: ["market shocks", "recovery", "feedback loops"],
    evidence: "Repository description confirmed 20 Sep 2026; no member brief is attached; repository is private",
  },
  {
    id: "iy-ern",
    title: "Iy-ERN economics research network",
    description: "The International Youth Economics Research Network connects FinanceMeta Labs, research cohorts, a planned journal with independent review, and a moderated preprint forum.",
    status: "Verified repository",
    domain: "Research publishing",
    tags: ["economics", "preprints", "publishing"],
    website: "/iyern",
    evidence: "Public repository verified 19 Sep 2026",
  },
  {
    id: "portal",
    title: "Finance for All member platform",
    description: "The authenticated working layer for learning, research applications, opportunities, events, chapters, member discovery, saved work, and evidence-aware administration.",
    status: "Verified repository",
    domain: "Community infrastructure",
    tags: ["education", "community", "open source"],
    website: "https://finance4all-global-reach.vercel.app/",
    href: "https://github.com/build-the-future-11/finance4all-global-reach",
    evidence: "Public repository verified 19 Sep 2026",
  },
  {
    id: "inflation-observatory",
    title: "Student cost-of-living observatory",
    description: "A proposed reproducible price-basket study comparing official inflation measures with carefully defined student spending baskets across cities.",
    status: "Proposed",
    domain: "Applied economics",
    tags: ["inflation", "index numbers", "public data"],
    evidence: "Needs a named lead, frozen basket, collection protocol, and review plan",
  },
  {
    id: "digital-payments-access",
    title: "Digital payments, access, and reliability atlas",
    description: "A proposed public-data project separating payment adoption from reliability, consumer safety, merchant experience, and meaningful financial access.",
    status: "Proposed",
    domain: "Financial systems",
    tags: ["UPI", "inclusion", "consumer protection"],
    evidence: "Needs dataset provenance, privacy review, and a causal-claim boundary",
  },
  {
    id: "youth-expectations-panel",
    title: "Youth economic expectations panel",
    description: "A proposed recurring survey of education, work, inflation, and financial confidence with transparent sampling, anonymization, and uncertainty reporting.",
    status: "Proposed",
    domain: "Behavioural economics",
    tags: ["survey", "expectations", "labour market"],
    evidence: "Needs ethics, safeguarding, sampling, and data-retention protocols",
  },
  {
    id: "public-company-lab",
    title: "Open company and sector research lab",
    description: "A proposed research workflow for source-led company analysis, scenario modelling, valuation assumptions, falsifiers, and documented corrections.",
    status: "Proposed",
    domain: "Investment research",
    tags: ["filings", "valuation", "scenario analysis"],
    evidence: "Needs common rubric, conflict policy, reviewers, and publication standard",
  },
  {
    id: "causal-financial-modeling",
    title: "Causal financial modeling",
    description: "A developing research lane for questions about causes, interventions, and financial or economic outcomes, with explicit identification assumptions and sensitivity checks.",
    status: "Proposed",
    domain: "Causal inference",
    tags: ["causal inference", "econometrics", "policy evaluation"],
    evidence: "Needs a frozen question, defensible identification strategy, negative controls, data provenance, and independent review",
  },
  {
    id: "priormoves",
    title: "PriorMoves independent evaluation",
    description: "An independent evaluation project designed to test submitted claims against a frozen protocol, preserved outputs, comparator checks, and a clear external-evidence boundary.",
    status: "Proposed",
    domain: "Independent evaluation",
    tags: ["evaluation", "reproducibility", "research integrity"],
    evidence: "Project scope is reported; no completed evaluation receipt or independent result is published here",
  },
];

export const portfolioProjects: PortfolioProject[] = portfolioProjectRecords.map((project) => ({
  ...project,
  page: project.id === "iy-ern" ? "/iyern" : `/research/projects/${project.id}`,
}));

export type ApplicationPath = {
  title: string;
  description: string;
  kind: "Interest" | "Pilot interest" | "Collaboration";
  status: "Active intake" | "Interest route";
  href: string;
  verifiedAt: string;
};

export const applicationPaths: ApplicationPath[] = [
  {
    title: "Quantitative Markets & Microstructure Lab",
    description: "Express research interest in market structure, forecasting and robust backtesting. Cohort activation remains on hold pending protocol controls and review capacity.",
    kind: "Interest",
    status: "Interest route",
    href: "https://tally.so/r/kbayyj",
    verifiedAt: "16 Oct 2026",
  },
  {
    title: "Financial Systems, Access & Policy Lab",
    description: "Express interest in credit, payments, inclusion and policy research. Staffing and approved artifact gates remain in force.",
    kind: "Interest",
    status: "Interest route",
    href: "https://tally.so/r/kbayyj",
    verifiedAt: "16 Oct 2026",
  },
  {
    title: "Finance4All India school & community pilots",
    description: "For schools, educators, student leaders, and community organizations exploring a scoped practical financial-education pilot.",
    kind: "Pilot interest",
    status: "Interest route",
    href: "https://tally.so/r/kbayyj",
    verifiedAt: "16 Oct 2026",
  },
  {
    title: "Financial Foundations cohort",
    description: "Explore open financial foundations and express interest in a future guided cohort. Dates and delivery capacity are not confirmed.",
    kind: "Interest",
    status: "Interest route",
    href: "https://tally.so/r/kbayyj",
    verifiedAt: "16 Oct 2026",
  },
  {
    title: "Propose a local chapter",
    description: "Propose a school, university, or city chapter. Public active status follows approval, an operating cadence, and a qualifying output.",
    kind: "Interest",
    status: "Interest route",
    href: "https://tally.so/r/kbayyj",
    verifiedAt: "16 Oct 2026",
  },
  {
    title: "Partners, speakers, and research collaborators",
    description: "For institutions, educators, researchers, speakers, data providers, and bounded program or research collaborations.",
    kind: "Collaboration",
    status: "Interest route",
    href: "https://tally.so/r/obWxvN",
    verifiedAt: "16 Oct 2026",
  },
];

export type ProgramFamily = {
  title: string;
  description: string;
  state: "Live surface" | "Active intake" | "Proposed";
  icon: LucideIcon;
};

export const programFamilies: ProgramFamily[] = [
  { title: "Global literacy outreach", description: "Practical financial-systems education for schools and communities, with scoped outcomes and safeguarding.", state: "Active intake", icon: Globe2 },
  { title: "Economics journal", description: "Student research notes, explainers, replication work, and reviewed economic arguments.", state: "Proposed", icon: BookOpenText },
  { title: "Finance Meta Labs", description: "Bounded questions, fair baselines, traceable data, reproducible analysis, and preserved negative results.", state: "Live surface", icon: FlaskConical },
  { title: "Student podcast", description: "Source-led conversations with researchers, builders, policymakers, and practitioners.", state: "Proposed", icon: Mic2 },
  { title: "School visits", description: "Locally adapted workshops on payments, scams, consumer protection, decisions, and access.", state: "Active intake", icon: School },
  { title: "Clubs and chapters", description: "Local teams earn active status through a cadence, an accountable lead, and evidenced outputs.", state: "Active intake", icon: Network },
  { title: "Live industry projects", description: "Bounded partner problems with a real owner, acceptance criteria, privacy boundary, and final artifact.", state: "Proposed", icon: Building2 },
  { title: "Economics Olympiad pathway", description: "Concept preparation, applied reasoning, data interpretation, and evidence-aware competition practice.", state: "Proposed", icon: Landmark },
  { title: "Digital courses", description: "Open foundations plus deeper guided sequences that end in an explainer, analysis, or build.", state: "Live surface", icon: ShieldCheck },
  { title: "Finance Debriefs", description: "Long-form, sourced explanations of markets, macroeconomics, companies, and financial systems.", state: "Live surface", icon: ChartNoAxesCombined },
];
