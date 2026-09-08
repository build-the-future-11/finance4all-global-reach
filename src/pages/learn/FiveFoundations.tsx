import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const standards = [
  ["Compound interest", "Saving 8-5; Investing 8-7", "Calculate annual compound growth and explain why later interest can be earned on earlier interest."],
  ["Inflation and purchasing power", "Saving 12-4; Investing 12-4", "Distinguish nominal growth from a change in real purchasing power."],
  ["Diversification", "Investing 8-5; Investing 12-6", "Explain how diversification reduces concentration without guaranteeing against broad market losses."],
  ["Borrowing cost and APR", "Managing Credit 8-2, 8-3; 12-1, 12-3", "Distinguish interest rate from APR and reason about how borrowing terms affect total cost."],
  ["Risk and expected return", "Investing 12-3", "Explain the general risk-return relationship without treating an expected return as guaranteed."],
] as const;

function SourceLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-emerald-300 underline decoration-emerald-300/35 underline-offset-4 hover:text-emerald-200"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

function LessonSection({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-white/10 py-10" aria-labelledby={`${id}-heading`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">{eyebrow}</p>
      <h2 id={`${id}-heading`} className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
      <div className="mt-5 max-w-3xl space-y-4 text-sm leading-7 text-white/70">{children}</div>
    </section>
  );
}

export default function FiveFoundations() {
  useDocumentTitle("Five Foundations");

  return (
    <main className="min-h-screen bg-[#060a12] px-5 py-10 text-white sm:px-8 sm:py-16 print:bg-white print:text-black">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link to="/learn" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            FinanceMeta Learn
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-sm text-white/75 transition hover:bg-white/[0.09] hover:text-white"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print lesson
          </button>
        </div>

        <header className="mt-12 max-w-4xl border-b border-white/10 pb-10 print:mt-0 print:border-black/15">
          <div className="flex items-center gap-2 text-emerald-300 print:text-black">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            <p className="text-sm font-medium">FinanceMeta open lesson · Version 1.0 · September 2026</p>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">Five Foundations</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/65 print:text-black/70">
            A 35-minute high-school lesson on five mechanics that recur across saving, borrowing, and investing decisions: compound interest, inflation, diversification, borrowing cost, and risk versus expected return.
          </p>

          <dl className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4 print:border-black/15 print:bg-black/10">
            {[
              ["Audience", "Grades 9–12"],
              ["Time", "35 minutes"],
              ["Cost", "Free"],
              ["Access", "No account"],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#0a0f18] px-4 py-4 print:bg-white">
                <dt className="text-xs uppercase tracking-[0.14em] text-white/40 print:text-black/50">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-white/85 print:text-black">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] p-4 print:border-black/20 print:bg-transparent">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300 print:text-black" aria-hidden="true" />
            <p className="text-sm leading-6 text-white/70 print:text-black/75">
              <strong className="font-semibold text-white print:text-black">Education boundary:</strong> this lesson is general financial education, not financial advice. It uses hypothetical examples and does not recommend a security, lender, broker, account, portfolio, or individualized financial action.
            </p>
          </div>
        </header>

        <nav aria-label="Lesson sections" className="py-7 print:hidden">
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              ["Objectives", "#objectives"],
              ["Teacher guide", "#teacher-guide"],
              ["Student handout", "#student-handout"],
              ["Answer key", "#answer-key"],
              ["Standards", "#standards"],
              ["Sources", "#sources"],
            ].map(([label, href]) => (
              <a key={href} href={href} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-white/60 hover:bg-white/[0.08] hover:text-white">
                {label}
              </a>
            ))}
          </div>
        </nav>

        <LessonSection id="objectives" eyebrow="Start here" title="Learning objectives">
          <p>By the end of the lesson, a learner should be able to:</p>
          <ul className="space-y-2">
            {[
              "calculate two periods of annual compound growth;",
              "distinguish a nominal increase from a change in purchasing power;",
              "explain what diversification can and cannot do;",
              "distinguish an interest rate from APR and explain why borrowing terms affect total cost; and",
              "explain the general relationship between investment risk and expected return without treating return as guaranteed.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-emerald-300 print:text-black" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </LessonSection>

        <LessonSection id="teacher-guide" eyebrow="Teacher guide" title="35-minute run of show">
          <div className="space-y-7">
            <div>
              <h3 className="font-semibold text-white print:text-black">0–3 min · Connect the ideas</h3>
              <p className="mt-2">Explain that saving, borrowing, and investing all require comparisons across time. Do not ask students to disclose family income, debt, balances, investments, or account usage.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white print:text-black">3–9 min · Compound interest</h3>
              <p className="mt-2">A hypothetical balance starts at 100 units and earns 10% once per year.</p>
              <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-sm print:border-black/15 print:bg-transparent">
                <p>End of year 1: 100 × 1.10 = 110</p>
                <p>End of year 2: 110 × 1.10 = 121</p>
              </div>
              <p className="mt-2"><strong className="text-white print:text-black">Check:</strong> Why is the second-year increase 11 units rather than 10? Because the 10% rate is applied to 110, not only the original 100.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white print:text-black">9–15 min · Inflation and purchasing power</h3>
              <p className="mt-2">Suppose a savings balance rises 3% while the general price level rises 5%. The balance is larger in nominal terms, but its purchasing power has fallen because prices rose faster.</p>
              <p className="mt-2">Optional quantitative extension: <span className="font-mono">1.03 / 1.05 = 0.98095</span>, about a 1.9% decline in purchasing power. The shortcut <span className="font-mono">3% − 5% = −2%</span> is an approximation, not an exact identity.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white print:text-black">15–21 min · Diversification</h3>
              <p className="mt-2">Compare a portfolio dependent on one company with one spread across many companies and sectors. Diversification reduces dependence on a narrow exposure. It does not guarantee a profit and does not eliminate losses from broad market declines.</p>
              <p className="mt-2"><strong className="text-white print:text-black">Check:</strong> Name a risk diversification cannot completely remove. Examples include a broad market decline or economy-wide shock.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white print:text-black">21–28 min · Borrowing cost, interest rate, and APR</h3>
              <p className="mt-2">The interest rate is the price charged for borrowing principal. APR is a broader comparison measure that incorporates the interest rate and certain additional loan fees.</p>
              <p className="mt-2">When other relevant terms are held equal, a higher interest rate increases borrowing cost. A longer repayment term can reduce a monthly payment while increasing total interest paid. Compare like with like and read the full loan terms rather than comparing one loan's APR directly with another loan's interest rate.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white print:text-black">28–32 min · Risk and expected return</h3>
              <p className="mt-2">Every investment involves uncertainty and potential loss. In general, investors demand higher expected returns for taking greater risk. Expected return is not guaranteed return, so unusually high-return, low-risk claims warrant skepticism.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white print:text-black">32–35 min · Transfer check</h3>
              <p className="mt-2">Have learners complete the five questions below without coaching, then review the answer key after everyone has finished.</p>
            </div>
          </div>
        </LessonSection>

        <LessonSection id="student-handout" eyebrow="Student handout" title="Five questions">
          <p className="rounded-xl border border-white/10 bg-white/[0.025] p-4 print:border-black/15 print:bg-transparent">All situations are hypothetical. Do not include personal financial information.</p>

          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-white print:text-black">1. Compound growth</h3>
              <p className="mt-2">A hypothetical savings balance begins at 200 units and earns 5% once per year. No money is added or withdrawn.</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>What is the balance after year 1?</li>
                <li>What is the balance after year 2?</li>
                <li>Why is the second year's interest slightly larger than the first year's interest?</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-white print:text-black">2. Inflation and purchasing power</h3>
              <p className="mt-2">A hypothetical balance grows 2% over one year while the general price level rises 4%. Which statement is best?</p>
              <ol className="mt-2 space-y-1 pl-1" type="A">
                <li>A. The balance and its purchasing power both increased.</li>
                <li>B. The balance increased in nominal terms, but its purchasing power decreased.</li>
                <li>C. The balance decreased because inflation was positive.</li>
                <li>D. The result cannot be discussed without choosing a stock.</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-white print:text-black">3. Diversification</h3>
              <p className="mt-2">Portfolio A contains shares of one hypothetical company. Portfolio B spreads its holdings across many companies and sectors. Which statement is most accurate?</p>
              <ol className="mt-2 space-y-1 pl-1">
                <li>A. Portfolio B cannot lose money.</li>
                <li>B. Portfolio B eliminates every kind of investment risk.</li>
                <li>C. Portfolio B is less dependent on one company, but broad market losses can still affect it.</li>
                <li>D. Portfolio A is automatically safer because it is easier to understand.</li>
              </ol>
              <p className="mt-2">Explain what diversification can reduce and name one risk it cannot eliminate.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white print:text-black">4. Borrowing cost</h3>
              <p className="mt-2">Two hypothetical loans have the same principal, repayment period, and no fees. Loan A has a 6% annual interest rate; Loan B has an 8% annual interest rate.</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Under these controlled assumptions, which loan has the lower borrowing cost?</li>
                <li>If one loan instead charged additional fees, what broader comparison measure should you inspect along with the contract terms?</li>
                <li>Why would it be misleading to compare one loan's APR directly with another loan's interest rate?</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-white print:text-black">5. Risk and expected return</h3>
              <p className="mt-2">A promoter says, “This investment offers extremely high returns with almost no risk.” Which response best reflects the general risk-return relationship?</p>
              <ol className="mt-2 space-y-1 pl-1">
                <li>A. High promised return proves the investment is safe.</li>
                <li>B. Greater potential return generally comes with greater risk, and no investment return is guaranteed merely because it is advertised.</li>
                <li>C. Risk only matters after an investment loses money.</li>
                <li>D. Diversification makes any promised return guaranteed.</li>
              </ol>
            </div>
          </div>
        </LessonSection>

        <LessonSection id="answer-key" eyebrow="Answer key" title="Worked answers">
          <div className="space-y-7">
            <div><h3 className="font-semibold text-white print:text-black">1. Compound growth</h3><p className="mt-2">Year 1: <span className="font-mono">200 × 1.05 = 210</span>. Year 2: <span className="font-mono">210 × 1.05 = 220.50</span>. The second year's interest is calculated on a balance that already includes the first year's interest.</p></div>
            <div><h3 className="font-semibold text-white print:text-black">2. Inflation</h3><p className="mt-2"><strong className="text-white print:text-black">B.</strong> The numerical balance rises 2%, but prices rise 4%, so purchasing power falls. The exact one-year change is <span className="font-mono">(1.02 / 1.04) − 1 ≈ −1.92%</span>.</p></div>
            <div><h3 className="font-semibold text-white print:text-black">3. Diversification</h3><p className="mt-2"><strong className="text-white print:text-black">C.</strong> Diversification can reduce concentration in one company, industry, or narrow exposure; it cannot guarantee profit or remove broad market risk.</p></div>
            <div><h3 className="font-semibold text-white print:text-black">4. Borrowing cost</h3><p className="mt-2">Loan A has the lower borrowing cost under the stated assumptions. If fees differ, inspect APR and the contract terms. APR and interest rate are different measures, so comparing one with the other is not an apples-to-apples comparison.</p></div>
            <div><h3 className="font-semibold text-white print:text-black">5. Risk and expected return</h3><p className="mt-2"><strong className="text-white print:text-black">B.</strong> In general, greater potential return comes with greater risk. An advertised or expected return is not a guarantee.</p></div>
          </div>
        </LessonSection>

        <LessonSection id="standards" eyebrow="Standards" title="2021 National Standards alignment">
          <p>
            The lesson is mapped to the Jump$tart Coalition and Council for Economic Education's <em>2021 National Standards for Personal Financial Education</em>. The mapping teaches foundational concepts without turning a standards outcome into individualized financial advice.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-white/10 print:border-black/15">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-white/[0.05] text-white/55 print:bg-black/[0.03] print:text-black/65">
                <tr><th className="px-4 py-3 font-medium">Concept</th><th className="px-4 py-3 font-medium">Standard</th><th className="px-4 py-3 font-medium">Evidence in lesson</th></tr>
              </thead>
              <tbody className="divide-y divide-white/10 print:divide-black/10">
                {standards.map(([concept, standard, evidence]) => (
                  <tr key={concept}><td className="px-4 py-4 font-medium text-white print:text-black">{concept}</td><td className="px-4 py-4 text-white/65 print:text-black/70">{standard}</td><td className="px-4 py-4 text-white/65 print:text-black/70">{evidence}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            <SourceLink href="https://www.jumpstart.org/what-we-do/support-financial-education/standards/">Open the National Standards source</SourceLink>
          </p>
        </LessonSection>

        <LessonSection id="sources" eyebrow="Source notes" title="Accuracy and claim boundaries">
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-white print:text-black">Interest rate and APR</h3>
              <p className="mt-1">The CFPB distinguishes the interest rate from APR; APR incorporates the interest rate and certain additional fees.</p>
              <p className="mt-1"><SourceLink href="https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/">Consumer Financial Protection Bureau</SourceLink></p>
            </div>
            <div>
              <h3 className="font-semibold text-white print:text-black">Diversification</h3>
              <p className="mt-1">Diversification spreads exposure but does not guarantee against losses when markets decline.</p>
              <p className="mt-1"><SourceLink href="https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/diversify-your-investments">SEC Investor.gov — Diversify Your Investments</SourceLink></p>
            </div>
            <div>
              <h3 className="font-semibold text-white print:text-black">Risk</h3>
              <p className="mt-1">Investment risk includes uncertainty and potential loss; higher potential return generally requires accepting greater risk.</p>
              <p className="mt-1"><SourceLink href="https://www.investor.gov/introduction-investing/investing-basics/what-risk">SEC Investor.gov — What is Risk?</SourceLink></p>
            </div>
          </div>

          <div className="mt-7 flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] p-4 print:border-black/20 print:bg-transparent">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300 print:text-black" aria-hidden="true" />
            <p className="text-sm leading-6">
              Publication here does not mean Jump$tart, the CFPB, the SEC, a school, or any other external body has endorsed FinanceMeta or this lesson. Standards alignment and source use are factual references; any external review or listing is named only after it actually occurs.
            </p>
          </div>
        </LessonSection>

        <footer className="border-t border-white/10 py-10 text-sm text-white/45 print:border-black/15 print:text-black/55">
          <p>FinanceMeta · Five Foundations v1.0 · Free educational resource · No account required.</p>
          <p className="mt-2 print:hidden"><Link to="/evidence" className="underline decoration-white/20 underline-offset-4 hover:text-white">Public evidence boundary</Link></p>
        </footer>
      </div>
    </main>
  );
}
