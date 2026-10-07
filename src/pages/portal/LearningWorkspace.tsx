import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { editorialExplainers } from "@/content/editorial";
import { useMemberLearning } from "@/hooks/portal/useMemberLearning";
import { PortalPageHeader, PortalCard, QueryStatus } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/types/database";
import { useAuth } from "@/contexts/useAuth";

function LessonRecord({ lesson, saved, onReload, onSave, pending }: {
  lesson: typeof editorialExplainers[number];
  saved?: Tables<"member_learning">;
  onReload: () => Promise<{ record?: Tables<"member_learning"> } | null>;
  onSave: (value: { lessonId: string; completed: boolean; notes: string; revision: number | null }) => Promise<Tables<"member_learning">>;
  pending: boolean;
}) {
  const [notes, setNotes] = useState(saved?.notes ?? "");
  const [completed, setCompleted] = useState(saved?.completed ?? false);
  const [revision, setRevision] = useState(saved?.revision ?? null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [operation, setOperation] = useState<"idle" | "saving" | "reloading">("idle");
  const busy = useRef(false);
  const disabled = pending || operation !== "idle";

  async function persist(action: "save" | "reload") {
    if (busy.current || pending) return;
    if (action === "reload" && !window.confirm("Discard unsaved edits and reload this lesson from your account?")) return;
    busy.current = true;
    setOperation(action === "save" ? "saving" : "reloading");
    setError("");
    setMessage("");
    try {
      if (action === "save") {
        const row = await onSave({ lessonId: lesson.slug, completed, notes, revision });
        setRevision(row.revision);
        setMessage("Saved to your account.");
      } else {
        const result = await onReload();
        // A failed query keeps the editor intact and is reported by the page.
        // Successful absence is distinct: the saved record was removed.
        if (!result) return;
        setNotes(result.record?.notes ?? "");
        setCompleted(result.record?.completed ?? false);
        setRevision(result.record?.revision ?? null);
        setMessage("Saved version reloaded.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "The action could not be confirmed. Your notes remain here.");
    } finally {
      busy.current = false;
      setOperation("idle");
    }
  }

  return <PortalCard className="space-y-3 p-5">
    <h2 className="text-xl font-semibold"><Link to={"/portal/debriefed/explainers/" + lesson.slug}>{lesson.title}</Link></h2>
    <p>{lesson.dek}</p><p>{lesson.readMinutes} minutes · Self-reported reading progress</p>
    <label className="flex items-center gap-3"><input type="checkbox" disabled={disabled} checked={completed} onChange={event => {
      if (busy.current || pending) return;
      setCompleted(event.target.checked); setMessage("Unsaved changes.");
    }} />I have read this lesson</label>
    <label className="block">Private notes<Textarea disabled={disabled} value={notes} maxLength={12000} onChange={event => {
      if (busy.current || pending) return;
      setNotes(event.target.value); setMessage("Unsaved changes.");
    }} rows={5} /></label>
    <div className="flex flex-wrap gap-3">
      <Button disabled={disabled} onClick={() => void persist("save")}>{operation === "saving" ? "Saving progress…" : "Save progress & notes"}</Button>
      <Button variant="outline" disabled={disabled} onClick={() => void persist("reload")}>{operation === "reloading" ? "Reloading saved version…" : "Reload saved version"}</Button>
    </div>
    <p role="status">{message}</p>{error && <p role="alert">{error}</p>}
  </PortalCard>;
}

export default function LearningWorkspace() {
  const { user } = useAuth();
  const { records, save } = useMemberLearning();
  const [selected, setSelected] = useState("");
  const completed = records.data?.filter(record => record.completed && editorialExplainers.some(lesson => lesson.slug === record.lesson_id)) ?? [];
  const next = editorialExplainers.find(lesson => !completed.some(record => record.lesson_id === lesson.slug));
  const hasLoadedRecords = records.data !== undefined;

  function exportNotes() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(records.data ?? [], null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-learning-notes.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="space-y-6">
    <PortalPageHeader title="Your learning" description="Continue reading and keep private notes. Saved progress follows your account across devices; it is not a qualification or assessment." />
    <QueryStatus isLoading={records.isLoading} error={hasLoadedRecords ? null : records.error} onRetry={() => void records.refetch()}>
      {hasLoadedRecords && records.error && <PortalCard className="space-y-3 p-4">
        <p role="alert">Learning records could not be refreshed. Your current notes remain on this page. Saved progress and exported records may be out of date.</p>
        <Button variant="outline" disabled={records.isFetching} onClick={() => void records.refetch()}>Retry learning refresh</Button>
      </PortalCard>}
      <p>{completed.length} of {editorialExplainers.length} lessons marked read.</p>
      {next && <Link className="underline" to={"/portal/debriefed/explainers/" + next.slug}>Continue learning: {next.title}</Link>}
      <p className="text-sm text-muted-foreground">Notes and reading records are private to your account and deleted with it. Changes are saved only when you choose Save.</p>
      <Button variant="outline" onClick={exportNotes}>Export learning records</Button>
      <label className="block">Lesson<select className="block w-full border rounded-md bg-background p-3" value={selected} onChange={event => setSelected(event.target.value)}>
        <option value="">Choose a lesson</option>{editorialExplainers.map(lesson => <option key={lesson.slug} value={lesson.slug}>{lesson.title}</option>)}
      </select></label>
      {editorialExplainers.filter(lesson => lesson.slug === selected).map(lesson => <LessonRecord
        key={`${user?.id}-${lesson.slug}`} lesson={lesson}
        saved={records.data?.find(record => record.lesson_id === lesson.slug)}
        pending={save.isPending} onSave={save.mutateAsync}
        onReload={async () => {
          const result = await records.refetch();
          return result.error || result.data === undefined ? null : { record: result.data.find(record => record.lesson_id === lesson.slug) };
        }}
      />)}
    </QueryStatus>
  </div>;
}
