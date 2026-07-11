import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/portal/AuthLayout";
import PasswordStrengthMeter from "@/components/portal/PasswordStrengthMeter";
import {
  PortalAlert,
  PortalInput,
  PortalLabel,
  portalButtonPrimary,
  portalLinkClass,
} from "@/components/portal/PortalUI";
import { assessPassword, isPasswordAcceptable } from "@/lib/security";
import { portalCopy } from "@/lib/portalCopy";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  useDocumentTitle("Set new password");
  const { user, loading, updatePassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  const passwordCheck = useMemo(() => assessPassword(password), [password]);

  useEffect(() => {
    if (loading) return;
    if (user) {
      setReady(true);
      return;
    }
    const timer = setTimeout(() => navigate("/forgot-password", { replace: true }), 2000);
    return () => clearTimeout(timer);
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordAcceptable(password)) {
      setError(portalCopy.security.passwordTooShort);
      return;
    }
    if (password !== confirm) {
      setError(portalCopy.settings.passwordsMismatch);
      return;
    }

    setSubmitting(true);
    const { error: err } = await updatePassword(password);
    setSubmitting(false);

    if (err) setError(err);
    else navigate("/login", { replace: true, state: { message: portalCopy.auth.resetPasswordSuccess } });
  };

  if (loading || !ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-portal-bg text-white">
        <KeyRound className="h-8 w-8 text-emerald-400" aria-hidden />
        <p className="text-sm text-white/50" role="status">
          {portalCopy.auth.resetPasswordVerifying}
        </p>
      </div>
    );
  }

  return (
    <AuthLayout
      title={portalCopy.auth.resetPasswordTitle}
      subtitle={portalCopy.auth.resetPasswordSubtitle}
      footer={
        <Link to="/login" className={portalLinkClass}>
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <PortalLabel htmlFor="password">New password</PortalLabel>
          <PortalInput
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <PasswordStrengthMeter strength={passwordCheck.strength} hints={passwordCheck.hints} />
          <p className="mt-2 text-xs text-white/40">{portalCopy.security.passwordHints}</p>
        </div>
        <div>
          <PortalLabel htmlFor="confirm">Confirm password</PortalLabel>
          <PortalInput
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        {error && <PortalAlert variant="error">{error}</PortalAlert>}
        <Button type="submit" className={cn("w-full", portalButtonPrimary)} disabled={submitting}>
          {submitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
