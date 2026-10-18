/** Public descriptions only. Intake availability never establishes operating readiness. */
export const programStatuses = ["Planned", "Interest open", "Applications open", "Applications closed", "Active", "Completed", "On hold", "Archived"] as const;
export type ProgramStatus = typeof programStatuses[number];
export const programFamilies = ["Education", "Research", "Publishing", "Competitions", "Build", "Community & growth"] as const;
export type ProgramFamily = typeof programFamilies[number];
export interface ProgramAction {
  kind: "interest" | "screening" | "application" | "resource";
  label: string;
  href: string;
  verifiedAt: string;
  available: boolean;
}
export interface Program {
  slug: string;
  title: string;
  aliases: string[];
  family: ProgramFamily;
  organization: string;
  summary: string;
  purpose: string;
  deliverable: string;
  status: ProgramStatus;
  readiness: string;
  audience: string;
  eligibility: string;
  commitment: string;
  format: string;
  dates: string;
  selection: string;
  action?: ProgramAction;
  research: string[];
  related: { label: string; href: string }[];
  source: { title: string; href: string };
  verifiedAt: string;
}

// Connected Tally metadata + form ledger checked 2026-10-16. No responses were read.
export const CONSOLIDATED_INTEREST_URL = "https://tally.so/r/kbayyj";
const interest: ProgramAction = { kind: "interest", label: "Express interest", href: CONSOLIDATED_INTEREST_URL, verifiedAt: "2026-10-16", available: true };
const source = { title: "Official FinanceMeta / Finance4All / IYERN intake", href: CONSOLIDATED_INTEREST_URL };
const defaults = {
  aliases: [], organization: "FinanceMeta", status: "Interest open", commitment: "Not announced; agree a bounded scope before participating.",
  format: "Online interest intake; delivery arrangements are confirmed separately.", dates: "Not announced",
  eligibility: "Final age, location and participation terms are not announced. Guardian or school permission is required where applicable.",
  selection: "Interest is reviewed for fit and available capacity. Submission is not acceptance, a role, or a confirmed place.",
  action: interest, research: [], related: [], source, verifiedAt: "2026-10-16",
} satisfies Partial<Program>;
type ProgramRecord = Pick<Program, "slug" | "title" | "family" | "summary" | "purpose" | "deliverable" | "readiness" | "audience"> & Partial<Program>;
const records: ProgramRecord[] = [
  {
    slug: "financial-foundations", title: "Financial Foundations", aliases: ["Curriculum and Education Resources", "Digital courses"], family: "Education", organization: "Finance4All",
    summary: "Open learning in money, markets, economics, financial systems and evidence.",
    purpose: "Build the vocabulary and source-reading habits needed to make sense of everyday financial decisions.",
    deliverable: "Self-directed reading and practice; no course certificate or completion is implied.",
    status: "Active", readiness: "Open educational pages are available. A staffed cohort, schedule and admission cycle are not confirmed.",
    audience: "Students and independent learners; educators selecting introductory resources.",
    eligibility: "Open educational reading. No paid membership is required.", commitment: "Self-paced; choose a topic and return when useful.", format: "Online, self-directed", dates: "Ongoing open resources",
    action: { kind: "resource", label: "Start learning", href: "/learn/five-foundations", verifiedAt: "2026-10-16", available: true },
    related: [{ label: "Finance Debriefed", href: "/debriefed" }], source: { title: "Open learning library", href: "/learn" },
  },
  {
    slug: "finance4-impact", title: "Finance4 Impact", aliases: ["Financial Literacy Workshops", "School and Community Pilots", "School visits", "Global literacy outreach"], family: "Education", organization: "Finance4All",
    summary: "Small school and community pilots built around useful financial decisions.",
    purpose: "Connect a defined audience and learning need with a facilitator, suitable curriculum and measured follow-up.",
    deliverable: "A scoped workshop plan, permissions, learning evidence and a post-session review before repeat delivery.",
    readiness: "Interest only. Facilitator capacity, local permissions, safeguarding and measurement must be confirmed before a pilot.",
    audience: "Schools, educators, community organizers and volunteers.", related: [{ label: "Learning resources", href: "/learn" }, { label: "Events", href: "/events" }],
  },
  {
    slug: "chapters", title: "International Chapters & Affiliate Clubs", aliases: ["Clubs and chapters", "School clubs"], family: "Education", organization: "Finance4All",
    summary: "Propose a locally useful finance learning community with an accountable organizer.",
    purpose: "Support recurring local activity with permission, a starter plan, transparent evidence and central approval.",
    deliverable: "A first verified activity, an accepted owner and an operating record before active chapter status.",
    readiness: "A city pin or form submission is an expression of interest. Affiliation and activation require separate review.",
    audience: "School, university and community teams with a prospective local organizer.", related: [{ label: "Global chapter directory", href: "/chapters" }],
  },
  {
    slug: "finance-meta-labs", title: "FinanceMeta Labs", family: "Research",
    summary: "The research division connecting explicit questions, frozen evaluation and reviewable artifacts.",
    purpose: "Organize empirical research around provenance, baselines, falsification and independent review.",
    deliverable: "A protocol, reproducible artifact, limitations and review record.", status: "Active",
    readiness: "The operating plan records active Labs work with incomplete control-role capacity. Broad cohort activation remains gated.",
    audience: "Researchers, students, research engineers and qualified reviewers.", research: ["fi-jepa", "eigen-jepa", "eigenfinance"], related: [{ label: "Research directory", href: "/research" }],
  },
  {
    slug: "quantitative-markets", title: "Quantitative Markets & Microstructure", family: "Research",
    summary: "Market structure, volatility, forecasting, execution and robust backtesting.",
    purpose: "Evaluate market hypotheses under realistic information timing, costs and chronological validation.", deliverable: "A bounded reproducible analysis with leakage checks and preserved null results.",
    status: "On hold", readiness: "Cohort activation awaits leakage-sensitive split and boundary repairs, owners and review capacity. Interest intake remains available.",
    audience: "Contributors comfortable with quantitative reasoning and reproducible analysis.", research: ["quantitative-markets", "eigenfinance"],
  },
  {
    slug: "financial-systems-policy", title: "Financial Systems, Access & Policy", family: "Research",
    summary: "Study payments, credit, financial inclusion and the institutions shaping access.",
    purpose: "Separate adoption from reliability, consumer protection and measurable access.", deliverable: "A source-led research note with explicit scope, privacy controls and causal-claim limits.",
    status: "On hold", readiness: "The lane remains bounded until staffing and artifact gates are accepted; no new cohort is promised.",
    audience: "Economics, public-policy and data researchers.", research: ["financial-systems-policy", "digital-payments-access"],
  },
  {
    slug: "open-markets", title: "Open Markets Lab / Challenge 001", aliases: ["Open Markets Challenge 001", "Open Markets Lab", "Quant Arena 2026 (unconfirmed event concept)"], family: "Competitions",
    summary: "A scoped markets research challenge with an operating specification and an unresolved launch gate.",
    purpose: "Build and test a market hypothesis with documented data and point-in-time controls.", deliverable: "A reproducible research artifact assessed under a frozen rubric.",
    status: "On hold", readiness: "Evaluator and reviewer team, dates, licensed data provisioning and public rules remain unconfirmed. An existing registration form does not lift this hold.",
    audience: "Prospective student research teams; final eligibility is pending.", research: ["open-markets"], action: { ...interest, label: "Request launch updates" }, related: [{ label: "Event schedule and holds", href: "/events" }],
  },
  {
    slug: "methods-reproducibility", title: "Research Methods & Reproducibility", aliases: ["Replication notes", "Negative-results research", "Research tools and open-source contributions"], family: "Research",
    summary: "Learn to make a research claim inspectable, repeatable and open to correction.",
    purpose: "Prepare methods notes, replications and negative-result reports with an explicit evidence boundary.", deliverable: "Versioned code and data provenance, a reproduction guide and a limitations statement.",
    readiness: "Public evidence standards are available; contributor assignments and review capacity are confirmed individually.",
    audience: "Students, researchers and contributors interested in evaluation or research engineering.", related: [{ label: "Research standards", href: "/evidence" }, { label: "Preprint pathway", href: "/programs/preprint-forum" }],
  },
  {
    slug: "student-research", title: "Student Research Projects", aliases: ["Member research participation"], family: "Research",
    summary: "Match a specific contribution to a question, owner and reviewer.",
    purpose: "Help contributors move from general interest to a bounded first artifact.", deliverable: "An agreed research note, analysis, code contribution or replication with review.",
    readiness: "Matching interest is open. A member account or application is not a project assignment.",
    audience: "Students and early researchers able to propose a concrete contribution.", related: [{ label: "Public projects", href: "/research" }, { label: "My Research (sign in required)", href: "/portal/my-research" }],
  },
  {
    slug: "iyer-journal", title: "IYER Research Journal", aliases: ["IYER Journal", "IYERJ", "Economics journal"], family: "Publishing", organization: "IYERN / FinanceMeta",
    summary: "A journal pathway for careful economics and finance research, subject to editorial screening and independent review.",
    purpose: "Build an authorized publication record for empirical work, theory, replications, null results and methods notes.", deliverable: "A manuscript with author contributions, references, methods, limitations and permissions.",
    status: "Applications open", readiness: "Manuscript screening is open for an inaugural edition targeted for 1 December 2026. No articles are authorized in this site's archive; completed review, author permissions and editorial authorization remain separate gates.",
    audience: "Authors of economics and finance research; institutional affiliation is not required.",
    eligibility: "All authors must approve submission and have rights to share materials. Guardian permission is required for authors under 18 where applicable.",
    dates: "Inaugural edition target: December 1, 2026. The manuscript cutoff and final publication date remain subject to editorial readiness and accepted-paper review.",
    selection: "Initial screening is followed by editorial decisions, independent review and revision where commissioned. No acceptance, DOI, ISSN or mentorship placement is guaranteed.",
    action: { ...interest, kind: "screening", label: "Submit for editorial screening" }, related: [{ label: "Journal and author guidance", href: "/iyern/journal" }],
  },
  {
    slug: "preprint-forum", title: "IYERN Preprint Forum", family: "Publishing", organization: "IYERN",
    summary: "Working papers, replications, methods notes and negative results, screened before public posting.",
    purpose: "Give early research a clearly labeled place for discussion and revision.", deliverable: "A versioned manuscript, abstract, sources, author permission and declared limitations.",
    status: "Applications open", readiness: "Screening intake is open. Preprints are not peer-reviewed journal publications and posting is never automatic.",
    audience: "Authors with a working economics or finance manuscript.",
    eligibility: "Coauthor consent, rights to share and confidentiality clearance are required. Follow the form's guardian-permission instructions where relevant.",
    action: { kind: "screening", label: "Submit a preprint for screening", href: "https://tally.so/r/RGXXLJ", verifiedAt: "2026-10-16", available: true },
    source: { title: "Official IYERN preprint submission form", href: "https://tally.so/r/RGXXLJ" }, related: [{ label: "Preprint archive and guidelines", href: "/iyern/forum" }],
  },
  {
    slug: "research-fellowship", title: "IYER Research Fellowship", aliases: ["IYER Fellowship", "IYERN Research Fellowship"], family: "Research", organization: "IYERN / FinanceMeta",
    summary: "A future cohort focused on producing a defensible research artifact.",
    purpose: "Connect research tracks, project matching and a structured revision process.", deliverable: "A reproducible final research artifact; the approved cohort specification is pending.",
    readiness: "Future cohort interest only. Dates, selection criteria, time commitment and mentoring capacity are not confirmed.",
    audience: "Emerging researchers interested in quantitative finance, development, computation or policy.",
  },
  {
    slug: "global-research-challenge", title: "FinanceMeta Grand Research Challenge", aliases: ["IYERN Global Research Challenge", "FinanceMeta Global Research Challenge"], family: "Competitions", organization: "IYERN / FinanceMeta",
    summary: "A proposed international challenge for falsifiable questions and transparent research.",
    purpose: "Reward careful methods, useful evidence and honest limitations.", deliverable: "A research submission under rules that must be finalized before entries open.",
    readiness: "Updates only. Eligibility, dates, judges, prizes and partner arrangements are not announced.",
    audience: "Prospective economics and finance research participants.", action: { ...interest, label: "Request challenge updates" }, related: [{ label: "Challenge information", href: "/iyern/challenge" }],
  },
  {
    slug: "editorial-reviewers", title: "Founding Editors & Reviewer Pool", family: "Publishing", organization: "IYERN",
    summary: "Interest in methods review, editorial production and research-integrity work.",
    purpose: "Develop a small review cell with expertise, capacity and conflict checks.", deliverable: "A bounded review or editorial trial assessed before appointment.",
    readiness: "Interest only. No editorial-board membership or reviewer appointment is automatic.", audience: "Qualified reviewers, editors and research-integrity contributors.",
    selection: "Expertise, confidentiality, conflicts and capacity are assessed before a trial or appointment.",
  },
  {
    slug: "investment-model-challenge", title: "Global Investment Model Challenge 2026", aliases: ["Investment / Quantitative Competition", "Finance / Investment Case Challenge"], family: "Competitions", organization: "Finance4All",
    summary: "A proposed challenge for a transparent financial decision model, including spreadsheets.",
    purpose: "Assess assumptions, sources, baseline comparisons, sensitivity and reproducibility.", deliverable: "A model or notebook with source timing, risks and clear limits; final rules are pending.",
    status: "On hold", readiness: "Submission form remains a draft. Rules, deadlines, judging and eligibility are not frozen.", audience: "Prospective individual or team entrants; a spreadsheet is an intended option.",
    action: { ...interest, label: "Request rules and launch updates" },
  },
  {
    slug: "backtest-falsification", title: "Backtest Falsification Challenge", family: "Competitions", organization: "FinanceMeta Labs",
    summary: "Test whether a market claim survives the controls that backtests can omit.",
    purpose: "Investigate leakage, survivorship, information timing, transaction costs and regime changes.", deliverable: "A reproducible falsification or robustness report; null results count.",
    status: "On hold", readiness: "Reviewer capacity, licensed sources, fixed rubric and dates remain gates. The dedicated application form is a draft.",
    audience: "Prospective research teams interested in robust evaluation.", action: { ...interest, label: "Request challenge updates" }, research: ["backtest-falsification"],
  },
  {
    slug: "fintech-studio", title: "FinTech Studio", aliases: ["Point-in-Time Market Data Integrity Toolkit", "Studio 01", "Approved finance technology projects", "Research Engineering", "Data Infrastructure", "FinTech Studio Buildathon (unconfirmed event concept)"], family: "Build",
    summary: "One priority build: a deterministic, read-only historical market-data integrity checker.",
    purpose: "Detect malformed or suspicious OHLCV files before downstream research begins.", deliverable: "A reproducible toolkit and frozen benchmark. It does not repair data, forecast, trade or certify universal point-in-time safety.",
    status: "On hold", readiness: "The first brief is scoped. Studio leadership, builders, independent review and a canonical repository remain staffing/release gates.",
    audience: "Research engineers, data-tool builders, testers and independent reviewers.", related: [{ label: "Methods and reproducibility", href: "/programs/methods-reproducibility" }],
  },
  {
    slug: "axiom-pathways", title: "Axiom Pathways", family: "Community & growth",
    summary: "Explore research, education and project opportunities with explicit provider requirements.",
    purpose: "Connect interests with a practical next contribution while keeping selection and acceptance separate.", deliverable: "An evidence-based opportunity shortlist or application; no admission, employment or funding promise.",
    status: "Planned", readiness: "The member opportunity board exists. A complete pathway syllabus and completion standard have not been verified.",
    audience: "Members exploring their next research or learning step.", action: { kind: "resource", label: "Explore member opportunities", href: "/portal/pathways", verifiedAt: "2026-10-16", available: true },
    source: { title: "FinanceMeta program evidence registry", href: "https://github.com/build-the-future-11/FinanceMeta-Global/blob/main/registry/programs.json" },
  },
  {
    slug: "debriefed-contributors", title: "Finance Debriefed Contributors", aliases: ["FinanceMeta Debrief", "Finance Debriefs"], family: "Publishing",
    summary: "Contribute independently sourced explanations of economics, financial systems and research.",
    purpose: "Translate complex claims into readable work that survives factual and research review.", deliverable: "A draft, claim/source ledger, attribution and corrections history.",
    status: "Applications open", readiness: "Editorial proposals are accepted for review. Submission does not authorize publication; Issue 001 remains under review gates.",
    audience: "Writers, research explainers, fact-checkers and editorial contributors.", action: { ...interest, kind: "screening", label: "Submit an editorial proposal" }, related: [{ label: "Read Finance Debriefed", href: "/debriefed" }],
  },
  {
    slug: "regional-research-networks", title: "European & Gulf Finance Research Networks", aliases: ["European Finance Research Network", "Gulf Finance Research Network", "International research networks"], family: "Research", organization: "FinanceMeta",
    summary: "Regional research networks being developed to turn international interest into practical projects and working teams.",
    purpose: "Connect researchers in Europe, the Gulf and other regions around scoped finance and economics questions with accountable ownership.",
    deliverable: "A defined regional project, named working team, research protocol and inspectable output before an operating-network claim is made.",
    readiness: "Network development and contributor matching are progressing. Regional interest does not yet establish an operating chapter, confirmed team or completed project.",
    audience: "Researchers, students, reviewers and regional organizers able to support a concrete finance or economics project.",
    related: [{ label: "Research directory", href: "/research" }, { label: "International chapters", href: "/chapters" }],
  },
  {
    slug: "union-collaborations", title: "The Union & Scoped Collaborations", aliases: ["Industry research projects", "Live industry projects", "Founder Network", "YEFA", "FFI", "YIS", "Bay Area Stock Pitch", "YEL", "NSRI"], family: "Community & growth",
    summary: "Develop a written, bounded collaboration around an actual problem and useful output, including the current YEFA, FFI, YIS, YEL and NSRI discussion pipeline.",
    purpose: "Agree responsibility, source rights, review and delivery before naming an institutional relationship.", deliverable: "An approved scope, documented exchange and reviewable handover.",
    readiness: "YEFA opportunity sharing, FFI education materials and YIS work connected to the Bay Area Stock Pitch are proposed collaboration areas. YEL, NSRI and international researcher conversations remain exploratory. None is presented as a formal partnership without written scope and a delivered or accepted contribution.",
    audience: "Educators, institutions, researchers and organizations with a concrete need.", action: { ...interest, href: "https://tally.so/r/obWxvN", label: "Propose a collaboration" }, source: { title: "Official research, programs and partnership intake", href: "https://tally.so/r/obWxvN" },
  },
  {
    slug: "mentors-and-leadership", title: "Mentors, Speakers & Program Contributors", aliases: ["Verified leadership opportunities", "Program operations"], family: "Community & growth",
    summary: "Offer bounded expertise in teaching, review, public discussion or program operations.",
    purpose: "Build capacity through explicit responsibilities and evidence-based trials.", deliverable: "An agreed review, talk, learning resource or operational artifact.",
    readiness: "Interest only. Mentorship capacity and leadership appointments require acceptance and an agreed scope.",
    audience: "Educators, professionals, reviewers and experienced contributors.",
  },
  {
    slug: "queued-directions", title: "Future Program Directions", aliases: ["SISTER", "Zenipath", "Student podcast", "Economics Olympiad pathway", "FinanceMeta Essay Prize", "Venture Research", "Startup Diligence", "Interviews", "Videos", "Women in Finance (future pathway)"], family: "Community & growth",
    summary: "A consolidated record of earlier program concepts retained for continuity.",
    purpose: "Keep the summer institute, learning-game, podcast, competition-preparation and venture-research ideas visible without presenting new operating programs.",
    deliverable: "Each concept needs an accepted owner, a bounded brief and review capacity before activation.",
    status: "Planned", readiness: "These are queued concepts. No cohort, playable game, recordings, confirmed competition, investment offering or named roster is verified.",
    audience: "Readers researching the wider FinanceMeta program architecture.", action: undefined,
    source: { title: "FinanceMeta program architecture", href: "https://finance-meta-landing.vercel.app/" },
  },
];
export const programs: Program[] = records.map(record => ({ ...defaults, ...record }));

export function getProgramAction(program: Program): ProgramAction | undefined {
  const action = program.action;
  if (!action?.available || !action.verifiedAt) return undefined;
  if (action.kind !== "resource" && (program.status === "Archived" || program.status === "Completed")) return undefined;
  const safeInternal = action.href.startsWith("/") && !action.href.startsWith("//");
  const safeExternal = /^https:\/\/tally\.so\/r\/[A-Za-z0-9]+$/.test(action.href);
  if (!safeInternal && !safeExternal) return undefined;
  if ((action.kind === "application" || action.kind === "screening") && program.status !== "Applications open") return undefined;
  return action;
}

export function filterPrograms(items: Program[], query = "", family = "all", status = "all", sort = "featured") {
  const term = query.trim().toLocaleLowerCase();
  const result = items.filter(program => (family === "all" || program.family === family) && (status === "all" || program.status === status)
    && [program.title, ...program.aliases, program.summary, program.purpose, program.audience].join(" ").toLocaleLowerCase().includes(term));
  if (sort === "title") result.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "verified") result.sort((a, b) => b.verifiedAt.localeCompare(a.verifiedAt) || a.title.localeCompare(b.title));
  return result;
}
