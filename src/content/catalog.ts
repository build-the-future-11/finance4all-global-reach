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

export type CatalogStatus = "Verified repository" | "Active intake" | "Proposed" | "Coming soon";

export type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  status: CatalogStatus;
  domain: string;
  tags: string[];
  href?: string;
  evidence?: string;
};

export const portfolioProjects: PortfolioProject[] = [
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
    status: "Coming soon", domain: "Systemic risk", tags: ["networks", "liquidity", "stress testing"],
    evidence: "Member project brief coming soon; repository is not public",
  },
  {
    id: "finimmunity",
    title: "Finimmunity: financial resilience and recovery",
    description: "An exploratory financial-immunology framework studying how markets respond to shocks, recover, and develop persistent feedback loops. A research direction, not a demonstrated trading strategy.",
    status: "Coming soon", domain: "Financial resilience", tags: ["market shocks", "recovery", "feedback loops"],
    evidence: "Repository description confirmed 20 Sep 2026; member brief coming soon, repository is private",
  },
  {
    id: "iy-ern",
    title: "Iy-ERN economics research network",
    description: "A public codebase for an economics research and preprint network. Product claims and peer-review status remain bounded by the evidence published in the repository.",
    status: "Verified repository",
    domain: "Research publishing",
    tags: ["economics", "preprints", "publishing"],
    href: "https://github.com/build-the-future-11/Iy-ERN",
    evidence: "Public repository verified 19 Sep 2026",
  },
  {
    id: "portal",
    title: "Finance for All member platform",
    description: "The authenticated working layer for learning, research applications, opportunities, events, chapters, member discovery, saved work, and evidence-aware administration.",
    status: "Verified repository",
    domain: "Community infrastructure",
    tags: ["education", "community", "open source"],
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
];

export type ApplicationPath = {
  title: string;
  description: string;
  kind: "Application" | "Pilot interest" | "Collaboration";
  status: "Active intake" | "Interest route";
  href: string;
  verifiedAt: string;
};

export const applicationPaths: ApplicationPath[] = [
  {
    title: "Quantitative Markets & Microstructure Lab",
    description: "Apply for the evidence-led research cohort covering market structure, volatility, forecasting, execution, risk, and robust backtesting.",
    kind: "Application",
    status: "Active intake",
    href: "https://tally.so/r/obWxvN?utm_source=member_portal&utm_medium=opportunity",
    verifiedAt: "19 Sep 2026",
  },
  {
    title: "Financial Systems, Access & Policy Lab",
    description: "Apply to research credit, digital payments, inclusion, consumer protection, policy evaluation, fairness, and infrastructure.",
    kind: "Application",
    status: "Active intake",
    href: "https://tally.so/r/obWxvN?utm_source=member_portal&utm_medium=opportunity",
    verifiedAt: "19 Sep 2026",
  },
  {
    title: "Finance4All India school & community pilots",
    description: "For schools, educators, student leaders, and community organizations exploring a scoped practical financial-education pilot.",
    kind: "Pilot interest",
    status: "Active intake",
    href: "https://tally.so/r/obWxvN?utm_source=member_portal&utm_medium=opportunity",
    verifiedAt: "19 Sep 2026",
  },
  {
    title: "Financial Foundations cohort",
    description: "Apply to build finance, economics, markets, systems, and evidence foundations around a concrete final output.",
    kind: "Application",
    status: "Active intake",
    href: "https://tally.so/r/obWxvN?utm_source=member_portal&utm_medium=opportunity",
    verifiedAt: "19 Sep 2026",
  },
  {
    title: "Start a local chapter",
    description: "Propose a school, university, or city chapter. Public active status follows approval, an operating cadence, and a qualifying output.",
    kind: "Application",
    status: "Active intake",
    href: "https://tally.so/r/obWxvN?utm_source=member_portal&utm_medium=opportunity",
    verifiedAt: "19 Sep 2026",
  },
  {
    title: "Partners, speakers, and research collaborators",
    description: "For institutions, educators, researchers, speakers, data providers, and bounded program or research collaborations.",
    kind: "Collaboration",
    status: "Interest route",
    href: "https://tally.so/r/obWxvN?utm_source=member_portal&utm_medium=opportunity",
    verifiedAt: "19 Sep 2026",
  },
];

export type ProgramFamily = {
  title: string;
  description: string;
  state: "Live surface" | "Active intake" | "Coming soon";
  icon: LucideIcon;
};

export const programFamilies: ProgramFamily[] = [
  { title: "Global literacy outreach", description: "Practical financial-systems education for schools and communities, with scoped outcomes and safeguarding.", state: "Active intake", icon: Globe2 },
  { title: "Economics journal", description: "Student research notes, explainers, replication work, and reviewed economic arguments.", state: "Coming soon", icon: BookOpenText },
  { title: "Finance Meta Labs", description: "Bounded questions, fair baselines, traceable data, reproducible analysis, and preserved negative results.", state: "Live surface", icon: FlaskConical },
  { title: "Student podcast", description: "Source-led conversations with researchers, builders, policymakers, and practitioners.", state: "Coming soon", icon: Mic2 },
  { title: "School visits", description: "Locally adapted workshops on payments, scams, consumer protection, decisions, and access.", state: "Active intake", icon: School },
  { title: "Clubs and chapters", description: "Local teams earn active status through a cadence, an accountable lead, and evidenced outputs.", state: "Active intake", icon: Network },
  { title: "Live industry projects", description: "Bounded partner problems with a real owner, acceptance criteria, privacy boundary, and final artifact.", state: "Coming soon", icon: Building2 },
  { title: "Economics Olympiad pathway", description: "Concept preparation, applied reasoning, data interpretation, and evidence-aware competition practice.", state: "Coming soon", icon: Landmark },
  { title: "Digital courses", description: "Open foundations plus deeper guided sequences that end in an explainer, analysis, or build.", state: "Live surface", icon: ShieldCheck },
  { title: "Finance Debriefs", description: "Long-form, sourced explanations of markets, macroeconomics, companies, and financial systems.", state: "Live surface", icon: ChartNoAxesCombined },
];
