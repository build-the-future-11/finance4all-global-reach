import { useId, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import { parseEditorialDraft, type EditorialDraftImport as DraftPackage } from "@/lib/editorial-import";
import { Button } from "@/components/ui/button";

export default function EditorialDraftImport() {
  const { user, profile } = useAuth();
  const id = useId();
  const client = useQueryClient();
  const [draft, setDraft] = useState<DraftPackage | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const mutation = useMutation({
    mutationFn: async () => {
      if (!draft || !user || profile?.role !== "admin") throw new Error("An administrator must import this draft.");
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!data.session?.access_token || data.session.user.id !== user.id) throw new Error("Your account changed. Sign in again.");
      // Explicit allowlisted content fields only. The server supplies draft
      // state; publication metadata is never accepted from a local file.
      const { data: receipt, error: importError } = await supabase.from("explainer_cards").insert(draft.article).select("id, slug, publication_state, publication_revision").single().setHeader("Authorization", `Bearer ${data.session.access_token}`);
      if (importError) throw importError;
      if (!receipt?.id || receipt.slug !== draft.article.slug || receipt.publication_state !== "draft" || receipt.publication_revision !== 0) throw new Error("A draft-only import could not be confirmed. Reload the queue before retrying.");
      return receipt;
    },
    onSuccess: () => { setDraft(null); setMessage("Draft imported. Select Explainers to review it. Publication requires a separate evidence-backed review."); void client.invalidateQueries({ queryKey: ["publication-queue"] }); },
    onError: failure => setError(failure.message),
  });
  if (profile?.role !== "admin") return null;
  return <details className="rounded-xl border border-border p-4"><summary className="cursor-pointer font-medium">Import a restricted editorial draft</summary><p className="mt-3 text-sm text-muted-foreground">Choose a local Finance Debriefed draft package. File contents stay in this review view until you explicitly import. Import creates an unpublished member-database draft; it does not release a public article or import the private claim pack into the article body.</p>
    <label htmlFor={id} className="mt-4 block text-sm font-medium">Draft package (JSON, up to 150 KB)</label><input id={id} type="file" accept="application/json,.json" disabled={mutation.isPending} className="mt-2 max-w-full text-sm" onChange={async event => { setDraft(null); setError(""); setMessage(""); const file = event.target.files?.[0]; if (!file) return; try { if (file.size > 150000) throw new Error("Draft package exceeds 150 KB."); setDraft(parseEditorialDraft(await file.text())); } catch (failure) { setError(failure instanceof Error ? failure.message : "Invalid draft package."); } }} />
    {draft && <div className="mt-4 space-y-4"><h3 className="font-serif text-xl font-semibold">{draft.article.title}</h3><p className="text-sm">DRAFT — NOT PUBLISHED</p><ul className="list-disc pl-5 text-sm">{draft.requiredReviews.map(item => <li key={item}>{item}</li>)}</ul><details><summary className="cursor-pointer">Inspect full draft</summary><pre className="mt-3 whitespace-pre-wrap break-words text-sm">{draft.article.body}</pre></details><details><summary className="cursor-pointer">Inspect source and claim pack</summary><p className="mt-3 text-sm"><a className="underline" href={draft.source.url} target="_blank" rel="noopener noreferrer">Source draft</a> · Modified {draft.source.modifiedAt}</p><p className="mt-2 text-sm"><a className="underline" href={draft.claimPack.url} target="_blank" rel="noopener noreferrer">Claim pack</a> · Modified {draft.claimPack.modifiedAt}</p><pre className="mt-3 whitespace-pre-wrap break-words text-sm">{draft.claimPack.content}</pre></details><Button disabled={mutation.isPending} onClick={() => { setError(""); mutation.mutate(); }}>{mutation.isPending ? "Importing draft…" : "Import as unpublished draft"}</Button></div>}
    {error && <p role="alert" className="mt-3 text-sm">{error}</p>}{message && <p role="status" className="mt-3 text-sm">{message}</p>}
  </details>;
}
