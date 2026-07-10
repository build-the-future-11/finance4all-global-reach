import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Globe, Newspaper, Users } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SectionHeader from "@/components/landing/SectionHeader";

const PERKS = [
  {
    icon: Newspaper,
    title: "Debriefed & explainers",
    desc: "Curated macro news and a searchable glossary — written for members, not generated on the fly.",
  },
  {
    icon: Globe,
    title: "Chapter events",
    desc: "RSVP to local Markets 101 nights, lab clinics, and outreach days run by student officers.",
  },
  {
    icon: Users,
    title: "Introductions",
    desc: "Request warm intros to members by interest, school, or research area — opt-in only.",
  },
  {
    icon: BookOpen,
    title: "Labs & journal",
    desc: "Apply to Meta Labs projects and submit writing through Pathways with editorial feedback.",
  },
];

export default function MembershipSection() {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref}
      id="membership"
      className="relative overflow-hidden px-4 py-28 sm:py-36"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-emerald-500/8 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Membership"
          title="Free access. Real modules."
          description="No tiered paywall — the cost is showing up. One account opens Debriefed, Education, Labs, Pathways, Network, Resources, and your chapter calendar."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-emerald-400/25 hover:bg-white/[0.05]"
            >
              <div className="shrink-0 rounded-xl border border-white/10 bg-emerald-500/10 p-3 text-emerald-300">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 font-semibold text-black shadow-[0_12px_40px_rgba(52,211,153,0.3)] transition hover:bg-emerald-400"
          >
            Create free account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-8 py-3.5 font-medium text-white transition hover:bg-white/[0.08]"
          >
            Already a member? Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
