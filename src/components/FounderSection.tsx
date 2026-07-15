import { useScrollReveal } from "@/hooks/useScrollReveal";
import { portalCopy } from "@/lib/portalCopy";
import { cn } from "@/lib/utils";
import { landingEyebrowClass } from "@/components/portal/PortalUI";

const teamMembers = [
  {
    name: "Chapter operations",
    role: "Student outreach",
    highlights: [
      "Helps students start and maintain local finance-literacy activity",
      "Keeps chapter updates, events, and member requests organized",
      "Turns student questions into clearer learning and support material",
    ],
  },
  {
    name: "Learning team",
    role: "Curriculum and workshops",
    highlights: [
      "Maintains the beginner finance and economics learning path",
      "Reviews lessons for plain language and practical examples",
      "Builds course progress around real member next steps",
    ],
  },
  {
    name: "Research leads",
    role: "Projects and review",
    highlights: [
      "Scope research projects so students know what they are applying to do",
      "Review applications and submissions for clarity and evidence",
      "Keep opportunities bounded, current, and honest about expectations",
    ],
  },
  {
    name: "Editorial team",
    role: "Finance Debrief",
    highlights: [
      "Publishes Finance Debrief summaries with source attribution",
      "Avoids investment advice and unsupported market claims",
      "Keeps saved reading and weekly digest content useful for students",
    ],
  },
  {
    name: "Platform operations",
    role: "Member support",
    highlights: [
      "Maintains account, privacy, notification, and deletion workflows",
      "Reviews member feedback and service errors before they become patterns",
      "Keeps administrative publishing tied to real, approved content",
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
              <h3 className="text-2xl font-semibold text-white">A student-led operating model</h3>
              <p className="mt-1 font-medium text-emerald-300">Built around learning, chapters, research, and editorial review</p>
              <div className="mt-6 grid gap-3 text-sm text-white/60 sm:grid-cols-2">
                <p>• Public claims stay tied to approved program records</p>
                <p>• Finance Debrief separates education from investment advice</p>
                <p>• Research projects define scope before members apply</p>
                <p>• Administrators publish only content they can stand behind</p>
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
