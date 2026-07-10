import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const INCLUDES = [
  "Full Catalyst lesson library with exercises",
  "Meta Labs applications & mentor matching",
  "Economics Journal submission workflow",
  "Chapter events & member introductions",
];

export default function LandingCTA() {
  const ref = useScrollReveal();

  return (
    <section className="px-4 pb-28 pt-8 sm:pb-36">
      <div
        ref={ref}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-[#060c14]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgba(52,211,153,0.15),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_100%,rgba(99,102,241,0.1),transparent_45%)]" />

        <div className="relative grid gap-10 p-10 sm:p-14 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-400/90">
              Get started
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
              500+ members. One portal. Zero membership fee.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/55">
              Students join to read Debriefed, run chapter events, apply to labs, and publish — not
              to unlock a premium tier that does not exist.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Included with every account
            </p>
            <ul className="mt-5 space-y-3">
              {INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/75">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-black transition hover:bg-white/90"
              >
                Join free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
