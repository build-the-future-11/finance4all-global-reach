import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import PublicLayout from "@/layouts/PublicLayout";
import WorldMap from "@/components/experience/WorldMap";
import { communityLocations, chapterInterestUrl, chapterStatuses } from "@/content/community";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Chapters({ portal = false }: { portal?: boolean }) {
  useDocumentTitle("Global Chapters");
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("city") ?? undefined;
  const content = <div className="space-y-10">
    <header className="max-w-3xl space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Finance4All · Global community</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Local learning.<br />A shared global purpose.</h1>
      <p className="text-lg leading-relaxed text-muted-foreground">Explore {communityLocations.length} proposed community locations, find your city, and express interest in a school, campus or city chapter.</p>
      <div className="flex flex-wrap gap-3"><a className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground" href={chapterInterestUrl} target="_blank" rel="noopener noreferrer">Express chapter interest <ArrowUpRight size={17} /></a><Link className="rounded-lg border px-5 py-3 font-medium" to={portal ? "/portal/events" : "/events"}>Explore events</Link></div>
      <p className="text-sm text-muted-foreground">Interest is not an accepted application or a leadership appointment. Local permissions, an accountable lead and evidenced activity are required before a chapter can be verified as active.</p>
    </header>
    <WorldMap locations={communityLocations} label="Find your city" selectedId={selectedId} onSelect={id => { const next = new URLSearchParams(params); if (id) next.set("city", id); else next.delete("city"); setParams(next, { replace: true }); }} />
    <section className="rounded-2xl border bg-card p-6 sm:p-8" aria-labelledby="chapter-status-heading">
      <h2 id="chapter-status-heading" className="text-2xl font-semibold">From interest to an active chapter</h2>
      <p className="mt-3 max-w-3xl text-muted-foreground">Every map location above is currently classified as expansion interest. No verified active chapter is claimed by this static directory. Member chapter records are shown separately in the signed-in event workspace.</p>
      <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(chapterStatuses).filter(([key]) => key !== "unverified").map(([key, label], index) => <li key={key} className="flex items-start gap-3 rounded-xl bg-muted/50 p-4"><MapPin size={18} className="mt-0.5 shrink-0 text-primary" /><span><span className="mr-2 text-muted-foreground">{index + 1}.</span>{label}</span></li>)}</ol>
    </section>
    <section className="grid gap-6 md:grid-cols-3"><div><h2 className="text-xl font-semibold">A practical first activity</h2><p className="mt-3 text-muted-foreground">Start with an approved financial literacy workshop, a discussion of published Debriefed reading, or a reviewed research-methods session.</p></div><div><h2 className="text-xl font-semibold">Permission before promotion</h2><p className="mt-3 text-muted-foreground">Confirm your host, audience, safeguarding arrangements and scope before using institutional names or making commitments.</p></div><div><h2 className="text-xl font-semibold">Evidence before active status</h2><p className="mt-3 text-muted-foreground">An activity record and accountable owner establish progress. Applications, pins and group chats alone do not establish an operating chapter.</p></div></section>
  </div>;
  return portal ? content : <PublicLayout title="Global Chapters" description="Explore Finance4All expansion locations and the evidence-based pathway to a local chapter."><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">{content}</div></PublicLayout>;
}
