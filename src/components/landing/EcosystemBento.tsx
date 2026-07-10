import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Newspaper,
  Route,
  Users,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SectionHeader from "@/components/landing/SectionHeader";
import { portalRoutes } from "@/routes/portal";

const MODULES = [
  {
    title: "Finance Debriefed",
    desc: "Macro pulse, IPO watchlists, live headlines, and member explainers — the reading list before your chapter meeting.",
    icon: Newspaper,
    href: portalRoutes.debriefed,
    tag: "News",
    className: "sm:col-span-2 sm:row-span-2",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  },
  {
    title: "Meta Labs",
    desc: "Apply to mentor-led research. Atlas, IYERN, fintech — each project has a lead and a deliverable.",
    icon: FlaskConical,
    href: portalRoutes.labs,
    tag: "Research",
    className: "",
    gradient: "from-blue-500/18 to-transparent",
  },
  {
    title: "Axiom Pathways",
    desc: "Internships, competitions, essay submissions, and office hours for career strategy.",
    icon: Route,
    href: portalRoutes.pathways,
    tag: "Opportunities",
    className: "",
    gradient: "from-violet-500/18 to-transparent",
  },
  {
    title: "Global Network",
    desc: "Member directory, warm introductions, chapter pages, and collaboration matching.",
    icon: Users,
    href: portalRoutes.network,
    tag: "Community",
    className: "sm:col-span-2",
    gradient: "from-amber-500/12 to-transparent",
  },
  {
    title: "Catalyst Education",
    desc: "Full lesson library with exercises — the same material volunteers teach in outreach.",
    icon: GraduationCap,
    href: portalRoutes.education,
    tag: "Curriculum",
    className: "",
    gradient: "from-teal-500/15 to-transparent",
  },
  {
    title: "Resources",
    desc: "Club toolkit, facilitator guides, journal standards, webinars, and partner programs.",
    icon: BookOpen,
    href: portalRoutes.resources,
    tag: "Guides",
    className: "",
    gradient: "from-rose-500/12 to-transparent",
  },
];

export default function EcosystemBento() {
  const ref = useScrollReveal();

  return (
    <section className="relative px-4 py-28 sm:py-36">
      <div ref={ref} className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Member portal"
          title="Seven modules. One login."
          description="Everything on this page exists inside the portal — sign in to read Debriefed, apply to labs, or RSVP to your chapter's next event."
        />

        <div className="mt-14 grid auto-rows-[minmax(150px,auto)] gap-4 sm:grid-cols-3">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.title}
                to={mod.href}
                className={`landing-bento-card group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-xl transition duration-500 hover:border-white/22 hover:bg-white/[0.05] ${mod.className}`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90 ${mod.gradient}`}
                />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/45">
                      {mod.tag}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-white/20 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-400" />
                  </div>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-emerald-300 w-fit transition group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{mod.title}</h3>
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
