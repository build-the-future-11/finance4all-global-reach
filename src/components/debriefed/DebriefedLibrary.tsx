import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpenText, Clock3, Search } from "lucide-react";
import { debriefedTopics, publishedDebriefedArticles, searchDebriefed, type DebriefedTopic } from "@/content/debriefed";
import { useReadingHistory } from "@/hooks/portal/useReadingHistory";
import { useSavedExplainers } from "@/hooks/portal/useSavedExplainers";

export default function DebriefedLibrary({ basePath = "/debriefed", showHero = true }: { basePath?: string; showHero?: boolean }) {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const requestedTopic = params.get("topic");
  const topic: DebriefedTopic | "all" = debriefedTopics.includes(requestedTopic as DebriefedTopic) ? requestedTopic as DebriefedTopic : "all";
  const requestedSort = params.get("sort");
  const sort = requestedSort === "shortest" || requestedSort === "title" ? requestedSort : "reviewed";
  const { continueReading } = useReadingHistory();
  const { user, slugs } = useSavedExplainers();
  const savedOnly = Boolean(user && params.get("saved") === "true");
  const articles = searchDebriefed(query, topic, sort).filter(article => !savedOnly || slugs.includes(article.slug));
  const featured = publishedDebriefedArticles.find(article => article.featured)!;
  const update = (key: string, value: string) => setParams(previous => { const next = new URLSearchParams(previous); if (value) next.set(key, value); else next.delete(key); return next; }, { replace: true });

  return <div className="space-y-10">
    {showHero && <section className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Finance Debriefed · Open education</p>
        <h1 className="mt-5 max-w-2xl font-serif text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl">Understand what moves your money.</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Go beyond the headline. Explore the mechanisms behind markets, policy and everyday finance, with sources and limits in view.</p>
        <div className="mt-6 flex flex-wrap gap-5 text-sm text-muted-foreground"><span>{publishedDebriefedArticles.length} open-access guides</span><span>No paid membership required</span></div>
      </div>
      <Link to={`${basePath}/${featured.slug}`} className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-7 transition hover:border-emerald-500/60 sm:p-9">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground"><span>Start here</span><BookOpenText size={22} className="text-emerald-700 dark:text-emerald-400" /></div>
        <div><h2 className="mt-10 font-serif text-3xl font-semibold leading-tight">{featured.title}</h2><p className="mt-4 leading-relaxed text-muted-foreground">{featured.summary}</p></div>
        <span className="mt-8 flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">Read the complete guide <ArrowRight size={18} /></span>
      </Link>
    </section>}

    {continueReading.length > 0 && <section aria-label="Continue reading" className="rounded-xl border border-border bg-muted/30 p-5">
      <h2 className="font-serif text-xl font-semibold">Continue reading</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{continueReading.slice(0, 4).map(entry => <Link className="rounded-lg border border-border bg-card p-3 text-sm hover:border-emerald-500" key={entry.slug} to={`${basePath}/${entry.slug}#${entry.section}`}>{entry.article.title}<span className="mt-1 block text-xs text-muted-foreground">Resume at your saved section →</span></Link>)}</div>
    </section>}

    <section aria-labelledby="debriefed-library-title">
      <div className="flex flex-wrap items-baseline justify-between gap-3"><h2 id="debriefed-library-title" className="font-serif text-3xl font-semibold">The reading room</h2><a href="https://financedebriefed.substack.com" target="_blank" rel="noopener noreferrer" className="text-sm underline underline-offset-4">External Substack archive ↗</a></div>
      <div className="mt-6 grid gap-4 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-[2fr_1fr_1fr]">
        <label className="text-sm font-medium">Search articles<div className="relative mt-2"><Search className="pointer-events-none absolute left-3 top-3 text-muted-foreground" size={17} /><input type="search" value={query} onChange={event => update("q", event.target.value)} placeholder="Titles, topics, terms or full text" className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm" /></div></label>
        <label className="text-sm font-medium">Topic<select value={topic} onChange={event => update("topic", event.target.value === "all" ? "" : event.target.value)} className="mt-2 block w-full rounded-lg border border-border bg-background p-2.5 text-sm"><option value="all">All topics</option>{debriefedTopics.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-medium">Sort by<select value={sort} onChange={event => update("sort", event.target.value)} className="mt-2 block w-full rounded-lg border border-border bg-background p-2.5 text-sm"><option value="reviewed">Last source review</option><option value="title">Title</option><option value="shortest">Shortest read</option></select></label>
      </div>
      <div className="my-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"><p role="status">{articles.length} {articles.length === 1 ? "guide" : "guides"}{topic !== "all" ? ` in ${topic}` : ""}</p>{user && <label className="inline-flex items-center gap-2"><input type="checkbox" checked={savedOnly} onChange={event => update("saved", event.target.checked ? "true" : "")} /> Saved articles only</label>}</div>
      {!articles.length ? <div className="rounded-xl border border-dashed border-border p-8"><h3 className="font-semibold">No guides match this selection.</h3><p className="mt-2 text-sm text-muted-foreground">Try another topic or a broader search. New material appears after editorial review.</p><button className="mt-4 text-sm font-semibold underline" onClick={() => setParams({})}>Clear filters</button></div> : <div className="grid gap-5 md:grid-cols-2">{articles.map(article => <Link to={`${basePath}/${article.slug}`} key={article.slug} className="group flex flex-col rounded-xl border border-border bg-card p-6 transition hover:border-emerald-500/60">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>{article.topics[0]}</span><span className="inline-flex items-center gap-1"><Clock3 size={13} /> {article.readMinutes} min</span></div>
        <h3 className="mt-6 font-serif text-2xl font-semibold leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{article.title}</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{article.summary}</p>
        <div className="mt-6 flex items-center justify-between text-sm"><span className="capitalize text-muted-foreground">{article.difficulty}</span><span className="inline-flex items-center gap-2 font-semibold">Read guide <ArrowRight size={15} /></span></div>
      </Link>)}</div>}
    </section>
    <p className="border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">Educational explanations, not personalised financial advice or current market reporting. Review dates describe the source record; they do not establish a fresh verification of laws, product terms or market conditions.</p>
  </div>;
}
