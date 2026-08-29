import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SectionHeader from "@/components/landing/SectionHeader";
import GlassSurface from "@/components/landing/GlassSurface";

const TIMELINE = [
  {
    year: "2023",
    title: "Classroom outreach",
    body: "The work began with beginner finance lessons built for students who did not have a formal finance class. No jargon first; just budgeting, interest, tradeoffs, and questions students could actually use.",
  },
  {
    year: "2024",
    title: "Curriculum and member pathways",
    body: "Lessons, research opportunities, writing, and chapter updates were organized into repeatable workflows so members could move from reading to participation without guessing where to go next.",
  },
  {
    year: "2025",
    title: "FinanceMeta portal launch",
    body: "Finance Debrief, research applications, opportunities, saved content, course progress, and chapter activity moved into one member dashboard.",
  },
];

export default function OriginStorySection() {
  const ref = useScrollReveal();

  return (
    <section className="relative border-y border-white/[0.06] bg-white/[0.015] px-4 py-28 sm:py-36">
      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionHeader
              align="left"
              eyebrow="Origin"
              title="From basic lessons to a working member portal"
              description="Meet students where they are: clear explanations first, then the portal when they want saved reading, learning progress, research applications, opportunities, or chapter events."
            />
            <Link
              to="/signup"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-emerald-300 transition hover:text-emerald-200"
            >
              Join the network
              <span aria-hidden>→</span>
            </Link>
          </div>

          <GlassSurface strong className="p-8 lg:p-10">
            <ol className="landing-glass-inner relative space-y-0">
            <div className="absolute bottom-4 left-[15px] top-4 w-px bg-gradient-to-b from-emerald-400/50 via-white/10 to-transparent" />
            {TIMELINE.map((item, i) => (
              <li key={item.year} className="relative flex gap-8 pb-12 last:pb-0">
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/40 bg-landing-bg text-[10px] font-bold text-emerald-300">
                  {i + 1}
                </div>
                <div className="pt-0.5">
                  <time className="font-mono text-xs text-emerald-400/80">{item.year}</time>
                  <h3 className="mt-1 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{item.body}</p>
                </div>
              </li>
            ))}
            </ol>
          </GlassSurface>
        </div>
      </div>
    </section>
  );
}
