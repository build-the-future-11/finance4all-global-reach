import { Link, useParams } from "react-router-dom";
import { useExplainerBySlug, useExplainers } from "@/hooks/portal/useDebriefed";
import { portalRoutes } from "@/routes/portal";
import MarkdownContent from "@/components/portal/MarkdownContent";
import { PortalCard, QueryStatus } from "@/components/portal/PortalUI";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { findPublishedDebriefed } from "@/content/debriefed";
import DebriefedLibrary from "@/components/debriefed/DebriefedLibrary";
import DebriefedArticleView from "@/components/debriefed/DebriefedArticleView";

function ExplainerDetail({ slug }: { slug: string }) {
  const { data: explainer, isLoading, error, refetch } = useExplainerBySlug(slug);
  const article = findPublishedDebriefed(slug);
  useDocumentTitle(explainer?.title ?? "Explainer");
  if (article) return <DebriefedArticleView article={article} basePath={portalRoutes.debriefedExplainers} />;
  return <QueryStatus isLoading={isLoading} error={error} isEmpty={!explainer} emptyMessage="This explainer is not available." onRetry={() => refetch()} skeletonCount={1}>
    {explainer && <article><Link className="text-sm underline" to={portalRoutes.debriefedExplainers}>All explainers</Link><header className="my-8"><p className="text-xs uppercase tracking-widest text-muted-foreground">Reviewed member library · {explainer.difficulty}</p><h1 className="mt-4 font-serif text-4xl font-semibold">{explainer.title}</h1><p className="mt-4 text-lg text-muted-foreground">{explainer.summary}</p></header><PortalCard className="p-6 sm:p-10"><MarkdownContent content={explainer.body} titleAlreadyRendered className="editorial-prose mx-auto max-w-3xl text-base" /></PortalCard><p className="mt-5 text-xs text-muted-foreground">Educational content. Publication is controlled by the editorial review queue. Author, original publication date, rights and corrections must be checked in the article's source record; this legacy database schema does not store these as structured fields.</p></article>}
  </QueryStatus>;
}

function ExplainerLibrary() {
  const { data: explainers, isLoading, error, refetch } = useExplainers();
  const additional = explainers?.filter(item => !findPublishedDebriefed(item.slug)) ?? [];
  return <div className="space-y-10"><DebriefedLibrary basePath={portalRoutes.debriefedExplainers} />
    <section><h2 className="font-serif text-2xl font-semibold">Reviewed member additions</h2><p className="mt-2 text-sm text-muted-foreground">Additional guides appear here after approval in the member editorial workflow.</p>
      {isLoading && <p role="status" className="mt-4 text-sm">Checking member additions…</p>}
      {error && <p role="alert" className="mt-4 text-sm">Member additions could not be loaded. The open guides above remain available. <button className="underline" onClick={() => void refetch()}>Retry additions</button></p>}
      {!isLoading && !error && !additional.length && <p className="mt-4 text-sm text-muted-foreground">No additional reviewed guides are available.</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-2">{additional.map(item => <Link key={item.id} to={`${portalRoutes.debriefedExplainers}/${item.slug}`} className="rounded-xl border border-border bg-card p-5"><h3 className="font-serif text-xl font-semibold">{item.title}</h3><p className="mt-3 text-sm text-muted-foreground">{item.summary}</p></Link>)}</div>
    </section></div>;
}

export default function DebriefedExplainers() {
  const { slug } = useParams();
  useDocumentTitle("Finance Debriefed library");
  return slug ? <ExplainerDetail key={slug} slug={slug} /> : <ExplainerLibrary />;
}
