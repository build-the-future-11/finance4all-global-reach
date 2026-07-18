import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PortalFullPageShell, portalButtonPrimary } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, needsOnboarding, refreshProfile, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <PortalFullPageShell>
        <div className="portal-glass flex flex-col items-center gap-4 rounded-2xl px-10 py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white">
            F4
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" aria-hidden />
          <p className="text-sm text-white/50" role="status">
            Securing your session…
          </p>
        </div>
      </PortalFullPageShell>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: `${location.pathname}${location.search}${location.hash}` }} replace />;
  }

  if (!profile) {
    return (
      <PortalFullPageShell>
        <div className="portal-glass max-w-md space-y-4 rounded-2xl px-8 py-10 text-center">
          <h1 className="text-lg font-semibold text-white">Profile unavailable</h1>
          <p className="text-sm text-white/55">
            Your account session is active, but we could not load your member profile. Retry or sign
            out and try again. If this continues, contact Finance4All support.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" className={cn(portalButtonPrimary)} onClick={() => void refreshProfile()}>
              Retry
            </Button>
            <Button type="button" variant="outline" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </PortalFullPageShell>
    );
  }

  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
