import { Globe2, Heart, Languages, Users } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const PILLARS = [
  {
    icon: Heart,
    title: "Free & accessible",
    description:
      "Catalyst CFEI, S.I.S.T.E.R tracks, and school outreach — zero program fees for students who need it most.",
  },
  {
    icon: Globe2,
    title: "Truly global",
    description:
      "Chapters across India, the UK, the US, and growing — content in plain language for every time zone.",
  },
  {
    icon: Users,
    title: "Beginner-welcome",
    description:
      "No finance background required. Explainers, education modules, and a patient community of mentors.",
  },
  {
    icon: Languages,
    title: "Multilingual outreach",
    description:
      "Grassroots literacy programs adapted for local schools — scaling the model that started in India worldwide.",
  },
];

export default function InclusiveImpactSection() {
  const ref = useScrollReveal();

  return (
    <section className="relative px-4 py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400/90">
            Inclusion first
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-5xl">
            Finance education for{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              every student
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/55">
            FinanceMeta was built from school outreach in underserved communities. The portal carries
            that same mission — free tools, no gatekeeping, and support at every level.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.title}
                className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition duration-500 hover:border-emerald-400/25 hover:bg-white/[0.06]"
              >
                <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-emerald-500/10 p-3 text-emerald-300 transition group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{p.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
