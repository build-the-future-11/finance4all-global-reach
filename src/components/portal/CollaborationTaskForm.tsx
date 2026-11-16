import { useRef, useState } from "react";
import { PortalCard } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Tables } from "@/types/database";

type NewTask = Pick<Tables<"project_tasks">, "title" | "description" | "kind" | "assignee_id" | "due_date">;
type Draft = { title: string; description: string; kind: NewTask["kind"]; assignee: string; due: string };

export default function CollaborationTaskForm({ leadResearcherId, activeMemberIds, onCreate, pending }: {
  leadResearcherId?: string;
  activeMemberIds: string[];
  onCreate: (value: NewTask) => Promise<unknown>;
  pending: boolean;
}) {
  const [draft, setDraft] = useState<Draft>({ title: "", description: "", kind: "task", assignee: "", due: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const revision = useRef(0);

  function edit(change: Partial<Draft>) {
    revision.current += 1;
    setDraft(current => ({ ...current, ...change }));
    setMessage("");
    setError("");
  }

  async function create() {
    if (busy.current || pending) return;
    busy.current = true;
    setSaving(true);
    setError("");
    setMessage("");
    const submittedRevision = revision.current;
    const input: NewTask = {
      title: draft.title.trim(),
      description: draft.description,
      kind: draft.kind,
      assignee_id: draft.assignee || null,
      due_date: draft.due || null,
    };
    try {
      await onCreate(input);
      const newerEdits = revision.current !== submittedRevision;
      // The user may keep drafting while the confirmed mutation refreshes the
      // task list. Clear only the exact draft that was sent.
      if (!newerEdits) setDraft(current => ({ ...current, title: "", description: "" }));
      setMessage(`Work item created: ${input.title}.${newerEdits ? " Your newer edits have not been submitted." : ""}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "The work item could not be confirmed. Your draft remains here; refresh the task list before retrying.");
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return <PortalCard className="p-5"><form className="space-y-3" onSubmit={event => { event.preventDefault(); void create(); }}>
    <h2 className="text-xl font-semibold">Define work</h2>
    <label className="block">Title<Input required minLength={3} maxLength={200} value={draft.title} onChange={event => edit({ title: event.target.value })} /></label>
    <label className="block">Description<Input maxLength={4000} value={draft.description} onChange={event => edit({ description: event.target.value })} /></label>
    <label className="block">Kind<select className="block border bg-background p-3" value={draft.kind} onChange={event => edit({ kind: event.target.value as Draft["kind"] })}>
      <option value="task">Task</option><option value="milestone">Milestone</option>
    </select></label>
    <label className="block">Assign to<select className="block w-full border bg-background p-3" value={draft.assignee} onChange={event => edit({ assignee: event.target.value })}>
      <option value="">Unassigned</option>
      {leadResearcherId && <option value={leadResearcherId}>Project lead</option>}
      {activeMemberIds.filter(id => id !== leadResearcherId).map(id => <option key={id} value={id}>{id}</option>)}
    </select></label>
    <label className="block">Due date<Input type="date" value={draft.due} onChange={event => edit({ due: event.target.value })} /></label>
    <Button type="submit" disabled={pending || saving}>Create work item</Button>
    {error && <p role="alert">{error}</p>}
    <p role="status">{message}</p>
  </form></PortalCard>;
}
