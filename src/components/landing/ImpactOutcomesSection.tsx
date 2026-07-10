import { Link } from "react-router-dom";
import { FileText, GraduationCap, Microscope } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { portalRoutes } from "@/routes/portal";

const OUTCOMES = [
  {
    icon: GraduationCap,
    stat: "25,000+",
    label: "Students in outreach",
    detail:
      "Volunteer-led Catalyst sessions on budgeting, banking, and investing — delivered in schools across India and expanding through chapter-led workshops abroad.",
    href: portalRoutes.education,
    cta: "Catalyst curriculum",
  },
  {
    icon: Microscope,
    stat: "Atlas Lab",
    label: "Macro research track",
    detail:
      "Students work on FX pass-through, inflation dynamics, and emerging-market policy with mentor review. Outputs aim for publication, not portfolio padding.",
    href: portalRoutes.labs,
    cta: "Browse open projects",
  },
  {
    icon: FileText,
    stat: "Economics Journal",
    label: "Student writing pipeline",
    detail:
      "Opinion and market analysis edited to external standards. Strong pieces are promoted beyond the portal — the bar is clarity and evidence, not word count.",
    href: `${portalRoutes.pathways}/essays`,
    cta: "Submission standards",
  },
];

export default function ImpactOutcomesSection() {
  const ref = useScrollReveal();

  return (
    <section className="relative px-4 py-28 sm:py-36">
      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-400/90">
              Outcomes
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Programs members actually use
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-white/45">
            Each track below links to a live module in the portal — not a landing-page promise.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {OUTCOMES.map((o) => {
            const Icon = o.icon;
            return (
              <article
                key={o.label}
                className="flex flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-7 transition hover:border-white/18"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-right text-2xl font-bold tabular-nums text-white">{o.stat}</p>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">{o.label}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">{o.detail}</p>
                <Link
                  to={o.href}
                  className="mt-6 inline-flex text-sm font-medium text-emerald-300 transition hover:text-emerald-200"
                >
                  {o.cta} →
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
