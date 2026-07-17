import { Link } from "react-router-dom";
import { FileText, GraduationCap, Microscope } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SectionHeader from "@/components/landing/SectionHeader";
import { portalRoutes } from "@/routes/portal";
import { portalCopy } from "@/lib/portalCopy";
import GlassSurface from "@/components/landing/GlassSurface";
import { signupWithNext } from "@/lib/memberEntry";

const OUTCOMES = [
  {
    icon: GraduationCap,
    stat: "Lessons",
    label: "Outreach and learning",
    detail:
      "Beginner lessons on budgeting, banking, investing, macro, markets, research, and writing — tracked through member progress.",
    href: signupWithNext(portalRoutes.education),
    cta: "Catalyst curriculum",
  },
  {
    icon: Microscope,
    stat: "Projects",
    label: "Research applications",
    detail:
      "Approved projects list scope, expectations, deadlines, and review status before a member applies.",
    href: signupWithNext(portalRoutes.labs),
    cta: "Browse open projects",
  },
  {
    icon: FileText,
    stat: "Writing",
    label: "Student submissions",
    detail:
      "Educational analysis and member writing are reviewed for thesis clarity, cited evidence, and appropriate disclaimers.",
    href: signupWithNext(`${portalRoutes.pathways}/essays`),
    cta: "Submission standards",
  },
];

export default function ImpactOutcomesSection() {
  const ref = useScrollReveal();

  return (
    <section className="relative px-4 py-28 sm:py-36">
      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            align="left"
            eyebrow={portalCopy.landing.impactEyebrow}
            title={portalCopy.landing.impactTitle}
            className="max-w-2xl"
          />
          <p className="max-w-sm text-sm leading-relaxed text-white/45">
            {portalCopy.landing.impactAside}
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {OUTCOMES.map((o) => {
            const Icon = o.icon;
            return (
              <GlassSurface key={o.label} className="flex flex-col p-7" strong>
                <div className="landing-glass-inner flex flex-1 flex-col">
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
                </div>
              </GlassSurface>
            );
          })}
        </div>
      </div>
    </section>
  );
}
