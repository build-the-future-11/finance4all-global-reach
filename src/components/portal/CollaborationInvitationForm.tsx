import { useRef, useState } from "react";
import { PortalCard } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CollaborationInvitationForm({ onInvite, pending }: {
  onInvite: (memberId: string) => Promise<unknown>;
  pending: boolean;
}) {
  const [member, setMember] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const revision = useRef(0);

  async function invite() {
    if (busy.current || pending) return;
    busy.current = true;
    setSaving(true);
    setError("");
    setMessage("");
    const submittedMember = member.trim();
    const submittedRevision = revision.current;
    try {
      await onInvite(submittedMember);
      const newerEdits = revision.current !== submittedRevision;
      if (!newerEdits) setMember("");
      setMessage(`Invitation recorded for ${submittedMember}. The member must accept before accessing tasks.${newerEdits ? " Your newer edits have not been submitted." : ""}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "The invitation could not be confirmed. Your draft remains here; refresh memberships before retrying.");
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return <PortalCard className="p-5"><form className="space-y-3" onSubmit={event => { event.preventDefault(); void invite(); }}>
    <h2 className="text-xl font-semibold">Invite a member</h2>
    <label className="block">Member account ID<Input required value={member} onChange={event => {
      revision.current += 1;
      setMember(event.target.value);
      setError("");
      setMessage("");
    }} pattern="[0-9a-fA-F-]{36}" /></label>
    <p className="text-sm">Use the account ID from the member’s profile URL. Invitations are visible in their collaboration workspace.</p>
    <Button type="submit" disabled={pending || saving}>Create invitation</Button>
    {error && <p role="alert">{error}</p>}
    <p role="status">{message}</p>
  </form></PortalCard>;
}
