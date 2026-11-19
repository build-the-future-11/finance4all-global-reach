import { Link, useParams } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import { findPublishedDebriefed } from "@/content/debriefed";
import DebriefedLibrary from "@/components/debriefed/DebriefedLibrary";
import DebriefedArticleView from "@/components/debriefed/DebriefedArticleView";

export default function Debriefs() {
  const { slug } = useParams();
  const article = findPublishedDebriefed(slug);
  return <PublicLayout canonicalPath={article ? `/debriefed/${article.slug}` : undefined} title={article?.title ?? "Finance Debriefed"} description={article?.summary ?? "Open-access finance and economics guides with full text, primary sources and reading tools."}>
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {slug && !article ? <section className="rounded-xl border border-border p-8"><h1 className="font-serif text-3xl font-semibold">This guide is not published.</h1><p className="mt-3 text-muted-foreground">It may be awaiting editorial review, archived, or unavailable at this address.</p><Link to="/debriefed" className="mt-6 inline-block underline">Browse available guides</Link></section> : article ? <DebriefedArticleView article={article} /> : <DebriefedLibrary />}
    </div>
  </PublicLayout>;
}
