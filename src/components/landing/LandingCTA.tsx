import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function LandingCTA() {
  return (
    <section className="relative mx-4 mb-24 sm:mx-auto sm:max-w-6xl">
      <div className="relative overflow-hidden rounded-[40px] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 via-[#0a1628] to-purple-500/15 p-10 sm:p-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-400/15 blur-[100px]" />

        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-5xl">
            Join 500+ researchers & students
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Free membership. Full portal access. Education, labs, pathways, and a global network —
            the complete FinanceMeta experience.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-black transition hover:scale-105"
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
