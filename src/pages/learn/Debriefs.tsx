import { ArrowLeft, ArrowRight, CalendarDays, Clock3, MoonStar } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import MarkdownContent from "@/components/portal/MarkdownContent";
import { editorialExplainers, findEditorialExplainer } from "@/content/editorial";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import Brand from "@/components/Brand";
import SaveExplainer from "@/components/portal/SaveExplainer";
import "@/styles/landing.css";

function Header() {
  return (
    <header className="public-editorial-header">
      <Link to="/" className="app-gateway-brand" aria-label="Finance for All home">
        <Brand />
      </Link>
      <nav><Link to="/learn">Learning</Link><Link to="/login">Member sign in</Link><ThemeToggle /></nav>
    </header>
  );
}

export default function Debriefs() {
  const { slug } = useParams();
  const article = findEditorialExplainer(slug);
  useDocumentTitle(article?.title ?? "Finance Debriefs");

  if (slug && !article) {
    return <main className="public-editorial"><Header /><section className="public-editorial-empty"><MoonStar /><h1>That guide is not published.</h1><Link to="/learn/debriefs">Browse published debriefs</Link></section></main>;
  }

  if (article) {
    return (
      <main className="public-editorial">
        <Header />
        <article className="public-article">
          <Link to="/learn/debriefs" className="public-article-back"><ArrowLeft className="h-4 w-4" /> All debriefs</Link>
          <div className="public-article-label">Finance Debrief · {article.difficulty}</div>
          <h1>{article.title}</h1>
          <p className="public-article-dek">{article.dek}</p>
          <div className="public-article-meta">
            <span><Clock3 className="h-4 w-4" /> {article.readMinutes} minute read</span>
            <span><CalendarDays className="h-4 w-4" /> Reviewed {new Date(`${article.reviewedAt}T00:00:00`).toLocaleDateString()}</span>
          </div>
          <SaveExplainer slug={article.slug} />
          <div className="public-article-body"><MarkdownContent content={article.body} titleAlreadyRendered className="editorial-prose mx-auto max-w-3xl text-base" /></div>
        </article>
      </main>
    );
  }

  return (
    <main className="public-editorial">
      <Header />
      <section className="public-editorial-hero">
        <p>Finance Debriefs</p>
        <h1>Go beyond the headline.</h1>
        <span>Long-form explanations of finance, economics, markets, and the systems behind everyday money. Sources and limits included.</span>
      </section>
      <section className="public-editorial-grid" aria-label="Published debriefs">
        {editorialExplainers.map((item, index) => (
          <Link key={item.slug} to={`/learn/debriefs/${item.slug}`} className={index === 0 ? "featured" : undefined}>
            <div><span>{item.difficulty}</span><span>{item.readMinutes} min</span></div>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
            <strong>Read full guide <ArrowRight className="h-4 w-4" /></strong>
          </Link>
        ))}
      </section>
    </main>
  );
}
