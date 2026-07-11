import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { parseAuthHashError } from "@/lib/appOrigin";
import { sanitizeUserFacingError } from "@/lib/authErrors";
import { Button } from "@/components/ui/button";
import { PortalFullPageShell } from "@/components/portal/PortalUI";

export default function AuthCallback() {
  const { user, loading, needsOnboarding } = useAuth();
  const navigate = useNavigate();
  const hashError = parseAuthHashError();
  const friendlyHashError = hashError
    ? hashError.includes("localhost")
      ? "Auth redirected to localhost. In Supabase → URL Configuration, set Site URL to your Vercel domain and add it to Redirect URLs."
      : sanitizeUserFacingError(hashError, "Sign-in was cancelled or could not be completed.")
    : null;

  useEffect(() => {
    if (friendlyHashError) {
      navigate("/login", {
        replace: true,
        state: { message: friendlyHashError },
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
  }, [user, loading, needsOnboarding, navigate, friendlyHashError]);

  if (friendlyHashError) {
    return (
      <PortalFullPageShell className="gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-amber-400" aria-hidden />
        <p className="max-w-md text-sm text-white/60" role="status">
          Redirecting…
        </p>
      </PortalFullPageShell>
    );
  }

  return (
    <PortalFullPageShell className="gap-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-400" aria-hidden />
      <p className="text-sm text-white/50" role="status">
        Completing sign in…
      </p>
      <Button
        variant="ghost"
        className="mt-4 text-white/40 hover:text-white"
        onClick={() => navigate("/login", { replace: true })}
      >
        Cancel
      </Button>
    </PortalFullPageShell>
  );
}
