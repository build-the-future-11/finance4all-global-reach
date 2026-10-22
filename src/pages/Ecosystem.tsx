import { ArrowRight, ArrowUpRight, CheckCircle2, CircleDashed, Clock3, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import {
  activeProgramSnapshot,
  collaborationPipeline,
  ecosystemOverview,
  operatingPriorities,
  technicalWork,
  type EcosystemItem,
  type EcosystemStatus,
} from "@/content/ecosystem";
import "@/styles/ecosystem.css";

const statusDetails: Record<EcosystemStatus, { label: string; meaning: string; icon: typeof CheckCircle2 }> = {
  Active: { label: "Active", meaning: "Work is currently progressing within the boundary described.", icon: CheckCircle2 },
  "In development": { label: "In development", meaning: "The work is being designed or prepared; dates and delivery may still change.", icon: Clock3 },
  "In discussion": { label: "In discussion", meaning: "A conversation exists, but no formal partnership is announced.", icon: CircleDashed },
  Outstanding: { label: "Outstanding", meaning: "A named gate must close before a broader claim or launch.", icon: ShieldCheck },
};

function WorkstreamCards({ items, compact = false }: { items: EcosystemItem[]; compact?: boolean }) {
  return <div className={`ecosystem-work-grid${compact ? " is-compact" : ""}`}>
    {items.map(item => {
      const Icon = statusDetails[item.status].icon;
      return <article key={item.title} className="ecosystem-work-card">
        <div className="ecosystem-status" data-status={item.status.toLocaleLowerCase().replaceAll(" ", "-")}><Icon size={15} aria-hidden="true" />{item.status}</div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        {item.href && <Link to={item.href}>Open the record <ArrowUpRight size={15} aria-hidden="true" /></Link>}
      </article>;
    })}
  </div>;
}

export default function Ecosystem() {
  const outstandingCount = operatingPriorities.filter(item => item.status === "Outstanding").length;
  return <PublicLayout
    title="Finance4All & FinanceMeta ecosystem"
    description="Explore Finance4All and FinanceMeta programs, technical research, regional networks, collaboration discussions and the gates still to close."
    canonicalPath="/ecosystem"
  >
    <div className="ecosystem-page">
      <section className="ecosystem-hero">
        <div className="ecosystem-hero-copy">
          <p className="ecosystem-kicker">Finance4All × FinanceMeta</p>
          <h1>One ecosystem.<br /><em>Clear status.</em></h1>
          <p>{ecosystemOverview.recognition} FinanceMeta connects the initiative to research, publishing, competitions and regional working teams.</p>
          <div className="ecosystem-hero-actions"><Link className="ecosystem-primary-action" to="/programs">Find a program <ArrowRight size={17} aria-hidden="true" /></Link><Link to="/research">Explore the research directory</Link></div>
        </div>
        <aside className="ecosystem-scale" aria-label="Ecosystem scale and disclosure">
          <span>Organizer-reported network</span><strong>500+</strong><p>researchers reported across quantitative finance, economics, investment modeling and financial education.</p><small>{ecosystemOverview.scaleBoundary}</small>
        </aside>
        <dl className="ecosystem-metrics">
          <div><dt>{activeProgramSnapshot.length}</dt><dd>named program lanes</dd></div>
          <div><dt>{technicalWork.length}</dt><dd>technical workstreams</dd></div>
          <div><dt>{collaborationPipeline.length}</dt><dd>collaboration threads</dd></div>
          <div><dt>{outstandingCount}</dt><dd>explicit outstanding gates</dd></div>
        </dl>
      </section>

      <section className="ecosystem-legend" aria-labelledby="status-key-heading">
        <div><p className="ecosystem-kicker">Read the portfolio accurately</p><h2 id="status-key-heading">Status is part of the story.</h2></div>
        <div className="ecosystem-legend-grid">{Object.values(statusDetails).map(({ label, meaning, icon: Icon }) => <article key={label}><Icon size={18} aria-hidden="true" /><div><strong>{label}</strong><p>{meaning}</p></div></article>)}</div>
      </section>

      <section className="ecosystem-block" aria-labelledby="portfolio-heading">
        <header><div><p className="ecosystem-index">01 / Programs</p><h2 id="portfolio-heading">Education, publishing and competitions in motion.</h2></div><p>The portfolio includes active delivery and work still being prepared. Each entry states the current boundary so interest is never confused with admission, publication or launch.</p></header>
        <WorkstreamCards items={activeProgramSnapshot} />
      </section>

      <section className="ecosystem-block ecosystem-dark" aria-labelledby="technical-heading">
        <header><div><p className="ecosystem-index">02 / Technical work</p><h2 id="technical-heading">Models need evidence. Claims need limits.</h2></div><p>FinanceMeta’s work spans representation learning, portfolio optimization, causal financial modeling and independent evaluation. Project records separate available engineering from empirical results.</p></header>
        <WorkstreamCards items={technicalWork} />
        <Link className="ecosystem-inline-action" to="/evidence">Read the research and publication standard <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>

      <section className="ecosystem-block" aria-labelledby="network-heading">
        <header><div><p className="ecosystem-index">03 / Collaboration</p><h2 id="network-heading">Regional interest, turned into accountable work.</h2></div><p>The European and Gulf Finance Research Networks are being developed as practical research teams. YEFA, FFI, YIS, YEL, NSRI and individual researchers are shown as discussions until a written scope and delivered contribution exist.</p></header>
        <WorkstreamCards items={collaborationPipeline} compact />
        <div className="ecosystem-network-callout"><div><span>Europe</span><strong>From interest to scoped projects.</strong></div><div><span>Gulf</span><strong>From introductions to working teams.</strong></div><Link to="/programs/regional-research-networks">Explore the regional network plan <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </section>

      <section className="ecosystem-block ecosystem-operations" aria-labelledby="operations-heading">
        <header><div><p className="ecosystem-index">04 / Operations</p><h2 id="operations-heading">What is moving—and what must close.</h2></div><p>Contributor onboarding, research assignments, workshop development and competition outreach are progressing. Platform deployment, competition rules, research verification and formal partnership confirmation remain explicit operating gates.</p></header>
        <WorkstreamCards items={operatingPriorities} compact />
      </section>

      <section className="ecosystem-cta"><p className="ecosystem-kicker">Choose a concrete next step</p><h2>Learn. Investigate. Contribute.</h2><p>Start with an open lesson, inspect a research record, or propose work with a clear scope and accountable people.</p><div><Link className="ecosystem-primary-action" to="/learn">Start learning <ArrowRight size={17} aria-hidden="true" /></Link><Link to="/programs">Browse every program</Link><a href="mailto:financeforalledu@gmail.com">Contact the team</a></div></section>
    </div>
  </PublicLayout>;
}
