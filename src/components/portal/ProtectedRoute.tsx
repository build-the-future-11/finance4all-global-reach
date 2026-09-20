import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060a12]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user) {
    const attemptedPath = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" state={{ from: attemptedPath }} replace />;
  }

  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
