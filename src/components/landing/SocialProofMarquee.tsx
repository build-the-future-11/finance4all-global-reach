import { portalCopy } from "@/lib/portalCopy";

/** Programs and initiatives inside FinanceMeta — not unaffiliated institution logos. */
const PROGRAMS = [
  "Catalyst Education",
  "Research Projects",
  "Finance Debriefed",
  "Axiom Pathways",
  "Member Writing",
  "School Chapters",
  "Course Progress",
  "Saved Library",
  "Student Outreach",
  "Pathways Studios",
  "Chapter Events",
];

export default function SocialProofMarquee() {
  const items = [...PROGRAMS, ...PROGRAMS];

  return (
    <div className="relative overflow-hidden border-y border-white/[0.08] py-4 landing-glass !rounded-none backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#030508] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#030508] to-transparent" />

      <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-[0.25em] text-white/25">
        {portalCopy.landing.socialProofLabel}
      </p>

      <div className="landing-marquee flex w-max items-center gap-12">
        {items.map((name, i) => (
          <span key={`${name}-${i}`} className="flex items-center gap-12 whitespace-nowrap">
            <span className="text-sm font-medium tracking-wide text-white/40">{name}</span>
            <span className="h-1 w-1 rounded-full bg-white/15" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}
