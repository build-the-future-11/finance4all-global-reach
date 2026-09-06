import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, MailCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/portal/AuthLayout";
import GoogleSignInButton, { AuthDivider } from "@/components/portal/GoogleSignInButton";
import { portalInputClass } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPublicAuthSettings, type PublicAuthSettings } from "@/lib/supabase";

export default function Signup() {
  const { signUp, signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<"session" | "confirmation" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authSettings, setAuthSettings] = useState<PublicAuthSettings | null>(null);

  useEffect(() => {
    let active = true;
    void getPublicAuthSettings().then((settings) => {
      if (active) setAuthSettings(settings);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!loading && user) return <Navigate to="/portal" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err, emailConfirmationRequired } = await signUp(
      email.trim(),
      password,
      displayName.trim(),
    );
    setSubmitting(false);
    if (err) {
      setError(
        err.toLowerCase().includes("signup") && err.toLowerCase().includes("disabled")
          ? "New member signup is temporarily closed. Existing members can still sign in."
          : err,
      );
    }
    else {
      if (emailConfirmationRequired) {
        setSuccess("confirmation");
      } else {
        setSuccess("session");
        setTimeout(() => navigate("/onboarding", { replace: true }), 900);
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
      title="Join FinanceMeta"
      subtitle="Create your member account to unlock the full portal."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-emerald-400 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {success ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          {success === "confirmation" ? (
            <MailCheck className="h-10 w-10 text-emerald-400" />
          ) : (
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          )}
          <p role="status" className="text-sm text-emerald-200">
            {success === "confirmation"
              ? "Check your inbox and confirm your email. Then sign in to complete your member profile."
              : "Account created. Opening your member profile..."}
          </p>
          {success === "confirmation" && (
            <Button asChild variant="outline" className="mt-2 border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]">
              <Link to="/login">Go to sign in</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          {authSettings && !authSettings.signupsEnabled && (
            <div role="alert" className="mb-4 flex gap-3 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-3 text-sm text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>New member signup is currently closed at the authentication provider. Existing members can still sign in.</p>
            </div>
          )}
          <GoogleSignInButton
            onClick={handleGoogle}
            loading={googleLoading}
            label="Sign up with Google"
            disabled={authSettings?.signupsEnabled === false || authSettings?.googleEnabled === false}
          />
          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white/70">
                Display name
              </Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className={portalInputClass}
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white/70">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={portalInputClass}
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white/70">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={10}
                className={portalInputClass}
              />
            </div>
            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400"
              disabled={submitting || authSettings?.signupsEnabled === false || authSettings?.emailEnabled === false}
            >
              {submitting ? "Creating account…" : "Create account with email"}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
