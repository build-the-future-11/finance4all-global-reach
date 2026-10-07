import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export type DraftAnswers = { motivation: string; preparation: string; availability: string; work_url: string };

export default function ApplicationDraft({
  callId, answers, onRestore, disabled = false,
}: {
  callId: string;
  answers: DraftAnswers;
  onRestore: (answers: DraftAnswers) => void;
  disabled?: boolean;
}) {
  const { user } = useAuth();
  const client = useQueryClient();
  const [revision, setRevision] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [canRetrySave, setCanRetrySave] = useState(false);
  const [operation, setOperation] = useState<"idle" | "saving" | "deleting">("idle");
  const [retry, setRetry] = useState(0);
  // One lock covers both mutations, including the interval before React rerenders.
  const busy = useRef(false);
  const alive = useRef(true);
  const lastSaved = useRef("");
  const serialized = JSON.stringify(answers);

  const draft = useQuery({
    queryKey: ["application-draft", user?.id, callId],
    enabled: Boolean(user && callId),
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.from("application_drafts")
        .select("*").eq("user_id", user!.id).eq("call_id", callId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    if (draft.isSuccess && !draft.data && !paused) setReady(true);
  }, [draft.isSuccess, draft.data, paused]);

  useEffect(() => {
    if (!user || !ready || paused || disabled || error || busy.current || operation !== "idle"
      || lastSaved.current === serialized) return;
    // Avoid creating an empty draft, but persist an intentional clear of an existing one.
    if (revision === null && !Object.values(answers).some(Boolean)) return;

    const timer = setTimeout(() => {
      if (busy.current) return;
      busy.current = true;
      setOperation("saving");
      setMessage("Saving private draft…");
      const payload = JSON.parse(serialized) as DraftAnswers;
      const query = revision === null
        ? supabase.from("application_drafts").insert({ call_id: callId, ...payload }).select("*").single()
        : supabase.from("application_drafts").update(payload).eq("user_id", user.id)
          .eq("call_id", callId).eq("revision", revision).select("*").maybeSingle();

      void Promise.resolve(query).then(result => {
        if (!alive.current) return;
        if (result.error || !result.data) {
          const conflict = result.error?.code === "23505" || !result.error;
          setCanRetrySave(!conflict);
          setError(conflict
            ? "Draft changed in another session. Download your answers, then reload this page to choose the saved version."
            : "Draft save failed. Your answers remain on this page. Retry saving when connected.");
          setMessage("");
        } else {
          lastSaved.current = serialized;
          setRevision(result.data.revision);
          client.setQueryData(["application-draft", user.id, callId], result.data);
          setMessage("Private draft saved to your account. Consent must be confirmed when submitting.");
        }
      }, () => {
        if (alive.current) {
          setCanRetrySave(true);
          setError("Draft save failed. Your answers remain on this page.");
          setMessage("");
        }
      }).finally(() => {
        busy.current = false;
        if (alive.current) {
          setOperation("idle");
          setRetry(n => n + 1);
        }
      });
    }, 1_000);
    return () => clearTimeout(timer);
  }, [serialized, answers, ready, paused, disabled, error, revision, user, callId, retry, client, operation]);

  async function deleteDraft() {
    const savedRevision = revision ?? draft.data?.revision;
    if (!user || busy.current || disabled || paused || savedRevision === undefined) return;
    if (!window.confirm("Delete the saved draft? Your current answers remain on this page. Automatic saving will stop until you reload.")) return;
    busy.current = true;
    setOperation("deleting");
    setError("");
    setCanRetrySave(false);
    setMessage("Deleting saved draft…");
    try {
      const { data, error } = await supabase.from("application_drafts").delete()
        .eq("user_id", user.id).eq("call_id", callId).eq("revision", savedRevision)
        .select("call_id").maybeSingle();
      if (!alive.current) return;
      if (error || !data) {
        setError("Deletion could not be confirmed. Reload before retrying.");
        setMessage("");
        return;
      }
      setPaused(true);
      setReady(false);
      setRevision(null);
      await client.cancelQueries({ queryKey: ["application-draft", user.id, callId], exact: true });
      client.setQueryData(["application-draft", user.id, callId], null);
      if (alive.current) setMessage("Draft deleted. Automatic saving is paused until you reload.");
    } catch {
      if (alive.current) {
        setError("Deletion could not be confirmed. Your current answers remain on this page. Reload before retrying.");
        setMessage("");
      }
    } finally {
      busy.current = false;
      if (alive.current) setOperation("idle");
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ call_id: callId, ...answers }, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "application-draft.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }

  if (!callId) return null;
  return <div className="space-y-2 rounded-md border p-4">
    <h2 className="font-semibold">Private application draft</h2>
    <p className="text-sm">Draft answers are saved to your account, visible only to you, and retained until you delete the draft or your account. A draft is not a submitted application.</p>
    {draft.isLoading && <p role="status">Checking for a saved draft…</p>}
    {draft.error && <div className="space-y-2">
      <p role="alert">Draft storage is unavailable. Submission remains separate; keep a download of your answers.</p>
      <Button type="button" variant="outline" disabled={draft.isFetching || operation !== "idle" || paused} onClick={() => void draft.refetch()}>Retry draft lookup</Button>
    </div>}
    {draft.data && !ready && !paused && <Button type="button" variant="outline" disabled={disabled || operation !== "idle"} onClick={() => {
      const { motivation, preparation, availability, work_url } = draft.data!;
      const saved = { motivation, preparation, availability, work_url };
      lastSaved.current = JSON.stringify(saved);
      setRevision(draft.data!.revision);
      onRestore(saved);
      setReady(true);
    }}>Resume saved draft</Button>}
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" onClick={download}>Download current answers</Button>
      {!paused && (revision !== null || draft.data) && <Button type="button" variant="outline" disabled={disabled || operation !== "idle"} onClick={() => void deleteDraft()}>
        {operation === "deleting" ? "Deleting saved draft…" : "Delete saved draft"}
      </Button>}
      {error && canRetrySave && <Button type="button" variant="outline" disabled={disabled || operation !== "idle"} onClick={() => { setError(""); setRetry(n => n + 1); }}>Retry draft save</Button>}
    </div>
    <p role="status">{message}</p>
    {error && <p role="alert">{error}</p>}
  </div>;
}
