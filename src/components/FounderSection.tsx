import { useScrollReveal } from "@/hooks/useScrollReveal";

const teamMembers = [
  {
    name: "Halle",
    role: "Head of Growth",
    highlights: [
      "Growth Intern at Creddr scaling a next generation finance platform",
      "Researcher at Synthica selected from 1000+ applicants with 1.5% acceptance rate",
      "Ambassador at Canadian Economics Olympiad leading outreach and partnerships",
      "Founder of Econ in 3 Mins simplifying economics for youth audiences",
      "VP Marketing at JA Southern Alberta driving 100K+ reach campaigns",
    ],
  },
  {
    name: "Kranav Gupta",
    role: "Co-Founder and Econscholars Lead",
    highlights: [
      "Founder of Econscholars",
      "International olympiad mentor",
      "Leads live industry and research projects",
    ],
  },
  {
    name: "Frank Niu",
    role: "Senior Researcher",
    highlights: [
      "FBLA award winner",
      "Director of Finance at Youth Civics Network",
      "HUVTSP 25 participant",
    ],
  },
  {
    name: "Xiurui (Ray) Chen",
    role: "Senior Researcher",
    highlights: [
      "Portfolio Manager at CCDS Investment Club",
      "Cofounded QIS branch and secured Jane Street sponsorship",
      "Intern at World Artificial Intelligence Conference",
      "Worked on logistics and sponsorship coordination in Shanghai",
      "Stock Market Game finalist managing 100K portfolio",
    ],
  },
  {
    name: "Joseph Augustine",
    role: "Affiliate, Youth Economy Lab",
    highlights: [
      "Leads initiatives under Youth Economy Lab with 500+ members",
      "Works on large scale youth driven economic research and programs",
      "Focus on policy, education, and real world economic systems",
    ],
  },
];

export default function FounderSection() {
  const ref = useScrollReveal();

  return (
    <section id="founder" className="relative px-4 py-28 sm:py-36">
      <div ref={ref} className="section-fade mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Leadership
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Built by <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">operators</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/55">
            A small, high-leverage team working across finance, research, and execution.
          </p>
        </div>

        <div className="mb-16">
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.05] p-8 backdrop-blur-3xl sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.12),transparent_40%)]" />
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold text-white">Ryan Gomez</h3>
              <p className="mt-1 font-medium text-emerald-300">Founder and ML Researcher</p>
              <div className="mt-6 grid gap-3 text-sm text-white/60 sm:grid-cols-2">
                <p>• 16 year old ML researcher and entrepreneur</p>
                <p>• Top 200 at World Scholars Cup Yale</p>
                <p>• 1M+ cumulative global reads</p>
                <p>• Built EdTech platform used worldwide</p>
                <p>• Backed by leading EdTech institutions</p>
              </div>
            </div>
          </div>
        </div>

        {/* TEAM */}
        <div className="grid gap-6 sm:grid-cols-2">

          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_15px_50px_rgba(0,0,0,0.2)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_50%)]" />

              <div className="relative z-10">

              <h4 className="text-lg font-semibold text-white">{member.name}</h4>
                <p className="mb-3 text-sm text-emerald-300/90">{member.role}</p>
                <ul className="space-y-1 text-sm text-white/55">
                  {member.highlights.map((h) => (
                    <li key={h}>• {h}</li>
                  ))}
                </ul>

              </div>
            </div>
          ))}

        </div>

      </div>

      {/* background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(120,255,220,0.05),transparent),radial-gradient(circle_at_bottom,rgba(255,255,255,0.03),transparent)]" />

    </section>
  );
}
