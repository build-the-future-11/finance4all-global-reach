import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const { user, loading, needsOnboarding } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user) {
      navigate(needsOnboarding ? "/onboarding" : "/portal", { replace: true });
    } else {
      const timer = setTimeout(() => navigate("/login", { replace: true }), 2500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, needsOnboarding, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#060a12] text-white">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      <p className="text-sm text-white/50">Completing sign in…</p>
    </div>
  );
}
