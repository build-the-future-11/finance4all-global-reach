const INSTITUTIONS = [
  "Stanford University",
  "MIT",
  "Princeton University",
  "IIT Madras",
  "University of Chicago",
  "UC Berkeley",
  "Harvard University",
  "Jane Street",
  "Youth Economy Lab",
  "Synthica",
  "Atlas Economics Lab",
  "Finance Debriefed",
];

export default function SocialProofMarquee() {
  const items = [...INSTITUTIONS, ...INSTITUTIONS];

  return (
    <div className="relative overflow-hidden border-y border-white/[0.08] bg-white/[0.02] py-5 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#030508] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#030508] to-transparent" />

      <div className="landing-marquee flex w-max gap-10">
        {items.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="whitespace-nowrap text-sm font-medium tracking-wide text-white/35"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
