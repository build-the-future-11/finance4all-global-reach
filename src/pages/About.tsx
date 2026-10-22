import { Link } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import { activeProgramSnapshot, collaborationPipeline, ecosystemOverview, operatingPriorities, technicalWork, type EcosystemItem } from "@/content/ecosystem";

function EcosystemCards({ items }: { items: EcosystemItem[] }) {
  return <div className="ecosystem-card-grid">{items.map(item => <article key={item.title}>
    <div className="ecosystem-card-meta"><span>{item.status}</span></div>
    <h3>{item.title}</h3><p>{item.description}</p>
    {item.href && <Link className="text-link" to={item.href}>Explore this work →</Link>}
  </article>)}</div>;
}

export default function About() {
  return <PublicLayout title="About Finance4All & FinanceMeta" description="Finance4All connects financial education and community learning with FinanceMeta research, publishing, regional networks and practical projects.">
    <div className="public-editorial"><p className="overline">Education · Research · Community</p><h1>Financial understanding.<br />Open to everyone.</h1><p className="intro">{ecosystemOverview.recognition} Alongside it, {ecosystemOverview.scale.charAt(0).toLocaleLowerCase() + ecosystemOverview.scale.slice(1)} Together, they connect accessible explanations with research questions, practical projects and opportunities to contribute.</p>
      <aside className="ecosystem-evidence-note"><strong>Scale note</strong><p>{ecosystemOverview.scaleBoundary}</p></aside>
      <div className="public-editorial-grid">
        <article><h2>Learn a concept.</h2><p>Start with financial foundations and source-backed explainers. Educational reading is free and open without a membership payment.</p><Link className="text-link" to="/learn">Explore open learning →</Link></article>
        <article><h2>Investigate a question.</h2><p>Explore FinanceMeta Labs and IYERN. Every project distinguishes its research objective, available evidence and remaining limitations.</p><Link className="text-link" to="/research">Explore research →</Link></article>
        <article><h2>Contribute locally.</h2><p>Propose a chapter, a classroom session or a practical project. Local activity needs accountable organizers, permissions and a first deliverable.</p><Link className="text-link" to="/chapters">Find a starting point →</Link></article>
      </div>
      <section className="ecosystem-section" aria-labelledby="program-portfolio-heading"><p className="overline">Programs now in motion</p><h2 id="program-portfolio-heading">From first issue to international working teams.</h2><p>The active portfolio spans publishing, research development, competitions, education and regional collaboration. Each card shows the current operating boundary.</p><EcosystemCards items={activeProgramSnapshot} /></section>
      <section className="ecosystem-section" aria-labelledby="research-work-heading"><p className="overline">Technical research</p><h2 id="research-work-heading">Models, methods and independent evaluation.</h2><p>FinanceMeta’s technical work covers representation learning, portfolio optimization, causal financial modeling and independent evaluation. Research pages separate available engineering from unverified empirical claims.</p><EcosystemCards items={technicalWork} /></section>
      <section className="ecosystem-section" aria-labelledby="collaboration-heading"><p className="overline">Collaboration pipeline</p><h2 id="collaboration-heading">Conversations moving toward concrete work.</h2><p>YEFA, FFI, YIS, YEL, NSRI and individual researchers internationally are part of the current pipeline. These entries describe intended collaboration areas and do not announce formal partnerships.</p><EcosystemCards items={collaborationPipeline} /></section>
      <section className="ecosystem-section" aria-labelledby="priorities-heading"><p className="overline">Current priorities</p><h2 id="priorities-heading">What is progressing—and what still has to close.</h2><EcosystemCards items={operatingPriorities} /></section>
      <h2>Clear expectations, before you join.</h2><p>Programs show whether they are planned, accepting interest or ready for applications. Interest is not admission. Research repositories do not establish empirical findings, and screening a manuscript does not make it a reviewed publication.</p><Link className="text-link" to="/programs">Find a program →</Link>{" · "}<Link className="text-link" to="/evidence">Read our evidence standards →</Link>
      <section className="mt-12 border-t border-border pt-10"><h2>Bring your questions.</h2><p>Educators, students, researchers and potential collaborators can contact <a className="underline" href="mailto:financeforalledu@gmail.com">financeforalledu@gmail.com</a>. For the wider institution, visit the <a className="underline" href="https://finance-meta-landing.vercel.app/">FinanceMeta website</a>.</p><Link className="text-link" to="/portal">Open the member space →</Link></section>
    </div>
  </PublicLayout>;
}
