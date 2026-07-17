import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { safeInternalPath } from "@/lib/security";
import { sanitizeUserFacingError } from "@/lib/authErrors";
import AuthLayout from "@/components/portal/AuthLayout";
import GoogleSignInButton, { AuthDivider } from "@/components/portal/GoogleSignInButton";
import {
  PortalAlert,
  PortalInput,
  PortalLabel,
  portalButtonPrimary,
  portalLinkClass,
} from "@/components/portal/PortalUI";
import { portalCopy } from "@/lib/portalCopy";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { signIn, signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = safeInternalPath(
    (location.state as { from?: string })?.from ?? searchParams.get("next") ?? undefined,
  );
  const rawFlash = (location.state as { message?: string })?.message;
  const flashMessage = rawFlash ? sanitizeUserFacingError(rawFlash) : undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!loading && user) return <Navigate to={from} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      navigate(from);
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
      title={portalCopy.auth.loginTitle}
      subtitle={portalCopy.auth.loginSubtitle}
      footer={
        <>
          {portalCopy.auth.loginFooter}{" "}
          <Link to="/signup" className={portalLinkClass}>
            {portalCopy.auth.loginFooterLink}
          </Link>
        </>
      }
    >
      <GoogleSignInButton onClick={handleGoogle} loading={googleLoading} />
      <AuthDivider />

      {flashMessage && <PortalAlert variant="success">{flashMessage}</PortalAlert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <PortalLabel htmlFor="email">Email</PortalLabel>
          <PortalInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <PortalLabel htmlFor="password">Password</PortalLabel>
            <Link to="/forgot-password" className={cn(portalLinkClass, "text-xs")}>
              Forgot password?
            </Link>
          </div>
          <PortalInput
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && <PortalAlert variant="error">{error}</PortalAlert>}
        <Button type="submit" className={cn("w-full", portalButtonPrimary)} disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in with email"}
        </Button>
      </form>
    </AuthLayout>
  );
}
