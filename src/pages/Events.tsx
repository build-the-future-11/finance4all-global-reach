import { Link } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import EventExplorer from "@/components/experience/EventExplorer";
import { mergeEventCatalog } from "@/content/events";
import { usePublicEvents } from "@/hooks/portal/useEvents";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function Events() {
  const query = usePublicEvents();
  const events = mergeEventCatalog(query.data?.pages.flat() ?? []);
  return <PublicLayout title="Events & Calendar" description="Discover reviewed Finance4All and FinanceMeta events, workshops and research challenges, with clear schedules and launch status."><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
    <header className="mb-10 max-w-3xl space-y-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Learn · Question · Build together</p><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Events with a purpose.</h1><p className="text-lg leading-relaxed text-muted-foreground">Find workshops, research conversations and challenges. Confirmed events and programs awaiting launch are clearly distinguished, so you can see what is open and what comes next.</p><div className="flex gap-5 text-sm font-medium"><Link className="text-primary hover:underline" to="/programs">Explore the program catalog →</Link><Link className="text-primary hover:underline" to="/chapters">Find your city →</Link></div></header>
    {isSupabaseConfigured && query.isPending && <p className="mb-4 text-sm" role="status">Loading reviewed event listings…</p>}
    {query.isError && <div className="mb-5 rounded-xl border p-4" role="alert"><p className="text-sm">Reviewed event listings are temporarily unavailable. Program launch notices remain available; they do not confirm a schedule.</p><button type="button" className="mt-2 text-sm text-primary underline" onClick={() => void query.refetch()}>Retry event listings</button></div>}
    {!isSupabaseConfigured && <p className="mb-5 rounded-xl border p-4 text-sm text-muted-foreground">Live event listings are unavailable in this preview. The notices below describe verified program planning status.</p>}
    <EventExplorer events={events} />
    {query.hasNextPage && <button type="button" className="mt-6 rounded-lg border px-4 py-2" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>{query.isFetchingNextPage ? "Loading…" : "Load more events"}</button>}
  </div></PublicLayout>;
}
