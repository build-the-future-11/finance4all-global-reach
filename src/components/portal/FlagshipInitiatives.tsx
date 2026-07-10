import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, FlaskConical, GraduationCap, Newspaper } from "lucide-react";
import { portalRoutes } from "@/routes/portal";
import { PortalCard } from "@/components/portal/PortalUI";

const INITIATIVES = [
  {
    id: "atlas",
    icon: FlaskConical,
    eyebrow: "Research lab",
    title: "Atlas Economics Lab",
    description:
      "Quantitative macro research run by students — publication-quality work on the biggest economic questions.",
    href: `${portalRoutes.labs}?tag=macro`,
    accent: "from-blue-500/20 to-emerald-500/10",
  },
  {
    id: "cfei",
    icon: GraduationCap,
    eyebrow: "Education",
    title: "Catalyst Financial Education",
    description:
      "Expand access to finance literacy, mentorship, and career development for the next generation.",
    href: portalRoutes.debriefedExplainers,
    accent: "from-amber-500/20 to-orange-500/10",
  },
  {
    id: "debriefed",
    icon: Newspaper,
    eyebrow: "News",
    title: "Finance Debriefed",
    description:
      "Daily global economic pulse, market movers, and IPO watchlists — curated for members.",
    href: portalRoutes.debriefed,
    accent: "from-emerald-500/20 to-teal-500/10",
  },
  {
    id: "pathways",
    icon: BookOpen,
    eyebrow: "Opportunities",
    title: "Axiom Pathways",
    description:
      "Internships, research programs, and project roles from partners across startups and funds.",
    href: portalRoutes.pathways,
    accent: "from-purple-500/20 to-blue-500/10",
  },
] as const;

export default function FlagshipInitiatives() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {INITIATIVES.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.id} to={item.href}>
            <PortalCard
              hover
              className={`group h-full bg-gradient-to-br ${item.accent} p-5`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2.5 text-emerald-300 transition group-hover:border-white/20">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-emerald-400" />
              </div>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                {item.eyebrow}
              </p>
              <h3 className="mt-1 font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{item.description}</p>
            </PortalCard>
          </Link>
        );
      })}
    </div>
  );
}
