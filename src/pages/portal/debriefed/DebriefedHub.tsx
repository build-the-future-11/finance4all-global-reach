import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { useDigestPreferences, useNewsArticles, useUpdateDigestPreferences } from "@/hooks/portal/useDebriefed";
import { useNewsBookmarks, useToggleNewsBookmark } from "@/hooks/portal/useBookmarks";
import { portalRoutes } from "@/routes/portal";
import type { NewsCategory } from "@/types/domain";
import BookmarkButton from "@/components/portal/BookmarkButton";
import { CategoryBadge, PortalCard, QueryStatus } from "@/components/portal/PortalUI";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSelectedRecord } from "@/hooks/useSelectedRecord";
import DebriefedLibrary from "@/components/debriefed/DebriefedLibrary";

const CATEGORIES: { value: NewsCategory; label: string }[] = [{ value: "macro", label: "Macroeconomics" }, { value: "markets", label: "Markets" }, { value: "ipo", label: "IPOs" }, { value: "company", label: "Companies" }];

export default function DebriefedHub() {
  useDocumentTitle("Finance Debriefed");
  const { selectedId, notice } = useSelectedRecord();
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const { data: articles, isLoading, error, refetch } = useNewsArticles(category, selectedId);
  const { data: prefs, isError: preferencesError, isLoading: preferencesLoading } = useDigestPreferences();
  const updatePrefs = useUpdateDigestPreferences();
  const { data: bookmarks } = useNewsBookmarks();
  const toggleBookmark = useToggleNewsBookmark();
  const save = async (input: Parameters<typeof updatePrefs.mutateAsync>[0]) => { try { await updatePrefs.mutateAsync(input); toast.success("Preferences saved"); } catch { toast.error("Preferences could not be saved. Try again."); } };
  const preferencesDisabled = updatePrefs.isPending || preferencesLoading || preferencesError;
  return <div className="space-y-10">{notice}<DebriefedLibrary basePath={portalRoutes.debriefedExplainers} />
    <section className="grid gap-5 lg:grid-cols-2" aria-label="Editorial preferences">
      <PortalCard className="p-6"><h2 className="font-serif text-xl font-semibold">Your digest preferences</h2><p className="mt-2 text-sm text-muted-foreground">Save your interests for reviewed issues. This preference does not confirm that email delivery is active.</p>
        {preferencesError && <p role="alert" className="mt-3 text-sm">Preferences are unavailable. Reload the page to retry.</p>}
        <label className="mt-5 flex items-center justify-between gap-3 text-sm">Email digest preference<Switch aria-label="Enable weekly email digest" checked={prefs?.weeklyDigestEnabled ?? false} disabled={preferencesDisabled} onCheckedChange={value => void save({ weeklyDigestEnabled: value })} /></label>
        <fieldset className="mt-5"><legend className="text-sm font-medium">Topics for your digest</legend><div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">{CATEGORIES.map(item => <label className="inline-flex items-center gap-2 text-sm" key={item.value}><input type="checkbox" disabled={preferencesDisabled} checked={prefs?.preferredCategories.includes(item.value) ?? false} onChange={event => void save({ preferredCategories: event.target.checked ? [...(prefs?.preferredCategories ?? []), item.value] : (prefs?.preferredCategories ?? []).filter(value => value !== item.value) })} />{item.label}</label>)}</div></fieldset>
      </PortalCard>
      <PortalCard className="p-6"><h2 className="font-serif text-xl font-semibold">The external publication</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Visit Finance Debriefed on Substack for its publication archive and subscription controls. Marking your status here does not create an external subscription.</p><label className="mt-5 flex items-center justify-between gap-3 text-sm">I have a Substack subscription<Switch aria-label="Confirm Substack subscription" checked={prefs?.substackSubscribed ?? false} disabled={preferencesDisabled} onCheckedChange={value => void save({ substackSubscribed: value })} /></label><a href="https://financedebriefed.substack.com" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline">Open Substack <ExternalLink size={15} /></a></PortalCard>
    </section>
    <section aria-labelledby="reviewed-news-title"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 id="reviewed-news-title" className="font-serif text-2xl font-semibold">Reviewed news & source notes</h2><p className="mt-2 text-sm text-muted-foreground">Publication dates provide context. Historical summaries are not current market updates.</p></div><label className="text-sm">News category<select className="ml-3 rounded-lg border border-border bg-background p-2" value={category} onChange={event => setCategory(event.target.value as NewsCategory | "all")}><option value="all">All</option>{CATEGORIES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div>
      <div className="mt-5"><QueryStatus isLoading={isLoading} error={error} isEmpty={!articles?.length} emptyMessage="No reviewed news records are available in this category." onRetry={() => refetch()}><div className="space-y-4">{articles?.map(article => <PortalCard key={article.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><CategoryBadge>{article.category}</CategoryBadge><h3 className="mt-3 font-serif text-xl font-semibold">{article.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{article.summary}</p><p className="mt-3 text-xs text-muted-foreground">Published {new Date(article.publishedAt).toLocaleDateString()} · Source summary</p>{article.sourceUrl && <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm underline">Read the original source <ExternalLink size={14} /></a>}</div><BookmarkButton saved={bookmarks?.has(article.id) ?? false} loading={toggleBookmark.isPending} label="Save" onToggle={() => toggleBookmark.mutateAsync({ articleId: article.id, saved: bookmarks?.has(article.id) ?? false })} /></div></PortalCard>)}</div></QueryStatus></div>
      <Link to={portalRoutes.debriefedExplainers} className="mt-6 inline-block text-sm underline">All full-length explainers</Link>
    </section>
  </div>;
}
