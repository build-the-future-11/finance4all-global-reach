import { portfolioProjects } from "@/content/catalog";
import type { ResearchCategory } from "@/content/iyern";

export const researchTopics = [
  { id: "quantitative", title: "Quantitative Finance & Econometrics", publicationCategory: "quantitative" },
  { id: "financial-ml", title: "Financial Machine Learning", publicationCategory: "quantitative" },
  { id: "portfolio-risk", title: "Portfolio Management & Risk", publicationCategory: "quantitative" },
  { id: "macro", title: "Macroeconomics & Monetary Policy", publicationCategory: "policy" },
  { id: "microstructure", title: "Financial Markets & Microstructure", publicationCategory: "quantitative" },
  { id: "inclusion", title: "Development Economics & Financial Inclusion", publicationCategory: "development" },
  { id: "behavioral", title: "Behavioral Economics & Decision Science", publicationCategory: "behavioral" },
  { id: "fintech", title: "Financial Technology & Data Infrastructure", publicationCategory: "quantitative" },
  { id: "public-policy", title: "Economic Policy & Public Finance", publicationCategory: "policy" },
  { id: "methods", title: "Reproducibility, Methods & Research Integrity", publicationCategory: "quantitative" },
] as const satisfies ReadonlyArray<{ id: string; title: string; publicationCategory: ResearchCategory }>;
export type ResearchTopic = typeof researchTopics[number]["id"];
export const researchStatuses = ["Repository available", "Repository record", "Engineering baseline", "Proposed study", "On hold", "Research infrastructure"] as const;
export type ResearchStatus = typeof researchStatuses[number];
export interface ResearchProject {
  slug: string;
  title: string;
  abstract: string;
  question: string;
  objective: string;
  topics: ResearchTopic[];
  tags: string[];
  status: ResearchStatus;
  featured: boolean;
  methodology: string;
  data: string;
  baselines: string;
  metrics: string;
  design: string;
  controls: string;
  findings: string;
  limitations: string;
  publication: string;
  participation: string;
  program: string;
  resources: { label: string; href: string; kind: "repository" | "standard" | "program" }[];
  verifiedAt: string;
  sourceDate: string;
  sourceNote: string;
}
const noPublication = "No manuscript is authorized for publication through this catalog. Repository paper files do not establish journal acceptance or public-release permission.";
const defaultControls = "Before a result is claimed, freeze the question and endpoint, record source rights and information timing, preserve failed runs and null results, and obtain review independent of the analysis.";
type ResearchDetails = Pick<ResearchProject, "question" | "objective" | "topics" | "methodology" | "data" | "baselines" | "metrics" | "findings" | "limitations" | "program"> & Partial<ResearchProject>;
const details: Record<string, ResearchDetails> = {
  "finance-meta-global": {
    question: "What evidence is needed before a project or program can make a stronger public claim?", objective: "Keep research state and release decisions traceable to inspectable artifacts.", topics: ["methods", "fintech"], status: "Research infrastructure",
    methodology: "Versioned project and program registries, evidence templates and validation checks.", data: "Repository records and explicit evidence-level declarations; these are governance records, not market observations.", baselines: "The minimum evidence level and launch gate attached to each registry entry.", metrics: "Completeness, provenance and validation status; no scientific performance metric is established by registry validation.", findings: "The local registry distinguishes executable synthetic baselines from unvalidated research and planned programs.", limitations: "A complete registry or passing software test is not external reproduction or empirical confirmation.", program: "methods-reproducibility", sourceDate: "2026-09-01",
  },
  "fi-jepa": {
    question: "Can predicting future latent representations produce useful features for a frozen downstream probe?", objective: "Compare a financial joint-embedding predictive representation with simple alternatives under controlled information timing.", topics: ["financial-ml", "quantitative", "methods"], status: "Engineering baseline", featured: true,
    methodology: "The FinanceMeta-Global baseline uses a context encoder, EMA target, latent predictor and frozen ridge probe. The separate public FI-JEPA repository contains a broader PyTorch experiment package; those artifacts are not treated as equivalent receipts.",
    data: "The bounded registry evidence is deterministic synthetic regime-switching data. Licensed point-in-time real-market provenance is a required next gate.", baselines: "Persistence and a frozen ridge probe in the bounded baseline; stronger linear and autoregressive comparisons remain required for a broader claim.", metrics: "Synthetic probe error and above-training-mean classification accuracy. This is not raw return-direction accuracy or a trading return.",
    design: "Chronological train/validation partitions with context strictly before targets. Broader evaluation needs frozen walk-forward splits, seeds and ablations.",
    controls: "No overlapping observations between chronological partitions; fit normalization on training data only; preserve config, seed, commit and raw outputs.",
    findings: "An executable synthetic baseline and verification contract are documented. No real-market alpha, superiority, novelty or profitability is established here.", limitations: "The local M1/E1 registry and the separate public package have different scope. This site has not independently rerun or reconciled their results.", program: "finance-meta-labs", sourceDate: "2026-09-01", sourceNote: "Local FinanceMeta-Global FI-JEPA README and registry checked; separate public repository reachable on 16 October 2026.",
  },
  "eigen-jepa": {
    question: "Can future covariance geometry help describe changes in market regimes?", objective: "Study covariance spectra, eigenspaces and regime transitions as prediction targets.", topics: ["financial-ml", "portfolio-risk", "quantitative"], status: "Repository available", featured: true,
    methodology: "A temporal and spectral encoder with memory and gating, baseline/ablation evaluation, and synthetic market-style suites.", data: "The public README describes synthetic regime-switching markets. Real-market validation is not established by the catalog.", baselines: "The repository documents baseline and ablation suites; a result-bearing comparison must identify the exact config and retained outputs.", metrics: "Spectral and regime diagnostics, memory-budget comparisons and walk-forward slices; no accepted headline effect size is claimed here.",
    design: "The README specifies deterministic seeds and chronological evaluation; source package inspection is distinct from independent reproduction.",
    findings: "The public repository includes code, protocols and reproduction tooling. Its README explicitly describes a synthetic research baseline rather than trading alpha.", limitations: "Synthetic behavior need not transfer to live markets. Paper source and compiled PDFs are not proof of peer review or publication authorization.", program: "finance-meta-labs", sourceDate: "2026-10-16", sourceNote: "Public repository README inspected on 16 October 2026; no experiment was executed in this website upgrade.",
  },
  "eigenfinance": {
    question: "How sensitive are portfolio comparisons to estimation, costs and evaluation design?", objective: "Compare transparent allocation baselines under a walk-forward protocol.", topics: ["portfolio-risk", "quantitative", "methods"], featured: true,
    methodology: "The existing public catalog describes equal-weight, inverse-volatility and shrinkage minimum-variance portfolios.", data: "A current dataset manifest and point-in-time provenance were not verified in this audit.", baselines: "Equal-weight, inverse-volatility and shrinkage minimum-variance, as recorded in the prior catalog.", metrics: "Risk, turnover and cost-adjusted performance are relevant evaluation targets; current numerical results are not verified.", design: "The prior catalog specifies walk-forward evaluation and an untouched holdout. Exact split boundaries require repository verification.", findings: "A repository was recorded as public on 20 September 2026. No real-market performance finding is promoted here.", limitations: "The live source fetch was unavailable during this audit; the historical link and verification date are retained with that qualification.", program: "quantitative-markets", sourceDate: "2026-09-20", sourceNote: "Historical repository verification from catalog.ts; current remote read failed, so availability and results remain unconfirmed.",
  },
  "lgwm": {
    question: "How might leverage and liquidation links propagate shocks through a financial network?", objective: "Define a testable network model of systemic risk before execution.", topics: ["portfolio-risk", "microstructure"], methodology: "Proposed graph-based stress scenarios linking institutions, assets, leverage and liquidity.", data: "No approved public dataset or member project brief is attached.", baselines: "A simple unconnected shock model and transparent network contagion baseline should be specified before testing.", metrics: "Proposed: loss propagation, liquidity stress and sensitivity to network assumptions; no endpoint is frozen.", findings: "Research direction only; no public experiment or confirmed result is attached.", limitations: "The repository is not public in the existing record. Model structure, calibration and reviewer capacity remain unresolved.", program: "student-research",
  },
  "finimmunity": {
    title: "Market memory, resilience & recovery", tags: ["market memory", "Finimmunity", "market shocks", "feedback loops"], question: "Can persistent feedback help explain market responses after a shock?", objective: "Turn the financial-resilience concept into a falsifiable study of recovery and memory.", topics: ["behavioral", "portfolio-risk", "quantitative"], methodology: "Proposed comparison of shock responses and persistent state under alternative memory assumptions.", data: "No licensed dataset, frozen protocol or public evidence package is supplied.", baselines: "Memory-free dynamics and simple autoregressive alternatives would be necessary controls; not yet a verified implementation.", metrics: "Proposed recovery time, response stability and out-of-sample predictive error; endpoints remain to be agreed.", findings: "An exploratory direction is recorded. No demonstrated strategy, novelty claim or market-memory mechanism is established.", limitations: "The prior catalog records a private repository. Private descriptions cannot substitute for inspectable results.", program: "student-research",
  },
  "iy-ern": {
    question: "How can emerging research become an authorized, inspectable public artifact?", objective: "Connect manuscript screening, research discussion and independent editorial decisions.", topics: ["methods", "public-policy", "inclusion"], status: "Research infrastructure", methodology: "Separate journal and preprint pathways with author consent, rights, moderation and review-state checks.", data: "Public manuscript metadata only after permission; private submissions and contact information are excluded.", baselines: "Publication authorization requirements apply to every item, regardless of research outcome.", metrics: "Version, review state, source and permission completeness; a submission count is not a publication count.", findings: "The local public archive contains no authorized manuscripts. Screened intake exists; fellowship and challenge admissions remain provisional.", limitations: "The inaugural edition targets 1 December 2026, but the final publication date depends on editorial readiness, completed review and author permissions. No DOI, ISSN, acceptance, faculty mentoring or placement is promised.", program: "iyer-journal", sourceDate: "2026-10-18",
  },
  "portal": {
    question: "How can learning, participation and private member state share an auditable platform?", objective: "Support public discovery and authenticated activity with explicit permissions.", topics: ["fintech", "methods"], status: "Research infrastructure", methodology: "Typed content, authenticated workflows, publication review and row-level authorization.", data: "Member records remain protected; this public record contains no private activity or profile data.", baselines: "Authorization, publication and account-isolation contracts.", metrics: "Engineering checks and certified account journeys; neither proves educational or research impact.", findings: "An implementation exists. Unrestricted production member onboarding remains subject to independent release certification.", limitations: "Local builds do not verify production authorization, database provenance or real member outcomes.", program: "student-research", sourceDate: "2026-10-16",
  },
  "inflation-observatory": {
    question: "How do defined student spending baskets differ from official inflation measures across cities?", objective: "Describe basket sensitivity with transparent units and collection rules.", topics: ["macro", "public-policy", "quantitative"], methodology: "Proposed fixed-basket price index with a documented comparison to official index coverage.", data: "Candidate official price series and a future collection protocol; no collected student-price dataset is claimed.", baselines: "Official inflation series and alternative basket weights with matched coverage.", metrics: "Index changes, coverage, missingness and sensitivity to weights; final endpoints are not frozen.", findings: "Proposed study. No cross-city price results have been verified.", limitations: "Requires a lead, frozen basket, source permissions and a review plan. Convenience sampling cannot establish city-wide living costs.", program: "financial-systems-policy",
  },
  "digital-payments-access": {
    question: "When does digital payment adoption translate into reliable and meaningful financial access?", objective: "Distinguish use, service reliability, consumer safety and access.", topics: ["inclusion", "fintech", "public-policy"], methodology: "Proposed descriptive public-data atlas with explicit variable definitions and comparability notes.", data: "No approved dataset is attached. Candidate public series require provenance, license and geographic coverage review.", baselines: "Adoption-only indicators compared with broader access and reliability measures.", metrics: "Coverage, availability, reliability and access indicators; no causal endpoint is approved.", findings: "Proposed research direction without an empirical conclusion.", limitations: "Requires privacy review, harmonized definitions and a causal-claim boundary. Aggregate adoption cannot establish individual access.", program: "financial-systems-policy",
  },
  "youth-expectations-panel": {
    question: "How do young people's expectations about education, work and inflation change over time?", objective: "Design a survey that reports uncertainty and sampling limitations honestly.", topics: ["behavioral", "macro", "inclusion"], methodology: "Proposed recurring panel with a predeclared sampling and anonymization protocol.", data: "No survey responses are used or displayed. Ethics, safeguarding, consent and retention must be approved before collection.", baselines: "Prior waves and appropriate public expectation surveys, subject to comparable populations and questions.", metrics: "Response rate, attrition, uncertainty and expectation changes; final measures require review.", findings: "Proposed study; no participant counts or survey findings are claimed.", limitations: "Selection bias, attrition and protection of minors require explicit controls and an approved protocol.", program: "student-research",
  },
  "public-company-lab": {
    question: "Which assumptions drive a company or sector analysis, and what would falsify them?", objective: "Make source quality and scenario sensitivity visible in educational company research.", topics: ["portfolio-risk", "quantitative"], methodology: "Proposed filing-led analysis with scenario models, alternative assumptions and documented corrections.", data: "Public filings and licensed sources only; no confidential company information is authorized.", baselines: "Transparent peer comparisons and simple scenarios with matched definitions and dates.", metrics: "Source completeness and sensitivity to assumptions; no price target or investment recommendation is established.", findings: "A proposed workflow; no completed company report is represented here.", limitations: "Requires a common rubric, reviewer, conflict policy and publication standard. Educational analysis is not personal financial advice.", program: "student-research",
  },
  "causal-financial-modeling": {
    question: "Which financial or economic outcomes can be attributed to a defined intervention under defensible assumptions?", objective: "Develop causal financial models that state identification assumptions and test plausible alternative explanations.", topics: ["quantitative", "macro", "public-policy", "methods"],
    methodology: "A proposed causal-inference workflow using predeclared estimands, time ordering, directed assumptions and a design appropriate to the question, such as natural experiments, panel comparisons or interrupted time series.", data: "No approved dataset is attached. Every study must document provenance, revisions, treatment timing, population coverage, missingness and rights.", baselines: "Descriptive association, naive before-and-after comparisons and alternative specifications that expose how much the conclusion depends on the identification design.", metrics: "A predeclared effect estimate with uncertainty, balance or pre-trend diagnostics, placebo tests and sensitivity to unmeasured confounding where appropriate.",
    findings: "A developing research direction is recorded. No causal effect estimate or validated financial intervention model is published here.", limitations: "Causal language requires stronger assumptions than predictive accuracy. Identification, interference, selection, measurement and external-validity risks remain study-specific gates.", program: "methods-reproducibility", verifiedAt: "2026-10-18", sourceDate: "2026-10-18", sourceNote: "Organizer-provided portfolio update recorded on 18 October 2026; no study execution or result receipt was supplied by this content update.",
  },
  "priormoves": {
    question: "Do submitted research claims survive an evaluation conducted independently from the original analysis?", objective: "Create a bounded independent-evaluation record with frozen criteria, preserved outputs and explicit claim limits.", topics: ["methods", "quantitative", "portfolio-risk"],
    methodology: "A proposed independent review workflow that freezes the submission, environment, comparators, acceptance criteria and reporting template before outcome access.", data: "No evaluation packet, dataset license or result bundle is published through this site. Inputs must be hashed and provenance recorded before execution.", baselines: "The submitted claim, a simple task-appropriate comparator and any reproduction result supplied by the original team, kept distinct from the independent run.", metrics: "Protocol compliance, reproducibility, comparator performance, sensitivity checks and the exact acceptance criteria declared for the evaluation.",
    findings: "PriorMoves is listed as an independent evaluation project. No completed evaluation, reproduced effect or external validation result is claimed here.", limitations: "Independence depends on evaluator separation, source identity, environment capture and publication of a complete receipt. Software tests alone cannot satisfy the evaluation claim.", program: "methods-reproducibility", verifiedAt: "2026-10-18", sourceDate: "2026-10-18", sourceNote: "Organizer-provided portfolio update recorded on 18 October 2026; no completed evaluation packet or independent result was supplied by this content update.",
  },
};

export const researchProjects: ResearchProject[] = portfolioProjects.map(project => {
  const item = details[project.id];
  return {
    slug: project.id, title: project.title, abstract: project.description, tags: project.tags,
    status: project.status === "Proposed" ? "Proposed study" : "Repository record", featured: false,
    design: "A frozen protocol, split plan and reviewable evaluation record are required before a result-bearing claim.", controls: defaultControls,
    publication: noPublication, participation: "General project interest is available; a named owner, approved scope and reviewer are required before assignment.",
    resources: project.href ? [{ label: "Source repository", href: project.href, kind: "repository" as const }] : [],
    verifiedAt: "2026-10-16", sourceDate: "2026-09-20", sourceNote: "Existing public catalog reconciled on 16 October 2026; proposal details are prospective requirements, not executed methods.",
    ...item,
  };
});

const laneRecords: Pick<ResearchProject, "slug" | "title" | "abstract" | "question" | "objective" | "topics" | "tags" | "methodology" | "data" | "baselines" | "metrics" | "limitations" | "program">[] = [
  { slug: "backtest-falsification", title: "Backtest falsification and robust evaluation", abstract: "A planned challenge to test market claims against information leakage, survivorship, costs and regime changes.", question: "Which backtest conclusions survive stronger controls?", objective: "Reward defensible negative results and explicit failure conditions.", topics: ["methods", "quantitative", "portfolio-risk"], tags: ["falsification", "leakage", "backtesting"], methodology: "A proposed frozen challenge rubric and reproducible red-team evaluation.", data: "Released sources, licensing and exact data versions remain unconfirmed.", baselines: "An original claim, simple reference strategy and controls isolating each possible failure.", metrics: "A frozen primary endpoint, robustness diagnostics and cost sensitivity are required before judging.", limitations: "Reviewers, datasets, dates and rules remain launch gates; no challenge results are published.", program: "backtest-falsification" },
  { slug: "open-markets", title: "Open Markets Lab", abstract: "A scoped markets and microstructure research lane whose activation depends on evaluation and review capacity.", question: "Can a market hypothesis survive point-in-time data and reproducibility checks?", objective: "Produce one inspectable analysis under an agreed operating specification.", topics: ["microstructure", "quantitative", "methods"], tags: ["markets", "point in time", "research challenge"], methodology: "A controlled research brief and evaluation plan; the program specification is not an experimental result.", data: "Licensed data provisioning and permitted usage must be confirmed for the actual cycle.", baselines: "Simple market or statistical reference models, selected before evaluation.", metrics: "Final endpoints and scoring await the approved brief and reviewer team.", limitations: "Existing registration does not establish a start date, staffed evaluation or an active cohort.", program: "open-markets" },
  { slug: "quantitative-markets", title: "Financial forecasting & market microstructure", abstract: "A research lane for volatility, execution, risk and forecasting, with a current protocol-control hold.", question: "Which signals remain useful when information timing and evaluation boundaries are enforced?", objective: "Repair the quant protocol before admitting broader research claims or new cohort activity.", topics: ["microstructure", "quantitative", "financial-ml"], tags: ["forecasting", "market regimes", "chronological splits"], methodology: "Bounded statistical and financial-ML studies with explicit baseline and split definitions.", data: "Each study needs licensed point-in-time provenance; a general lab description supplies no dataset permission.", baselines: "Persistence, simple statistical forecasts and a task-appropriate market baseline.", metrics: "A predeclared primary endpoint plus uncertainty and cost/risk checks where relevant.", limitations: "The operating plan records leakage-sensitive split and boundary repairs as a blocker.", program: "quantitative-markets" },
  { slug: "financial-systems-policy", title: "Financial systems, access & policy research", abstract: "A bounded policy and data lane exploring the institutions behind credit, payments, inclusion and consumer protection.", question: "How can public evidence distinguish financial access from nominal adoption?", objective: "Design useful descriptive work while preserving the limits of causal inference.", topics: ["inclusion", "public-policy", "fintech"], tags: ["policy", "payments", "financial access"], methodology: "Source-led comparative analysis with explicit definitions, sampling and missingness.", data: "Candidate public records require source, license, revision and coverage documentation.", baselines: "Comparable official measures and transparent alternative specifications.", metrics: "Coverage, comparability and predeclared access measures; no result is asserted.", limitations: "Staffing and artifact gates are not cleared for broad activation. No participant data or policy-effect estimate is displayed.", program: "financial-systems-policy" },
];
researchProjects.push(...laneRecords.map(record => ({ ...record, status: "On hold" as const, featured: false,
  design: "Protocol and operating gates must be frozen before result-bearing execution.", controls: defaultControls,
  findings: "An operating direction or brief exists; no verified empirical finding is promoted by this page.", publication: noPublication,
  participation: "Launch updates and general interest only. The operational hold remains in force.",
  resources: [{ label: "Program status and official interest route", href: `/programs/${record.program}`, kind: "program" as const }],
  verifiedAt: "2026-10-16", sourceDate: "2026-10-14", sourceNote: "Canonical operating plan and October launch inventory reconciled with current official intake on 16 October 2026.",
})));

export function filterResearch(items: ResearchProject[], query = "", topic = "all", status = "all", sort = "featured") {
  const term = query.trim().toLocaleLowerCase();
  const result = items.filter(project => (topic === "all" || project.topics.some(t => t === topic)) && (status === "all" || project.status === status)
    && [project.title, project.abstract, project.question, ...project.tags].join(" ").toLocaleLowerCase().includes(term));
  result.sort(sort === "title" ? (a, b) => a.title.localeCompare(b.title) : sort === "verified" ? (a, b) => b.sourceDate.localeCompare(a.sourceDate) || a.title.localeCompare(b.title) : (a, b) => Number(b.featured) - Number(a.featured));
  return result;
}
