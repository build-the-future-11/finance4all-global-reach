import ApplicationDraft from "@/components/portal/ApplicationDraft";
import ApplicationHistory from "@/components/portal/ApplicationHistory";
import { useAuth } from "@/contexts/useAuth";
import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useIntakeCalls, useIntakeSubmissions, useSubmitIntake, useReviewIntake } from "@/hooks/portal/useIntake";
import { callAcceptsSubmissions, intakeError, intakeSchema, type IntakeSubmission } from "@/lib/intake";
import { PortalCard, PortalPageHeader, LoadingState } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function SubmissionPrivacy() {
  return <div className="space-y-2 text-sm text-muted-foreground"><h2 className="font-semibold text-foreground">Submission privacy · 21 September 2026</h2><p>Your account ID, answers, optional public link, consent version and submission/review timestamps are stored in Supabase. Only you and authorized administrators can read these answers. Review notes are visible to you.</p><p>Do not include financial account details, identity documents, home addresses, health information or someone else’s personal data. This form does not require a birth date or personal financial history.</p><p>You can download your records here and withdraw from review. Withdrawal retains the record; request deletion in account settings. Records remain until the account is deleted or the team completes a deletion request; no automatic retention deadline is currently configured. External forms have separate privacy terms.</p><p>Interest is not admission, employment, publication, or an investment offer. Participation by minors needs an age-appropriate process and any required guardian involvement before joining activities.</p></div>;
}
function exportReceipt(row: IntakeSubmission) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(row, null, 2)], { type: "application/json" }));
  const link = document.createElement("a"); link.href = url; link.download = `financemeta-submission-${row.id}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Intake() {
  const { user } = useAuth();
  const [params] = useSearchParams(); const calls = useIntakeCalls(); const submissions = useIntakeSubmissions();
  const submit = useSubmitIntake(); const withdraw = useReviewIntake();
  const [callId, setCallId] = useState(params.get("call") || "");
  const [motivation, setMotivation] = useState(""); const [preparation, setPreparation] = useState("");
  const [availability, setAvailability] = useState(""); const [workUrl, setWorkUrl] = useState(""); const [consent, setConsent] = useState(false);
  const [error, setError] = useState(""); const [receipt, setReceipt] = useState<IntakeSubmission | null>(null);
  const requestId = useRef(crypto.randomUUID()); const submitting = useRef(false);
  const selected = calls.data?.find(c => c.id === callId); const rows = submissions.data?.pages.flat() || [];
  const receiptHasUnsentEdits = receipt !== null && (
    receipt.call_id !== callId || receipt.motivation !== motivation.trim()
    || receipt.preparation !== preparation.trim() || receipt.availability !== availability.trim()
    || (receipt.work_url ?? "") !== workUrl.trim()
  );
  return <div className="space-y-6"><PortalPageHeader title="Applications & research submissions" description="Share a question, relevant preparation, and a realistic commitment. Each submission receives a private record you can revisit." />
    {calls.isLoading && <LoadingState />}
    {calls.error && <PortalCard className="p-6"><p role="alert">{intakeError(calls.error)}</p><a href="https://tally.so/r/5B7blP" className="underline">Existing application form</a><Button type="button" variant="outline" onClick={() => calls.refetch()}>Retry</Button></PortalCard>}
    {calls.data && <PortalCard className="p-6"><form className="space-y-5" onSubmit={async e => {
      e.preventDefault(); if (submitting.current) return; setError("");
      const parsed = intakeSchema.safeParse({ call_id: callId, motivation, preparation, availability, work_url: workUrl, consent });
      if (!parsed.success) { setError(parsed.error.issues.map(i => i.message).join(" ")); return; }
      submitting.current = true;
      try { const saved = await submit.mutateAsync({ input: parsed.data, requestId: requestId.current }); setReceipt(saved); }
      catch (err) { setError(intakeError(err)); } finally { submitting.current = false; }
    }}>
      <label className="block space-y-2">Application or interest call<select className="block w-full rounded-md border border-input bg-background p-3" required value={callId} disabled={submit.isPending || Boolean(receipt)} onChange={e => { setCallId(e.target.value); setMotivation(""); setPreparation(""); setAvailability(""); setWorkUrl(""); setConsent(false); requestId.current = crypto.randomUUID(); }}><option value="">Choose a call</option>{calls.data.map(c => <option key={c.id} value={c.id}>{c.title} · {callAcceptsSubmissions(c) ? c.status : "closed"}</option>)}</select></label>
      {selected && <div className="border-l-2 border-primary pl-4"><p>{selected.description}</p><p className="mt-2 text-sm text-muted-foreground">{selected.closes_at ? `Closes ${new Date(selected.closes_at).toLocaleString()}` : "No scheduled deadline."} {selected.status === "interest" && "Expression of interest only."}</p></div>}
      {callId && <ApplicationDraft key={`${user?.id}-${callId}`} callId={callId} answers={{motivation,preparation,availability,work_url:workUrl}} disabled={submit.isPending || Boolean(receipt)} onRestore={saved=>{setMotivation(saved.motivation);setPreparation(saved.preparation);setAvailability(saved.availability);setWorkUrl(saved.work_url);setConsent(false);}} />}
      <fieldset disabled={submit.isPending || Boolean(receipt)} className="space-y-5"><legend className="sr-only">Your application</legend>
      <label className="block space-y-2">Question or contribution (80–4,000 characters)<Textarea required minLength={80} maxLength={4000} rows={6} value={motivation} onChange={e => setMotivation(e.target.value)} /></label>
      <label className="block space-y-2">Relevant preparation (30–2,000 characters)<Textarea required minLength={30} maxLength={2000} rows={4} value={preparation} onChange={e => setPreparation(e.target.value)} /></label>
      <label className="block space-y-2">Availability and timezone<Input required minLength={3} maxLength={160} value={availability} onChange={e => setAvailability(e.target.value)} /></label>
      <label className="block space-y-2">Public work sample, manuscript or repository (optional)<Input type="url" maxLength={500} value={workUrl} onChange={e => setWorkUrl(e.target.value)} /></label>
      <SubmissionPrivacy />
      <label className="flex items-start gap-3"><input className="mt-1" type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} /><span>I have read the submission privacy notice and agree to send these answers for review.</span></label>
      </fieldset>
      <p role="alert" className="text-destructive">{error}</p>
      {!receipt && <Button type="submit" disabled={submit.isPending || !selected || !callAcceptsSubmissions(selected)}>{submit.isPending ? "Saving submission…" : "Submit for review"}</Button>}
      {receipt && <div role="status" className="space-y-2 border border-primary p-4"><h2 className="font-semibold">Submission saved</h2><p>Receipt: {receipt.id}</p><p>Status: {receipt.status.replaceAll("_", " ")}. No acceptance or response date is promised.</p>{receiptHasUnsentEdits && <p className="font-medium">Your earlier submission was already saved. The edits currently shown in the form were not submitted. Download your current answers before starting another submission. The receipt contains the saved answers.</p>}<Button type="button" variant="outline" onClick={() => exportReceipt(receipt)}>Download receipt</Button><Button type="button" variant="ghost" onClick={() => { setReceipt(null); setCallId(""); setMotivation(""); setPreparation(""); setAvailability(""); setWorkUrl(""); setConsent(false); requestId.current = crypto.randomUUID(); }}>Start another submission</Button></div>}
    </form></PortalCard>}
    <section className="space-y-4"><h2 className="text-xl font-semibold">Your submissions</h2><Button type="button" variant="outline" onClick={() => submissions.refetch()}>Refresh submissions</Button>
      {submissions.isLoading && <LoadingState />}{submissions.error && <p role="alert">{intakeError(submissions.error)}</p>}
      {submissions.isSuccess && !rows.length && <p>You have no submissions yet.</p>}
      {rows.map(row => <PortalCard key={row.id} className="space-y-3 p-5"><h3 className="font-semibold">{calls.data?.find(c => c.id === row.call_id)?.title || row.call_id}</h3><p>{row.status.replaceAll("_", " ")} · {new Date(row.created_at).toLocaleDateString()}</p><p className="break-all text-xs">Receipt: {row.id}</p><p className="whitespace-pre-wrap">{row.motivation}</p>{row.review_note && <p>Review note: {row.review_note}</p>}<ApplicationHistory submissionId={row.id} /><div className="flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={() => exportReceipt(row)}>Download record</Button>{row.status !== "withdrawn" && <Button type="button" variant="outline" disabled={withdraw.isPending} onClick={async () => { if (!window.confirm("Withdraw this submission from review? The record will be retained and cannot be resubmitted to the same call.")) return; try { await withdraw.mutateAsync({ id: row.id, status: "withdrawn" }); setError(""); } catch (err) { setError(intakeError(err)); } }}>Withdraw</Button>}</div></PortalCard>)}
      {submissions.hasNextPage && <Button type="button" disabled={submissions.isFetchingNextPage} onClick={() => submissions.fetchNextPage()}>Load more submissions</Button>}
    </section></div>;
}
