import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { parseAuthHashError } from "@/lib/appOrigin";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const { user, loading, needsOnboarding } = useAuth();
  const navigate = useNavigate();
  const hashError = parseAuthHashError();

  useEffect(() => {
    if (hashError) {
      navigate("/login", {
        replace: true,
        state: {
          message: hashError.includes("localhost")
            ? "Auth redirected to localhost. In Supabase → URL Configuration, set Site URL to your Vercel domain and add it to Redirect URLs (not localhost)."
            : hashError,
        },
      });
      return;
    }

    if (loading) return;
    if (user) {
      navigate(needsOnboarding ? "/onboarding" : "/portal", { replace: true });
    } else {
      const timer = setTimeout(
        () =>
          navigate("/login", {
            replace: true,
            state: {
              message:
                "Sign-in could not be completed. If you used Google, check Supabase redirect URLs match your live site URL.",
            },
          }),
        4000,
      );
      return () => clearTimeout(timer);
    }
  }, [user, loading, needsOnboarding, navigate, hashError]);

  if (hashError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#060a12] px-4 text-white">
        <AlertCircle className="h-10 w-10 text-amber-400" />
        <p className="max-w-md text-center text-sm text-white/60">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#060a12] px-4 text-white">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      <p className="text-sm text-white/50">Completing sign in…</p>
      <Button
        variant="ghost"
        className="mt-4 text-white/40 hover:text-white"
        onClick={() => navigate("/login", { replace: true })}
      >
        Cancel
      </Button>
    </div>
  );
}
