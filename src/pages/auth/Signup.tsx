import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CheckCircle2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AuthLayout from "@/components/portal/AuthLayout";
import GoogleSignInButton, { AuthDivider } from "@/components/portal/GoogleSignInButton";
import PasswordStrengthMeter from "@/components/portal/PasswordStrengthMeter";
import { assessPassword, isDisposableEmail, isPasswordAcceptable, isValidEmail } from "@/lib/security";
import {
  PortalAlert,
  PortalInput,
  PortalLabel,
  portalButtonPrimary,
  portalLinkClass,
} from "@/components/portal/PortalUI";
import { portalCopy } from "@/lib/portalCopy";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";

export default function Signup() {
  useDocumentTitle("Sign up");
  const { signUp, signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const passwordCheck = useMemo(() => assessPassword(password), [password]);

  if (!loading && user) return <Navigate to="/portal" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (honeypot) {
      setError(portalCopy.security.honeypotTriggered);
      return;
    }
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setError(
        isDisposableEmail(trimmedEmail)
          ? portalCopy.security.disposableEmail
          : portalCopy.security.invalidEmail,
      );
      return;
    }
    if (!isPasswordAcceptable(password)) {
      setError(portalCopy.security.passwordTooShort);
      return;
    }
    setSubmitting(true);
    const { error: err } = await signUp(trimmedEmail, password, displayName);
    setSubmitting(false);
    if (err) setError(err);
    else {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSuccess(true);
        setTimeout(() => navigate("/onboarding"), 1500);
      } else {
        setNeedsEmailConfirm(true);
      }
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(err);
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title={portalCopy.auth.signupTitle}
      subtitle={portalCopy.auth.signupSubtitle}
      footer={
        <>
          {portalCopy.auth.signupFooter}{" "}
          <Link to="/login" className={portalLinkClass}>
            {portalCopy.auth.signupFooterLink}
          </Link>
        </>
      }
    >
      {needsEmailConfirm ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <Mail className="h-10 w-10 text-emerald-400" aria-hidden />
          <p className="text-sm font-medium text-white">{portalCopy.auth.emailConfirmTitle}</p>
          <p className="text-sm text-white/55">
            {portalCopy.auth.emailConfirmBody}{" "}
            <span className="text-white/80">{email}</span>
          </p>
          <Link to="/login" className={cn(portalLinkClass, "mt-2 text-sm")}>
            Go to sign in
          </Link>
        </div>
      ) : success ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center" role="status">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" aria-hidden />
          <p className="text-sm text-emerald-300">Account created! Redirecting…</p>
        </div>
      ) : (
        <>
          <GoogleSignInButton onClick={handleGoogle} loading={googleLoading} label="Sign up with Google" />
          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="company"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <div>
              <PortalLabel htmlFor="name">Display name</PortalLabel>
              <PortalInput
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            <div>
              <PortalLabel htmlFor="email">Email</PortalLabel>
              <PortalInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <PortalLabel htmlFor="password">Password</PortalLabel>
              <PortalInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              {password.length > 0 && (
                <PasswordStrengthMeter strength={passwordCheck.strength} hints={passwordCheck.hints} />
              )}
              <p className="mt-2 text-xs text-white/40">{portalCopy.security.passwordHints}</p>
            </div>
            {error && <PortalAlert variant="error">{error}</PortalAlert>}
            <Button type="submit" className={cn("w-full", portalButtonPrimary)} disabled={submitting}>
              {submitting ? "Creating account…" : "Create account with email"}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
