import { useId, useState } from "react";
import { publicationTypes, usePublicationQueue, useReviewPublication, type PublicationRecord } from "@/hooks/portal/usePublication";
import type { PublicationState, PublicationTable } from "@/types/database";
import { Button } from "@/components/ui/button";
import { PortalCard, portalInputClass } from "@/components/portal/PortalUI";
import EditorialDraftImport from "@/components/portal/EditorialDraftImport";

function ReviewCard({ table, row }: { table: PublicationTable; row: PublicationRecord }) {
  const fieldId = useId();
  const mutation = useReviewPublication();
  const [reviewed, setReviewed] = useState(row);
  const changed = row.publication_revision !== reviewed.publication_revision;
  const [note, setNote] = useState("");
  const [state, setState] = useState<PublicationState>(row.publication_state);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const title = String(reviewed.title ?? reviewed.name ?? reviewed.headline ?? reviewed.id);
  return <PortalCard className="space-y-4 p-5">
    <h3 className="break-words font-semibold">{title}</h3>
    <p>Current state: <strong>{reviewed.publication_state}</strong> · Revision {reviewed.publication_revision}</p>
    {changed && <p role="alert">This record changed. <button type="button" className="underline" onClick={() => { setReviewed(row); setState(row.publication_state); setNote(""); setMessage(""); setError(""); }}>Review current version and clear this note</button></p>}
    <details>
      <summary className="cursor-pointer">Review full content</summary>
      <dl className="mt-3 space-y-3 text-sm">
        {Object.entries(reviewed).filter(([key]) => !key.startsWith("publication_")).map(([key, value]) => <div key={key}>
          <dt className="font-semibold capitalize">{key.replaceAll("_", " ")}</dt>
          <dd className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? "—")}</dd>
        </div>)}
      </dl>
    </details>
    <form className="space-y-3" onSubmit={async event => {
      event.preventDefault();
      if (mutation.isPending || changed) return;
      setMessage(""); setError("");
      try {
        await mutation.review({ table, row: reviewed, state, note });
        setMessage("Review recorded."); setNote("");
      } catch (failure) { setError(failure instanceof Error ? failure.message : "Review could not be saved."); }
    }}>
      <div>
        <label htmlFor={`${fieldId}-state`} className="block">Publication state</label>
        <select id={`${fieldId}-state`} value={state} onChange={event => setState(event.target.value as PublicationState)} disabled={mutation.isPending} className={`${portalInputClass} mt-1 w-full rounded-md p-2`}>
          <option value="draft">Draft — awaiting review</option>
          <option value="published">Published — visible to the permitted audience</option>
          <option value="archived">Archived — removed from member listings</option>
        </select>
      </div>
      <div>
        <label htmlFor={`${fieldId}-note`} className="block">Review evidence and decision for {title}</label>
        <textarea id={`${fieldId}-note`} required minLength={10} maxLength={2000} value={note} disabled={mutation.isPending} onChange={event => setNote(event.target.value)} className={`${portalInputClass} mt-1 w-full rounded-md p-2`} />
      </div>
      <p className="text-sm">Before publishing, verify the sources, permissions and accuracy of all claims. Content edits require a new review.</p>
      <Button type="submit" disabled={mutation.isPending || changed || note.trim().length < 10}>{mutation.isPending ? "Recording review…" : "Record review"}</Button>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </form>
  </PortalCard>;
}

export function PublicationQueue() {
  const [table, setTable] = useState<PublicationTable>("news_articles");
  const queue = usePublicationQueue(table);
  return <section aria-label="Publication review" className="space-y-4">
    <h2 className="text-xl font-semibold">Publication review</h2>
    <p>New and historical records remain drafts until an administrator records a review. Published database articles remain available to signed-in members. Events explicitly enabled for public listing may also appear anonymously; publication does not expose registrations or member data.</p>
    <EditorialDraftImport />
    <div>
      <label htmlFor="publication-content-type" className="block">Content type</label>
      <select id="publication-content-type" className={`${portalInputClass} mt-1 max-w-full rounded-md p-2`} value={table} onChange={event => setTable(event.target.value as PublicationTable)}>
        {Object.entries(publicationTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </div>
    <Button variant="outline" onClick={() => void queue.refetch()} disabled={queue.isFetching}>Reload review queue</Button>
    {queue.isLoading && <p role="status">Loading review queue…</p>}
    {queue.isError && <p role="alert">The review queue could not be loaded. Reload to try again.</p>}
    {!queue.isLoading && !queue.isError && !queue.data?.length && <p>No records in this category.</p>}
    {queue.data?.map(row => <ReviewCard key={`${table}:${row.id}`} table={table} row={row} />)}
    {queue.hasNextPage && <Button disabled={queue.isFetchingNextPage} onClick={() => void queue.fetchNextPage()}>Load more records</Button>}
  </section>;
}
