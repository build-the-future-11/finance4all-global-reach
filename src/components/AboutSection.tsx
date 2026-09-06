import { Globe, Target, Users } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const pillars = [
  {
    icon: Globe,
    title: "Evidence before reach",
    description:
      "Chapters and programs remain planned until named leads and reviewable operating records exist.",
  },
  {
    icon: Target,
    title: "Applied learning",
    description:
      "The roadmap prioritizes research artifacts, case work, and practical analysis over passive completion claims.",
  },
  {
    icon: Users,
    title: "Member infrastructure",
    description:
      "The current release provides live authentication and protected workflows while program evidence is built.",
  },
];

export default function AboutSection() {
  const ref = useScrollReveal();

  return (
    <section id="about" className="relative px-4 py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 right-1/4 h-72 w-72 rounded-full bg-purple-500/15 blur-[140px]" />
      </div>

      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm uppercase tracking-widest text-emerald-300">Our mission</p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Build finance capability with evidence
          </h2>
          <p className="mt-4 text-sm text-white/70 sm:text-base">
            FinanceMeta is building a student finance platform around a simple rule: public claims
            follow reproducible work. The current release focuses on member infrastructure and an
            evidence-gated program roadmap.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.title}
                className="rounded-3xl border border-white/20 bg-white/[0.05] p-6 backdrop-blur-xl"
              >
                <div className="mb-4 inline-flex rounded-xl border border-white/20 bg-white/10 p-3 text-emerald-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-2 text-sm text-white/65">{pillar.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
