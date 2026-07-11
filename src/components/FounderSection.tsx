import { useScrollReveal } from "@/hooks/useScrollReveal";
import { portalCopy } from "@/lib/portalCopy";
import { cn } from "@/lib/utils";
import { landingEyebrowClass } from "@/components/portal/PortalUI";

const teamMembers = [
  {
    name: "Halle",
    role: "Head of Growth",
    highlights: [
      "Runs outreach and partnerships for chapter expansion",
      "Built Econ in 3 Mins, a youth economics education channel",
      "Leads marketing for JA Southern Alberta regional campaigns",
    ],
  },
  {
    name: "Kranav Gupta",
    role: "Co-Founder · EconScholars Lead",
    highlights: [
      "Founded EconScholars, Finance4All's olympiad prep program",
      "Mentors students preparing for international economics competitions",
      "Coordinates live industry and research project placements",
    ],
  },
  {
    name: "Frank Niu",
    role: "Senior Researcher",
    highlights: [
      "FBLA award winner and Director of Finance at Youth Civics Network",
      "Reviews student research submissions for clarity and evidence",
      "Supports chapter officers running their first finance events",
    ],
  },
  {
    name: "Xiurui (Ray) Chen",
    role: "Senior Researcher",
    highlights: [
      "Portfolio manager at CCDS Investment Club; co-founded the QIS research branch",
      "Coordinates sponsorship and logistics for chapter puzzle nights",
      "Stock Market Game finalist — brings practitioner framing to curriculum review",
    ],
  },
  {
    name: "Joseph Augustine",
    role: "Affiliate, Youth Economy Lab",
    highlights: [
      "Leads Youth Economy Lab initiatives with 500+ student members",
      "Connects Finance4All chapters to policy and education research programs",
      "Focuses on making economic systems legible to first-time learners",
    ],
  },
];

export default function FounderSection() {
  const ref = useScrollReveal();

  return (
    <section id="founder" className="relative px-4 py-28 sm:py-36">
      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <p className={cn(landingEyebrowClass, "mb-3")}>
            {portalCopy.landing.founderEyebrow}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {portalCopy.landing.founderTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/55">
            {portalCopy.landing.founderSubtext}
          </p>
        </div>

        <div className="mb-16">
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.05] p-8 backdrop-blur-3xl sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.12),transparent_40%)]" />
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold text-white">Ryan Gomez</h3>
              <p className="mt-1 font-medium text-emerald-300">Founder and ML Researcher</p>
              <div className="mt-6 grid gap-3 text-sm text-white/60 sm:grid-cols-2">
                <p>• Founded Finance4All from classroom outreach in India</p>
                <p>• Built the Catalyst curriculum and member portal</p>
                <p>• ML researcher focused on education tooling</p>
                <p>• Oversees Atlas Economics Lab and editorial standards</p>
              </div>
            </div>
          </div>
        </div>

        {/* TEAM */}
        <div className="grid gap-6 sm:grid-cols-2">

          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="portal-interactive relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-2xl motion-safe:hover:-translate-y-1 motion-safe:hover:bg-white/10 motion-safe:hover:shadow-[0_15px_50px_rgba(0,0,0,0.2)]"
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
