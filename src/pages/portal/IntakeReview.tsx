import { useState } from "react";
import { useIntakeCalls, useIntakeSubmissions, useReviewIntake, useSetCallStatus } from "@/hooks/portal/useIntake";
import { intakeError, type IntakeSubmission, type IntakeStatus } from "@/lib/intake";
import { PortalCard, PortalPageHeader, LoadingState } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { normalizeExternalHttpUrl } from "@/lib/external-url";

function ReviewRecord({ row, title }: { row: IntakeSubmission; title: string }) {
  const [note, setNote] = useState(row.review_note); const [message, setMessage] = useState(""); const review = useReviewIntake();
  const url = normalizeExternalHttpUrl(row.work_url);
  async function update(status: IntakeStatus) {
    try { await review.mutateAsync({ id: row.id, status, note }); setMessage("Review saved."); }
    catch (err) { setMessage(intakeError(err)); }
  }
  return <PortalCard className="space-y-3 p-5"><h3 className="font-semibold">{title}</h3><p>{row.status.replaceAll("_", " ")} · {new Date(row.created_at).toLocaleString()}</p><p className="break-all text-xs">Applicant: {row.applicant_id} · Receipt: {row.id}</p><dl className="space-y-2"><dt className="font-semibold">Question / contribution</dt><dd className="whitespace-pre-wrap">{row.motivation}</dd><dt className="font-semibold">Preparation</dt><dd className="whitespace-pre-wrap">{row.preparation}</dd><dt className="font-semibold">Availability</dt><dd>{row.availability}</dd></dl>{url && <a className="underline" href={url} target="_blank" rel="noopener noreferrer">Open work sample</a>}
    {row.status !== "withdrawn" && <><label className="block">Note visible to applicant<Textarea value={note} maxLength={2000} onChange={e => setNote(e.target.value)} /></label><div className="flex flex-wrap gap-2">{([['under_review','Mark reviewing'],['accepted','Accept'],['declined','Decline']] as const).map(([status,label]) => <Button key={status} type="button" variant="outline" disabled={review.isPending} onClick={() => update(status)}>{label}</Button>)}</div></>}<p role="status">{message}</p></PortalCard>;
}
export default function IntakeReview() {
  const [status, setStatus] = useState<IntakeStatus | "all">("submitted"); const [message, setMessage] = useState("");
  const calls = useIntakeCalls(); const queue = useIntakeSubmissions(true, status); const changeCall = useSetCallStatus();
  return <div className="space-y-6"><PortalPageHeader title="Platform intake review" description="Private applications, research inquiries and chapter proposals. Review notes are visible to applicants. Admission to an interest call does not open a scheduled program." />
    <section className="space-y-4"><h2 className="text-xl font-semibold">Calls & availability</h2>{calls.error && <p role="alert">{intakeError(calls.error)}</p>}{calls.data?.map(call => <PortalCard key={call.id} className="p-4"><h3 className="font-semibold">{call.title}</h3><p className="mb-3 text-sm">{call.description}</p><label>Status for {call.title}<select className="ml-3 rounded border border-input bg-background p-2" value={call.status} disabled={changeCall.isPending} onChange={async e => { try { await changeCall.mutateAsync({ id: call.id, status: e.target.value as "interest" | "open" | "closed" }); setMessage("Call availability saved."); } catch (err) { setMessage(intakeError(err)); } }}><option value="interest">Expression of interest</option><option value="open">Open application</option><option value="closed">Closed</option></select></label></PortalCard>)}<p role="status">{message}</p></section>
    <section className="space-y-4"><h2 className="text-xl font-semibold">Review queue</h2><label>Filter by review status<select className="ml-3 rounded border border-input bg-background p-2" value={status} onChange={e => setStatus(e.target.value as IntakeStatus | "all")}>{['all','submitted','under_review','accepted','declined','withdrawn'].map(s => <option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}</select></label><Button type="button" variant="outline" onClick={() => queue.refetch()}>Refresh queue</Button>
    {queue.isLoading && <LoadingState />}{queue.error && <p role="alert">{intakeError(queue.error)}</p>}{queue.isSuccess && !queue.data.pages.flat().length && <p>No submissions match this status.</p>}{queue.data?.pages.flat().map(row => <ReviewRecord key={row.id} row={row} title={calls.data?.find(c => c.id === row.call_id)?.title || row.call_id} />)}{queue.hasNextPage && <Button type="button" disabled={queue.isFetchingNextPage} onClick={() => queue.fetchNextPage()}>Load more submissions</Button>}</section>
  </div>;
}
