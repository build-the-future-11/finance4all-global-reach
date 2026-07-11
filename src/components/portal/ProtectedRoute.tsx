import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PortalFullPageShell } from "@/components/portal/PortalUI";
import { portalCopy } from "@/lib/portalCopy";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding } = useAuth();
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
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
