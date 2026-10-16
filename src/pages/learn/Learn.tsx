import { Link } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import { publishedDebriefedArticles } from "@/content/debriefed";
import { ArrowRight, BookOpenText, FlaskConical, GraduationCap } from "lucide-react";

export default function Learn() {
  return <PublicLayout title="Open learning" description="Learn financial foundations, understand markets and read economic evidence through free source-backed Finance4All lessons.">
    <div className="public-editorial"><p className="overline">Finance4All / Open learning</p><h1>Build understanding.<br />One question at a time.</h1><p className="intro">Start with the mechanics of money, follow a topic into a longer explanation, then practise reading the evidence. Every resource here is free to read.</p>
      <div className="public-editorial-grid">
        <article><GraduationCap className="mb-6" aria-hidden="true" /><p className="overline">Start here / Foundations</p><h2>Money in everyday life.</h2><p>Compound interest, inflation, diversification, borrowing cost and risk. A compact lesson with clearly labelled hypothetical examples and practice prompts.</p><p className="mt-4 text-sm">35 minutes · Self-directed · No account required</p><Link className="text-link" to="/learn/five-foundations">Open Five Foundations <ArrowRight size={16} /></Link></article>
        <article><BookOpenText className="mb-6" aria-hidden="true" /><p className="overline">Go deeper / Reading</p><h2>Context behind a concept.</h2><p>Finance Debriefed connects markets, monetary policy, financial systems and research methods. Read the full explanation, follow its sources and explore related topics.</p><p className="mt-4 text-sm">{publishedDebriefedArticles.length} repository guides · Source notes included</p><Link className="text-link" to="/debriefed">Explore Finance Debriefed <ArrowRight size={16} /></Link></article>
        <article><FlaskConical className="mb-6" aria-hidden="true" /><p className="overline">Apply it / Research literacy</p><h2>Ask what the evidence shows.</h2><p>Learn to separate a research proposal from an experiment, inspect a baseline and look for sources of leakage before trusting a result.</p><p className="mt-4 text-sm">Methods · Provenance · Limitations</p><Link className="text-link" to="/research">Explore research methods <ArrowRight size={16} /></Link></article>
      </div>
      <section aria-labelledby="learning-reading"><h2 id="learning-reading">Choose your next explanation.</h2><div className="divide-y divide-border">{publishedDebriefedArticles.map(article => <Link to={`/debriefed/${article.slug}`} key={article.slug} className="flex items-center justify-between gap-6 py-6"><span><small className="text-muted-foreground">{article.topics.join(" · ")} / {article.readMinutes} min</small><h3 className="mt-2 font-serif text-2xl">{article.title}</h3><p className="mt-2 text-sm">{article.summary}</p></span><ArrowRight size={20} className="shrink-0" /></Link>)}</div></section>
      <section className="mt-12 border-t border-border pt-10"><h2>A private space to return to.</h2><p>Members can save reading, remember their place and keep private notes. Progress is self-reported; it does not constitute a certificate or assessment. Open reading remains available without signing in.</p><Link className="text-link" to="/portal/learning">Open My Learning <ArrowRight size={16} /></Link></section>
      <p className="mt-12 text-sm">Educational content only. No security, lender, broker or individualized financial action is recommended.</p>
    </div>
  </PublicLayout>;
}
