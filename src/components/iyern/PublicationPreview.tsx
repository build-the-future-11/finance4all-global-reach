import { Link } from "react-router-dom";
import { type ResearchPublication, isPublicPublication } from "@/content/iyern";
import { normalizeExternalHttpUrl } from "@/lib/external-url";

export function PublicationResources({ paper }: { paper: ResearchPublication }) {
  if (!isPublicPublication(paper)) return null;
  return <div className="iy-actions">{([["Download manuscript", paper.manuscriptUrl], ["Supporting code", paper.codeUrl], ["Supporting data", paper.dataUrl]] as const).map(([label, url]) => {
    const safe = normalizeExternalHttpUrl(url);
    return safe?.startsWith("https:") ? <a key={label} href={safe} target="_blank" rel="noreferrer">{label} ↗</a> : null;
  })}</div>;
}
export default function PublicationPreview({ paper }: { paper: ResearchPublication }) {
  if (!isPublicPublication(paper)) return null;
  return <article className="iy-card"><span className="iy-status">{paper.status}</span><h3><Link to={`/iyern/articles/${paper.slug}`}>{paper.title}</Link></h3><p>{paper.authors.join(", ")}</p><p>{paper.abstract}</p><p><time dateTime={paper.publishedAt}>{paper.publishedAt}</time> · Version {paper.version}</p><PublicationResources paper={paper} /></article>;
}
