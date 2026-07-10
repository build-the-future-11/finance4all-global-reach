import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/portal/AuthLayout";
import PasswordStrengthMeter from "@/components/portal/PasswordStrengthMeter";
import { portalInputClass } from "@/components/portal/PortalUI";
import { assessPassword, isPasswordAcceptable } from "@/lib/security";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      setError("Password must be at least 8 characters with letters and numbers.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const { error: err } = await updatePassword(password);
    setSubmitting(false);

    if (err) setError(err);
    else navigate("/login", { replace: true, state: { message: "Password updated. Sign in with your new password." } });
  };

  if (loading || !ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#060a12] text-white">
        <KeyRound className="h-8 w-8 text-emerald-400" />
        <p className="text-sm text-white/50">Verifying reset link…</p>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a strong password for your Finance4All account."
      footer={
        <Link to="/login" className="font-medium text-emerald-400 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password" className="text-white/70">
            New password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className={portalInputClass}
          />
          <PasswordStrengthMeter check={passwordCheck} />
        </div>
        <div>
          <Label htmlFor="confirm" className="text-white/70">
            Confirm password
          </Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            className={portalInputClass}
          />
        </div>
        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400" disabled={submitting}>
          {submitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
