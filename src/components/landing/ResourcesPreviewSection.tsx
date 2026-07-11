import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, FileText, Headphones, GraduationCap } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SectionHeader from "@/components/landing/SectionHeader";
import GlassSurface from "@/components/landing/GlassSurface";
import { portalCopy } from "@/lib/portalCopy";

const PREVIEW = [
  {
    icon: GraduationCap,
    title: "Catalyst curriculum",
    desc: "Seven modules from budgeting to research writing — track progress in the portal.",
    href: "/portal/education",
  },
  {
    icon: FileText,
    title: "Economics Journal",
    desc: "Submit opinion and market analysis for editorial review before external promotion.",
    href: "/portal/pathways/essays",
  },
  {
    icon: Headphones,
    title: "Podcasts & media",
    desc: "Founder interviews and Debriefed audio — linked from the Resources library.",
    href: "/portal/resources",
  },
  {
    icon: BookOpen,
    title: "Club toolkit",
    desc: "Month-by-month playbook for launching a Finance4All chapter at your school.",
    href: "/portal/resources",
  },
];

export default function ResourcesPreviewSection() {
  const ref = useScrollReveal();

  return (
    <section className="relative px-4 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[140px]" />
      </div>

      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeader
            align="left"
            eyebrow={portalCopy.landing.resourcesEyebrow}
            title={portalCopy.landing.resourcesTitle}
            description={portalCopy.landing.resourcesBody}
            className="max-w-xl"
          />
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition motion-safe:hover:bg-white/10"
          >
            {portalCopy.landing.resourcesCta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {PREVIEW.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} to={item.href}>
                <GlassSurface className="group flex h-full gap-4 p-6">
                  <div className="landing-glass-inner flex gap-4">
                  <div className="rounded-2xl border border-white/10 bg-emerald-500/10 p-3 text-emerald-300 transition motion-safe:group-hover:scale-105">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white motion-safe:group-hover:text-emerald-200">{item.title}</h3>
                    <p className="mt-1 text-sm text-white/50">{item.desc}</p>
                  </div>
                  </div>
                </GlassSurface>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
