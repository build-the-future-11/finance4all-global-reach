import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/portal/AuthLayout";
import { portalInputClass } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 10) return setError("Use at least 10 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (updateError) return setError(updateError.message);
    navigate("/portal", { replace: true });
  };

  return (
    <AuthLayout title="Choose a new password" subtitle="Your new password must be at least 10 characters." footer={null}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="new-password" className="text-white/70">New password</Label>
          <Input id="new-password" type="password" autoComplete="new-password" required minLength={10}
            value={password} onChange={(event) => setPassword(event.target.value)} className={portalInputClass} />
        </div>
        <div>
          <Label htmlFor="confirm-password" className="text-white/70">Confirm password</Label>
          <Input id="confirm-password" type="password" autoComplete="new-password" required minLength={10}
            value={confirm} onChange={(event) => setConfirm(event.target.value)} className={portalInputClass} />
        </div>
        {error && <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full bg-emerald-500 hover:bg-emerald-400">
          {submitting ? "Updating..." : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
