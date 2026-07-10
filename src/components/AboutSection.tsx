import { BookOpen, FlaskConical, Globe } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SectionHeader from "@/components/landing/SectionHeader";
import GlassSurface from "@/components/landing/GlassSurface";

const pillars = [
  {
    icon: Globe,
    number: "01",
    title: "Chapters on the ground",
    description:
      "Faculty-backed clubs run Catalyst workshops, host Markets 101 nights, and report attendance back to the network. Mumbai, London, and New York chapters share one portal — not three disconnected WhatsApp groups.",
  },
  {
    icon: FlaskConical,
    number: "02",
    title: "Research with reviewers",
    description:
      "Meta Labs pairs students with lead researchers on publication-oriented projects. Applications are read by humans. Atlas Economics Lab, IYERN, and fintech tracks each have defined deliverables — not open-ended \"internship\" listings.",
  },
  {
    icon: BookOpen,
    number: "03",
    title: "Writing that ships",
    description:
      "The Economics Journal takes opinion and market analysis from members worldwide. Editors work to external standards before pieces are promoted. Pathways handles submissions; Debriefed handles the reading list.",
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
              Infrastructure for students who take{" "}
              <span className="text-emerald-300/95">markets seriously</span>
            </>
          }
          description="Finance4All Meta is a nonprofit network — outreach programs, a member portal, and chapter events designed so a first budgeting lesson can lead to a published macro note."
        />

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
