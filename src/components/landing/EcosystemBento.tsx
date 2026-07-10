import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, FlaskConical, Newspaper, Route, Users } from "lucide-react";
import { portalRoutes } from "@/routes/portal";

const MODULES = [
  {
    title: "Finance Debriefed",
    desc: "Macro pulse, IPO watchlists, live headlines, and weekly digests.",
    icon: Newspaper,
    href: portalRoutes.debriefed,
    className: "sm:col-span-2 sm:row-span-2",
    gradient: "from-emerald-500/25 via-emerald-500/5 to-transparent",
  },
  {
    title: "Meta Labs",
    desc: "Student research with verified leads.",
    icon: FlaskConical,
    href: portalRoutes.labs,
    className: "",
    gradient: "from-blue-500/20 to-transparent",
  },
  {
    title: "Axiom Pathways",
    desc: "Internships & programs.",
    icon: Route,
    href: portalRoutes.pathways,
    className: "",
    gradient: "from-purple-500/20 to-transparent",
  },
  {
    title: "Global Network",
    desc: "500+ members · chapters · introductions",
    icon: Users,
    href: portalRoutes.network,
    className: "sm:col-span-2",
    gradient: "from-amber-500/15 to-transparent",
  },
  {
    title: "Explainers",
    desc: "Finance vocabulary for everyone.",
    icon: BookOpen,
    href: portalRoutes.debriefedExplainers,
    className: "",
    gradient: "from-teal-500/20 to-transparent",
  },
];

export default function EcosystemBento() {
  return (
    <section className="relative px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400/90">
            Member ecosystem
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-5xl">
            One portal.{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-white to-blue-300 bg-clip-text text-transparent">
              Every pillar of FinanceMeta.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/55">
            The same modules powering outreach in 15+ countries — now live in your membership
            dashboard.
          </p>
        </div>

        <div className="grid auto-rows-[minmax(140px,auto)] gap-4 sm:grid-cols-3">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.title}
                to={mod.href}
                className={`landing-bento-card group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition duration-500 hover:border-white/25 hover:bg-white/[0.06] ${mod.className}`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 ${mod.gradient}`}
                />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-3 text-emerald-300 transition group-hover:scale-110 group-hover:border-emerald-400/30">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-white/20 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-400" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-white">{mod.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{mod.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
