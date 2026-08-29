import { BookOpen, FlaskConical, Globe } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SectionHeader from "@/components/landing/SectionHeader";
import { portalCopy } from "@/lib/portalCopy";
import GlassSurface from "@/components/landing/GlassSurface";

const pillars = [
  {
    icon: Globe,
    number: "01",
    title: "Chapters on the ground",
    description:
      "Chapter pages help local organizers publish updates, events, and resources. Members see what is active without confusing an empty chapter record for a live program.",
  },
  {
    icon: FlaskConical,
    number: "02",
    title: "Research with reviewers",
    description:
      "Research projects define their scope, deadline, and application expectations before members apply. Leads review submissions only for projects they are allowed to manage.",
  },
  {
    icon: BookOpen,
    number: "03",
    title: "Writing that ships",
    description:
      "Finance Debrief and member writing stay educational. Editors ask for source support before publishing claims beyond basic explanation.",
  },
];

export default function AboutSection() {
  const ref = useScrollReveal();

  return (
    <section id="about" className="relative px-4 py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-[140px]" />
      </div>

      <div ref={ref} className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="What we build"
          title={
            <>
              What chapters, labs, and editors{" "}
              <span className="text-emerald-300/95">actually run</span>
            </>
          }
          description="FinanceMeta brings financial education, a member portal, research workflows, opportunities, and chapter activity into one system. The through-line is practical: learn the basics, save useful reading, apply to real projects, and follow what your chapter publishes."
        />
        <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-white/45">
          {portalCopy.landing.aboutSubtext}
        </p>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <GlassSurface key={pillar.title} className="p-7" strong>
                <div className="landing-glass-inner relative">
                  <div className="absolute -right-2 -top-2 font-mono text-7xl font-bold text-white/[0.04]">
                    {pillar.number}
                  </div>
                  <div className="relative">
                    <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/[0.08] p-3 text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/58">{pillar.description}</p>
                  </div>
                </div>
              </GlassSurface>
            );
          })}
        </div>
      </div>
    </section>
  );
}
