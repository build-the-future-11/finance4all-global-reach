import { Globe, Target, Users } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const pillars = [
  {
    icon: Globe,
    title: "Global reach",
    description:
      "Chapters and programs spanning schools, universities, and communities worldwide — making finance education accessible everywhere.",
  },
  {
    icon: Target,
    title: "Applied learning",
    description:
      "From research labs and case competitions to real market analysis — members learn by doing, not just reading.",
  },
  {
    icon: Users,
    title: "Member-driven",
    description:
      "A growing network of students and researchers collaborating on projects, opportunities, and local events.",
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
            Finance education for everyone, everywhere
          </h2>
          <p className="mt-4 text-sm text-white/70 sm:text-base">
            Finance4All is a global nonprofit building the infrastructure for the next generation
            of finance leaders — through outreach programs, research, and a member portal that
            connects news, opportunities, and collaboration in one place.
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
