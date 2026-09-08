import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/portal/AuthLayout";
import { portalInputClass } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withDeadline } from "@/lib/asyncDeadline";
import { getAuthRedirectUrl, supabase } from "@/lib/supabase";

const AUTH_OPERATION_TIMEOUT_MS = 15_000;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const { error: recoveryError } = await withDeadline(
        () =>
          supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: getAuthRedirectUrl("/reset-password"),
          }),
        AUTH_OPERATION_TIMEOUT_MS,
        "Password recovery",
      );
      if (recoveryError) throw recoveryError;
      setMessage("If an account exists for that address, a reset link is on its way.");
    } catch {
      setError("We could not request a recovery link. Please wait a moment and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll send a secure, single-use recovery link."
      footer={<Link to="/login" className="text-emerald-400 hover:underline">Back to sign in</Link>}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="recovery-email" className="text-white/70">Email</Label>
          <Input id="recovery-email" type="email" autoComplete="email" required value={email}
            onChange={(event) => setEmail(event.target.value)} className={portalInputClass} />
        </div>
        {error && <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        {message && <p role="status" className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{message}</p>}
        <Button type="submit" disabled={submitting} className="w-full bg-emerald-500 hover:bg-emerald-400">
          {submitting ? "Sending..." : "Send recovery link"}
        </Button>
      </form>
    </AuthLayout>
  );
}
