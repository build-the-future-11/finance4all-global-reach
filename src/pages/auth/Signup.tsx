import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CheckCircle2, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AuthLayout from "@/components/portal/AuthLayout";
import GoogleSignInButton, { AuthDivider } from "@/components/portal/GoogleSignInButton";
import PasswordStrengthMeter from "@/components/portal/PasswordStrengthMeter";
import { assessPassword } from "@/lib/security";
import { portalInputClass } from "@/components/portal/PortalUI";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  if (!loading && user) return <Navigate to="/portal" replace />;

  const passwordCheck = useMemo(() => assessPassword(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await signUp(email, password, displayName);
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
      title="Join Finance4All"
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
      {needsEmailConfirm ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <Mail className="h-10 w-10 text-emerald-400" />
          <p className="text-sm font-medium text-white">Check your email</p>
          <p className="text-sm text-white/55">
            We sent a confirmation link to <span className="text-white/80">{email}</span>. Click it
            to activate your account, then sign in.
          </p>
          <Link to="/login" className="mt-2 text-sm font-medium text-emerald-400 hover:underline">
            Go to sign in
          </Link>
        </div>
      ) : success ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          <p className="text-sm text-emerald-300">Account created! Redirecting…</p>
        </div>
      ) : (
        <>
          <GoogleSignInButton onClick={handleGoogle} loading={googleLoading} label="Sign up with Google" />
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
                minLength={8}
                autoComplete="new-password"
                className={portalInputClass}
              />
              {password.length > 0 && (
                <PasswordStrengthMeter strength={passwordCheck.strength} hints={passwordCheck.hints} />
              )}
            </div>
            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account with email"}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
