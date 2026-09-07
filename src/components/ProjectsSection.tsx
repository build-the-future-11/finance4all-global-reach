import { Link } from "react-router-dom";
import { ArrowRight, BookOpenText, BriefcaseBusiness, FlaskConical, Newspaper } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { portalRoutes } from "@/routes/portal";

const FINANCEMETA_APPLICATION_URL =
  "https://tally.so/r/5B7blP?utm_source=website&utm_medium=cta&utm_campaign=general_application";

const directApplications = [
  {
    label: "General application",
    description: "Get routed to the FinanceMeta team or program that best matches your interests and skills.",
    url: "https://tally.so/r/5B7blP?utm_source=website&utm_medium=opportunity_card&utm_campaign=general_application",
  },
  {
    label: "Launch a chapter",
    description: "Build an official FinanceMeta chapter at your school, university, or in your city.",
    url: "https://tally.so/r/XxaB1j?utm_source=website&utm_medium=opportunity_card&utm_campaign=chapter_registration",
  },
  {
    label: "Quant Research Cohort",
    description: "Work on quantitative finance, markets, data, modeling, and financial ML research.",
    url: "https://tally.so/r/xXqylk?utm_source=website&utm_medium=opportunity_card&utm_campaign=quant_research_cohort",
  },
  {
    label: "Financial Foundations Cohort",
    description: "Build strong foundations across finance, economics, markets, and applied financial thinking.",
    url: "https://tally.so/r/q4rLG9?utm_source=website&utm_medium=opportunity_card&utm_campaign=financial_foundations",
  },
  {
    label: "FinTech Studio",
    description: "Build financial products, tools, prototypes, and research-to-product experiments.",
    url: "https://tally.so/r/Me4d6p?utm_source=website&utm_medium=opportunity_card&utm_campaign=fintech_studio",
  },
  {
    label: "Partners, speakers & collaborators",
    description: "For schools, researchers, founders, organizations, speakers, and potential partners.",
    url: "https://tally.so/r/2EWxzb?utm_source=website&utm_medium=opportunity_card&utm_campaign=partnerships",
  },
] as const;

const phaseOneModules = [
  {
    icon: Newspaper,
    title: "Finance Debriefed",
    href: portalRoutes.debriefed,
    summary: "Global macro updates, market movers, and IPO watchlists in one place.",
    bullets: ["Daily global economic pulse", "Gainers/losers tracker", "IPO + company spotlight"],
  },
  {
    icon: BookOpenText,
    title: "Intro to Finance",
    href: portalRoutes.debriefedExplainers,
    summary: "Beginner-friendly explainers for core buzzwords and current finance narratives.",
    bullets: ["What is an IPO?", "Why sectors move", "Build your finance vocabulary"],
  },
  {
    icon: FlaskConical,
    title: "Finance Meta Labs",
    href: portalRoutes.labs,
    summary: "Research project directory with verified lead researchers and open applications.",
    bullets: ["Lead researcher verification", "Student application flow", "Professor + student collaboration"],
  },
  {
    icon: BriefcaseBusiness,
    title: "Axiom Pathways",
    href: portalRoutes.pathways,
    summary: "Opportunity board for internships, programs, and project-based roles.",
    bullets: ["Internship opportunities", "Curated pathways", "Apply and track interest"],
  },
];

export default function ProjectsSection() {
  const ref = useScrollReveal();

  return (
    <section id="projects" className="relative px-4 py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-emerald-500/20 blur-[140px]" />
        <div className="absolute right-1/4 bottom-10 h-80 w-80 rounded-full bg-blue-500/20 blur-[160px]" />
      </div>

      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm uppercase tracking-widest text-emerald-300">Phase 1 Build</p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Membership Portal Foundations
          </h2>
          <p className="mt-4 text-sm text-white/70 sm:text-base">
            An early-access release focused on content, opportunities, and research workflows.
            Empty datasets remain visibly empty; availability is not presented as impact.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {phaseOneModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.title}
                to={module.href}
                className="block rounded-3xl border border-white/20 bg-white/[0.05] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/35"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{module.title}</h3>
                </div>

                <p className="text-sm text-white/75">{module.summary}</p>

                <ul className="mt-4 space-y-2 text-sm text-white/70">
                  {module.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </Link>
            );
          })}
        </div>

        <div
          id="join"
          className="mt-10 flex flex-col items-start justify-between gap-4 rounded-3xl border border-white/20 bg-gradient-to-r from-white/10 to-white/[0.04] p-6 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/90">
              Join FinanceMeta
            </p>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              Apply for research, FinTech Studio, publications, chapters, workshops, and other
              active contributor opportunities. Existing members can use the portal separately.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={FINANCEMETA_APPLICATION_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-black transition hover:bg-white"
            >
              Apply to FinanceMeta
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Create portal account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-2 py-2 text-sm font-medium text-white/70 transition hover:text-white"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div id="applications" className="mt-8">
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/90">Direct applications</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Choose the path that matches what you want to do.</h3>
            </div>
            <p className="max-w-xl text-sm text-white/60">
              Use the general application if you are unsure. Otherwise, applying directly keeps review and routing faster.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {directApplications.map((application) => (
              <a
                key={application.label}
                href={application.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-white/15 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-emerald-300/50 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-semibold text-white">{application.label}</h4>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300 transition group-hover:translate-x-1" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{application.description}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
