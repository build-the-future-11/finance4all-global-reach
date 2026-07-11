import { Globe2, Heart, Languages, Users } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SectionHeader from "@/components/landing/SectionHeader";
import GlassSurface from "@/components/landing/GlassSurface";

const PILLARS = [
  {
    icon: Heart,
    title: "Free and accessible",
    description:
      "Catalyst CFEI, S.I.S.T.E.R tracks, and school outreach — no program fees for students who need it most.",
  },
  {
    icon: Globe2,
    title: "Truly global",
    description:
      "Chapters across India, the UK, the US, and growing — content in plain language for every time zone.",
  },
  {
    icon: Users,
    title: "Beginner-friendly",
    description:
      "No finance background required. Explainers, lesson modules, and chapter mentors meet you where you are.",
  },
  {
    icon: Languages,
    title: "Multilingual outreach",
    description:
      "Grassroots literacy programs adapted for local schools — scaling the model that started in India.",
  },
];

export default function InclusiveImpactSection() {
  const ref = useScrollReveal();

  return (
    <section className="relative px-4 py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Inclusion first"
          title="Built for students without a finance class"
          description="Finance4All started with school outreach where economics was not on the syllabus. The portal keeps that same bar: free access, plain language, and chapter support when you need it."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <GlassSurface key={p.title} className="group p-6" strong>
                <div className="landing-glass-inner">
                <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-emerald-500/10 p-3 text-emerald-300 transition motion-safe:group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{p.description}</p>
                </div>
              </GlassSurface>
            );
          })}
        </div>
      </div>
    </section>
  );
}
