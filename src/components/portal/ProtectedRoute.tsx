import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import AccountRecovery from "@/components/portal/AccountRecovery";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding, initializationError } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060a12] text-white" aria-busy="true">
        <h1 className="sr-only">Loading your account</h1>
        <Loader2 aria-hidden="true" className="h-8 w-8 animate-spin text-emerald-400" />
        <span role="status" className="sr-only">Loading your account</span>
      </main>
    );
  }

  if (initializationError) return <AccountRecovery />;

  if (!user) {
    const attemptedPath = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" state={{ from: attemptedPath }} replace />;
  }

  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
