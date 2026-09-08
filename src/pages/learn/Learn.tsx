import { ArrowLeft, ArrowRight, BookOpen, Clock, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Learn() {
  useDocumentTitle("Learn");

  return (
    <main className="min-h-screen bg-[#060a12] px-5 py-10 text-white sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          FinanceMeta
        </Link>

        <header className="mt-12 max-w-3xl border-b border-white/10 pb-10">
          <div className="flex items-center gap-2 text-emerald-300">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            <p className="text-sm font-medium">Open learning resources</p>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Learn the mechanics, not the hype.</h1>
          <p className="mt-5 text-base leading-7 text-white/65">
            Free FinanceMeta lessons built around explicit learning objectives, source notes, and clear boundaries between education and financial advice.
          </p>
        </header>

        <section className="py-10" aria-labelledby="resources-heading">
          <h2 id="resources-heading" className="text-2xl font-semibold">Resources</h2>

          <article className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-white/45">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                35 minutes
              </span>
              <span>Grades 9–12</span>
              <span>Free</span>
              <span>No account</span>
            </div>

            <h3 className="mt-5 text-2xl font-semibold">Five Foundations</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
              A compact lesson on compound interest, inflation and purchasing power, diversification, borrowing cost and APR, and the relationship between risk and expected return.
            </p>

            <div className="mt-5 flex items-start gap-2 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] p-4 text-sm leading-6 text-white/70">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
              <p>
                Uses hypothetical examples only. No security, lender, account, broker, or individualized financial action is recommended.
              </p>
            </div>

            <Link
              to="/learn/five-foundations"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Open lesson
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </article>
        </section>

        <section className="border-t border-white/10 py-10" aria-labelledby="boundary-heading">
          <h2 id="boundary-heading" className="text-2xl font-semibold">Publication boundary</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/60">
            A resource appearing here means its learning materials are publicly available. It does not imply endorsement by a regulator, standards body, school, university, or financial institution. External reviews and listings are named only after they occur.
          </p>
        </section>
      </div>
    </main>
  );
}
