import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import GlassSurface from "@/components/landing/GlassSurface";
import { landingEyebrowClass } from "@/components/portal/PortalUI";
import { portalCopy } from "@/lib/portalCopy";

const INCLUDES = [
  "Catalyst lesson library with exercises and glossary",
  "Meta Labs applications with named lead researchers",
  "Economics Journal submission workflow with editorial review",
  "Chapter events, RSVPs, and member introductions",
];

export default function LandingCTA() {
  const ref = useScrollReveal();

  return (
    <section className="px-4 pb-28 pt-8 sm:pb-36">
      <div ref={ref} className="mx-auto max-w-6xl">
        <GlassSurface strong>
          <div className="landing-glass-inner grid gap-10 p-10 sm:p-14 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className={landingEyebrowClass}>
              {portalCopy.landing.ctaEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
              {portalCopy.landing.ctaTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/55">
              {portalCopy.landing.ctaBody}
            </p>
          </div>

          <div className="landing-glass rounded-2xl p-6 sm:p-8">
            <div className="landing-glass-inner">
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
        </GlassSurface>
      </div>
    </section>
  );
}
