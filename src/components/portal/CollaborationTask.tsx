import { useEffect, useRef, useState } from "react";
import { PortalCard } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Tables } from "@/types/database";

type TaskRecord = Tables<"project_tasks">;
type TaskDraft = Pick<TaskRecord, "status" | "evidence_url" | "revision">;

function editableValues(task: TaskRecord): TaskDraft {
  return { status: task.status, evidence_url: task.evidence_url, revision: task.revision };
}

export default function CollaborationTask({ task, canEdit, manager, onSave, onReload, pending }: {
  task: TaskRecord;
  canEdit: boolean;
  manager: boolean;
  onSave: (value: TaskDraft & { id: string }) => Promise<TaskRecord>;
  onReload: () => Promise<TaskRecord>;
  pending: boolean;
}) {
  const [draft, setDraft] = useState(() => editableValues(task));
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [operation, setOperation] = useState<"idle" | "saving" | "reloading">("idle");
  const busy = useRef(false);
  const disabled = pending || operation !== "idle";

  useEffect(() => {
    // Follow fresh server records only when there are no local edits. Never adopt
    // a newer revision for unsent edits, or regress after a confirmed write.
    if (!dirty && !busy.current && task.revision > draft.revision) {
      setDraft(editableValues(task));
      setMessage("");
      setError("");
    }
  }, [task, draft.revision, dirty, operation]);

  async function persist(action: "save" | "reload") {
    if (!canEdit || busy.current || pending) return;
    if (action === "reload" && dirty && !window.confirm("Discard unsaved task edits and reload the saved version?")) return;
    busy.current = true;
    setOperation(action === "save" ? "saving" : "reloading");
    setError("");
    setMessage("");
    try {
      const saved = action === "save" ? await onSave({ id: task.id, ...draft }) : await onReload();
      setDraft(editableValues(saved));
      setDirty(false);
      setMessage(action === "save" ? "Task saved." : "Saved task reloaded.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Task changes could not be confirmed. Your edits remain here.");
    } finally {
      busy.current = false;
      setOperation("idle");
    }
  }

  return <PortalCard className="space-y-3 p-5">
    <p className="text-xs uppercase">{task.kind} · Saved status: {task.status.replaceAll("_", " ")}</p>
    <h3 className="font-semibold text-lg">{task.title}</h3><p>{task.description}</p>
    <p>Due: {task.due_date ?? "No deadline"} · Assigned account: {task.assignee_id ?? "Unassigned"}</p>
    {task.evidence_url && <a href={task.evidence_url} target="_blank" rel="noopener noreferrer" className="underline">Open submitted evidence</a>}
    {canEdit && <form className="space-y-3" onSubmit={event => { event.preventDefault(); void persist("save"); }}>
      <label className="block">Status<select className="block w-full border rounded-md bg-background p-3" disabled={disabled} value={draft.status} onChange={event => {
        setDraft(current => ({ ...current, status: event.target.value as TaskRecord["status"] }));
        setDirty(true); setMessage("Unsaved changes.");
      }}>
        {["todo", "in_progress", "submitted", ...(manager ? ["done"] : [])].map(status => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
      </select></label>
      <label className="block">HTTPS evidence link<Input type="url" maxLength={1000} disabled={disabled} value={draft.evidence_url} onChange={event => {
        setDraft(current => ({ ...current, evidence_url: event.target.value }));
        setDirty(true); setMessage("Unsaved changes.");
      }} required={draft.status === "submitted" || draft.status === "done"} /></label>
      {dirty && task.revision > draft.revision && <p className="text-sm">A newer saved version is available. Your current edits remain unsaved; reload the task to review the saved version.</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={disabled}>{operation === "saving" ? "Saving task…" : "Save task"}</Button>
        <Button type="button" variant="outline" disabled={disabled} onClick={() => void persist("reload")}>{operation === "reloading" ? "Reloading task…" : "Reload saved task"}</Button>
      </div>
      <p role="status">{message}</p>
    </form>}
    {error && <p role="alert">{error}</p>}
  </PortalCard>;
}
