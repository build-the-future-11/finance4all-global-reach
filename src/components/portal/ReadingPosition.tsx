import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { CheckCheck } from "lucide-react";
import type { DebriefedArticle } from "@/content/debriefed";
import { useReadingHistory } from "@/hooks/portal/useReadingHistory";

export default function ReadingPosition({ article }: { article: DebriefedArticle }) {
  const { user, entries, update, error } = useReadingHistory();
  const location = useLocation();
  const entry = entries.find(item => item.slug === article.slug);
  const [selected, setSelected] = useState<{ userId: string; slug: string; section: string } | null>(null);
  const draftSection = selected?.userId === user?.id && selected?.slug === article.slug ? selected.section : undefined;
  const section = draftSection || entry?.section || article.sections[0]?.id;
  if (!user) return <p className="text-sm text-muted-foreground">This guide is free to read. <Link className="underline" to="/login" state={{ from: location.pathname }}>Sign in to remember your place.</Link></p>;
  const save = (completed: boolean) => update.mutate({ slug: article.slug, section, completed }, { onSuccess: () => toast.success(completed ? "Guide marked as read" : "Reading position saved"), onError: error => toast.error(error.message) });
  return <section aria-label="Your reading progress" className="rounded-xl border border-border bg-muted/30 p-4">
    {error && <p role="alert" className="mb-3 text-sm">Saved progress could not be loaded. Your article remains available.</p>}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-medium">{entry?.completed ? <span className="inline-flex items-center gap-2"><CheckCheck size={16} /> Marked as read</span> : "Remember your place"}</p>
      {entry && !entry.completed && <a className="text-sm font-semibold text-emerald-700 underline dark:text-emerald-400" href={`#${entry.section}`}>Resume reading</a>}
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      <label className="min-w-0 flex-1 text-xs">Reading position
        <select className="mt-1 block w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground" value={section} onChange={event => setSelected({ userId: user.id, slug: article.slug, section: event.target.value })}>
          {article.sections.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </label>
      <button className="self-end rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50" disabled={update.isPending} onClick={() => save(false)}>Save position</button>
      <button className="self-end rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50" disabled={update.isPending} onClick={() => save(true)}>Mark as read</button>
    </div>
    <p className="mt-2 text-xs text-muted-foreground">Saved privately to your account when you choose. Reading completion is self-reported.</p>
  </section>;
}
