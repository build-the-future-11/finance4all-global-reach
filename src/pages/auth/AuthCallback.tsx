import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { readAuthCallbackError, takePostAuthPath } from "@/lib/auth-navigation";

export default function AuthCallback() {
  const { user, loading, needsOnboarding } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const authError = useMemo(
    () => readAuthCallbackError(location.search, location.hash),
    [location.hash, location.search],
  );

  useEffect(() => {
    if (loading || authError) return;
    if (user) {
      navigate(needsOnboarding ? "/onboarding" : takePostAuthPath(), { replace: true });
    } else {
      const timer = setTimeout(() => navigate("/login", { replace: true }), 2500);
      return () => clearTimeout(timer);
    }
  }, [authError, user, loading, needsOnboarding, navigate]);

  if (authError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060a12] px-4 text-white">
        <section className="w-full max-w-md border border-amber-400/25 bg-white/[0.04] p-6 text-center">
          <AlertTriangle className="mx-auto h-9 w-9 text-amber-300" />
          <h1 className="mt-4 text-xl font-semibold">Sign in was not completed</h1>
          <p role="alert" className="mt-2 text-sm leading-6 text-white/65">
            {authError.message}
          </p>
          <p className="mt-2 text-xs text-white/35">Reference: {authError.code}</p>
          <Button asChild className="mt-5 bg-emerald-500 text-black hover:bg-emerald-400">
            <Link to="/login">Return to sign in</Link>
          </Button>
        </section>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#060a12] text-white">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      <p className="text-sm text-white/50">Completing sign in…</p>
    </div>
  );
}
