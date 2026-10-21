import { useId, useRef, useState } from "react";
import { PortalCard } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function CollaborationInvitationForm({ onInvite, pending }: {
  onInvite: (memberId: string) => Promise<unknown>;
  pending: boolean;
}) {
  const [member, setMember] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [memberInvalid, setMemberInvalid] = useState(false);
  const busy = useRef(false);
  const revision = useRef(0);
  const memberInput = useRef<HTMLInputElement>(null);
  const errorId = useId();

  async function invite() {
    if (busy.current || pending) return;
    const submittedMember = member.trim();
    if (!UUID_PATTERN.test(submittedMember)) {
      setMemberInvalid(true);
      setError("Choose a valid member account ID from the member’s profile URL.");
      setMessage("");
      memberInput.current?.focus();
      return;
    }
    busy.current = true;
    setSaving(true);
    setMemberInvalid(false);
    setError("");
    setMessage("");
    const submittedRevision = revision.current;
    try {
      await onInvite(submittedMember);
      const newerEdits = revision.current !== submittedRevision;
      if (!newerEdits) setMember("");
      setMessage(`Invitation recorded for ${submittedMember}. The member must accept before accessing tasks.${newerEdits ? " Your newer edits have not been submitted." : ""}`);
    } catch (error) {
      const newerEdits = revision.current !== submittedRevision;
      const reason = error instanceof Error ? error.message : "The invitation could not be confirmed. Your draft remains here; refresh memberships before retrying.";
      setError(newerEdits ? `${reason} Invitation for ${submittedMember} was not confirmed. Your newer edits have not been submitted.` : reason);
      if (!newerEdits) memberInput.current?.focus();
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return <PortalCard className="p-5"><form noValidate className="space-y-3" onSubmit={event => { event.preventDefault(); void invite(); }}>
    <h2 className="text-xl font-semibold">Invite a member</h2>
    <label className="block">Member account ID<Input required value={member} onChange={event => {
      revision.current += 1;
      setMember(event.target.value);
      setMemberInvalid(false);
      setError("");
      setMessage("");
    }} ref={memberInput} aria-invalid={memberInvalid || undefined} aria-describedby={error ? errorId : undefined} pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}" title="A complete member account UUID, including hyphens" /></label>
    <p className="text-sm">Use the account ID from the member’s profile URL. Invitations are visible in their collaboration workspace.</p>
    <Button type="submit" disabled={pending || saving}>Create invitation</Button>
    {error && <p id={errorId} role="alert">{error}</p>}
    <p role="status">{message}</p>
  </form></PortalCard>;
}
