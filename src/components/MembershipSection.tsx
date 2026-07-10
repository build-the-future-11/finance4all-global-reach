import { Link } from "react-router-dom";
import { ArrowRight, Globe, Shield, Sparkles, Users } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const PERKS = [
  {
    icon: Sparkles,
    title: "Finance Debriefed",
    desc: "Curated macro news, explainers, and weekly digests.",
  },
  {
    icon: Globe,
    title: "Global chapters",
    desc: "Join local events and connect with members worldwide.",
  },
  {
    icon: Users,
    title: "Member network",
    desc: "Profiles, introductions, and collaboration matching.",
  },
  {
    icon: Shield,
    title: "Verified research",
    desc: "Meta Labs projects with lead researchers and applications.",
  },
];

export default function MembershipSection() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="membership"
      className="scroll-reveal relative overflow-hidden bg-[#060a12] px-4 py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400/90">
            Membership
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Your global finance membership
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/55">
            One account unlocks news, research labs, career pathways, chapter events, and a
            network of students building financial literacy worldwide.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition hover:border-emerald-400/30 hover:bg-white/[0.06]"
            >
              <div className="mb-4 inline-flex rounded-xl bg-emerald-500/15 p-3 text-emerald-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 font-medium text-white shadow-[0_12px_48px_rgba(52,211,153,0.35)] transition hover:scale-105 hover:bg-emerald-400"
          >
            Join free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 font-medium text-white transition hover:bg-white/10"
          >
            Member sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
