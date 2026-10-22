import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { publishedDebriefedArticles, type DebriefedArticle } from "@/content/debriefed";
import MarkdownContent from "@/components/portal/MarkdownContent";
import SaveExplainer from "@/components/portal/SaveExplainer";
import ReadingPosition from "@/components/portal/ReadingPosition";

export default function DebriefedArticleView({ article, basePath = "/debriefed" }: { article: DebriefedArticle; basePath?: string }) {
  const { hash } = useLocation();
  useEffect(() => { if (/^#section-\d+$/.test(hash)) document.getElementById(hash.slice(1))?.scrollIntoView(); }, [hash, article.slug]);
  const related = publishedDebriefedArticles.filter(item => item.slug !== article.slug).sort((a, b) => b.topics.filter(topic => article.topics.includes(topic)).length - a.topics.filter(topic => article.topics.includes(topic)).length).slice(0, 3);
  return <article>
    <Link to={basePath} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> All Finance Debriefed guides</Link>
    <header className="mt-8 max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">{article.topics.join(" · ")}</p>
      <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">{article.title}</h1>
      <p className="mt-6 text-xl leading-relaxed text-muted-foreground">{article.dek}</p>
      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"><span>{article.author}</span><span className="inline-flex items-center gap-1"><Clock3 size={15} /> {article.readMinutes} minute read</span><span>Source review recorded: <time dateTime={article.reviewedAt}>{article.reviewedAt}</time></span></div>
      <p className="mt-2 text-xs text-muted-foreground">Original publication date not recorded. {article.authorNote}</p>
      <div className="mt-5"><SaveExplainer slug={article.slug} /></div>
    </header>
    <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0">
        <ReadingPosition key={article.slug} article={article} />
        <div className="mt-8 max-w-3xl"><MarkdownContent content={article.body} titleAlreadyRendered headingAnchors className="editorial-prose text-base leading-8" /></div>
      </div>
      <aside className="order-first rounded-xl border border-border p-5 lg:sticky lg:top-24 lg:order-last">
        <nav aria-label="In this guide"><h2 className="text-sm font-semibold">In this guide</h2><ol className="mt-4 space-y-3">{article.sections.map(section => <li key={section.id}><a href={`#${section.id}`} className="block text-sm leading-relaxed text-muted-foreground hover:text-foreground hover:underline">{section.title}</a></li>)}</ol></nav>
      </aside>
    </div>
    <section className="mt-12 border-t border-border pt-8" aria-labelledby="article-sources"><h2 id="article-sources" className="font-serif text-2xl font-semibold">Sources & editorial record</h2>
      <div className="mt-5 grid gap-8 md:grid-cols-2"><div><h3 className="font-semibold">Primary reading</h3><ul className="mt-3 space-y-3">{article.sources.map(source => <li key={source.href}><a className="text-sm underline underline-offset-4" href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></li>)}</ul><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Worked examples are hypothetical teaching examples. This is an evergreen educational explanation; it contains no live market feed or return forecast.</p></div>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground"><div><h3 className="font-semibold text-foreground">Publication & rights</h3><p className="mt-2">{article.publicationBasis}</p><p className="mt-2">{article.rights}</p></div><div><h3 className="font-semibold text-foreground">Version & corrections</h3><p className="mt-2">{article.version}. A comprehensive earlier corrections ledger is not available.</p>{article.corrections.map(correction => <p key={correction.date} className="mt-2"><time dateTime={correction.date}>{correction.date}</time> — {correction.note}</p>)}<p className="mt-2">A dedicated corrections intake has not been verified. For publication contact details, consult the <a className="underline" href="https://financedebriefed.substack.com" target="_blank" rel="noopener noreferrer">official Finance Debriefed archive</a>. Correction reports should include the guide title, passage, source and proposed correction. Changes require editorial review; no response time is promised.</p></div></div></div>
    </section>
    <section className="mt-10 rounded-xl border border-border bg-muted/30 p-6"><h2 className="font-serif text-xl font-semibold">Keep exploring</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{related.map(item => <Link key={item.slug} to={`${basePath}/${item.slug}`} className="rounded-lg border border-border bg-card p-4 text-sm font-medium hover:border-emerald-500">{item.title}<ArrowRight className="mt-3" size={16} /></Link>)}</div><div className="mt-5 flex flex-wrap gap-5 text-sm"><Link to="/learn" className="underline">Build your financial foundations</Link><Link to="/research" className="underline">Explore research & methods</Link><Link to="/programs/debriefed-contributors" className="underline">Contribute a sourced explainer</Link></div></section>
    <p className="mt-6 text-xs leading-relaxed text-muted-foreground">For education only. This guide does not provide personalised investment, tax or legal advice. Check current primary sources and local rules before making financial decisions.</p>
  </article>;
}
