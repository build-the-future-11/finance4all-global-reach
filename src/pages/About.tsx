import { Link } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";

export default function About() {
  return <PublicLayout title="About Finance4All & FinanceMeta" description="Finance4All connects financial education and community learning with FinanceMeta research, publishing and practical projects.">
    <div className="public-editorial"><p className="overline">Education · Research · Community</p><h1>Financial understanding.<br />Open to everyone.</h1><p className="intro">Finance4All is FinanceMeta’s financial education and community arm. We connect accessible explanations with research questions, practical projects and opportunities to contribute.</p>
      <div className="public-editorial-grid">
        <article><h2>Learn a concept.</h2><p>Start with financial foundations and source-backed explainers. Educational reading is free and open without a membership payment.</p><Link className="text-link" to="/learn">Explore open learning →</Link></article>
        <article><h2>Investigate a question.</h2><p>Explore FinanceMeta Labs and IYERN. Every project distinguishes its research objective, available evidence and remaining limitations.</p><Link className="text-link" to="/research">Explore research →</Link></article>
        <article><h2>Contribute locally.</h2><p>Propose a chapter, a classroom session or a practical project. Local activity needs accountable organizers, permissions and a first deliverable.</p><Link className="text-link" to="/chapters">Find a starting point →</Link></article>
      </div>
      <h2>Clear expectations, before you join.</h2><p>Programs show whether they are planned, accepting interest or ready for applications. Interest is not admission. Research repositories do not establish empirical findings, and screening a manuscript does not make it a reviewed publication.</p><Link className="text-link" to="/programs">Find a program →</Link>{" · "}<Link className="text-link" to="/evidence">Read our evidence standards →</Link>
      <section className="mt-12 border-t border-border pt-10"><h2>Bring your questions.</h2><p>Educators, students, researchers and potential collaborators can contact <a className="underline" href="mailto:financeforalledu@gmail.com">financeforalledu@gmail.com</a>. For the wider institution, visit the <a className="underline" href="https://finance-meta-landing.vercel.app/">FinanceMeta website</a>.</p><Link className="text-link" to="/portal">Open the member space →</Link></section>
    </div>
  </PublicLayout>;
}
